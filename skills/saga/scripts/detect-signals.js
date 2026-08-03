#!/usr/bin/env node
/**
 * detect-signals.js — turns the raw output of extract-git-log.sh into a
 * small, bounded-size digest of "candidate act boundary" signals.
 *
 * WHY THIS SCRIPT EXISTS (read this before skipping it):
 * The whole point of a deterministic signal pass is that Codex should never
 * have to read commits.tsv / numstat.txt commit-by-commit for a repo with
 * thousands of commits just to *find* where the acts probably break. That
 * kind of "eyeball the whole log" clustering is the single biggest token
 * sink in this workflow, and it gets worse linearly with repo size. This
 * script computes the same signals a careful human would look for —
 * activity gaps, file-extension churn, rewrite/migrate/remove keywords —
 * in plain code, once, deterministically. Codex then reads signals.json
 * (which stays small regardless of whether the repo has 80 commits or
 * 8,000) and only dips into the raw per-commit files for the narrow
 * hash range of the act it is currently writing.
 *
 * Usage:
 *   node scripts/detect-signals.js <saga_dir> [--gap-days=21] [--churn-window-days=45]
 *
 * Reads:  <saga_dir>/commits.tsv, numstat.txt  (from extract-git-log.sh)
 * Writes: <saga_dir>/signals.json
 */
'use strict';
const fs = require('fs');
const path = require('path');

const KEYWORD_RE = /\b(rewrite|rewritten|migrate|migration|remove|removed|deprecate|deprecated|drop|dropped|replace|replaced|port|ported|overhaul|refactor)\b/i;

function parseArgs(argv) {
  const out = { sagaDir: argv[2] || '.saga', gapDays: 21, churnWindowDays: 45 };
  for (const a of argv.slice(3)) {
    const m = /^--([\w-]+)=(.+)$/.exec(a);
    if (!m) continue;
    if (m[1] === 'gap-days') out.gapDays = Number(m[2]);
    if (m[1] === 'churn-window-days') out.churnWindowDays = Number(m[2]);
  }
  return out;
}

function readLines(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.length > 0);
}

function parseCommits(sagaDir) {
  return readLines(path.join(sagaDir, 'commits.tsv')).map((line) => {
    const [hash, author, date, ...subjectParts] = line.split('\u001f');
    return { hash, author, date, subject: subjectParts.join('\u001f') };
  });
}

/** Returns Map<hash, {insertions, deletions, files: [{path, ins, del}], extAdded:Set, extRemoved:Set}> */
function parseNumstat(sagaDir) {
  const lines = readLines(path.join(sagaDir, 'numstat.txt'));
  const byHash = new Map();
  let current = null;
  for (const line of lines) {
    if (line.startsWith('@@')) {
      current = { insertions: 0, deletions: 0, files: [] };
      byHash.set(line.slice(2), current);
      continue;
    }
    if (!current) continue;
    const parts = line.split('\t');
    if (parts.length < 3) continue; // binary files show "-\t-\tpath"
    const [insStr, delStr, filePath] = parts;
    const ins = insStr === '-' ? 0 : Number(insStr);
    const del = delStr === '-' ? 0 : Number(delStr);
    current.insertions += ins;
    current.deletions += del;
    current.files.push({ path: filePath, insertions: ins, deletions: del });
  }
  return byHash;
}

function extOf(filePath) {
  const base = path.basename(filePath);
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot) : '(none)';
}

function daysBetween(isoA, isoB) {
  return Math.abs(new Date(isoB) - new Date(isoA)) / 86400000;
}

function isoWeek(dateStr) {
  const d = new Date(dateStr);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((target - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function main() {
  const { sagaDir, gapDays, churnWindowDays } = parseArgs(process.argv);
  const commits = parseCommits(sagaDir);
  const numstat = parseNumstat(sagaDir);

  if (commits.length === 0) {
    console.error(`no commits found in ${sagaDir}/commits.tsv — run extract-git-log.sh first`);
    process.exit(1);
  }

  // --- 1. Activity gaps: candidate act boundaries by elapsed time ---
  const gapBoundaries = [];
  for (let i = 1; i < commits.length; i++) {
    const gap = daysBetween(commits[i - 1].date, commits[i].date);
    if (gap >= gapDays) {
      gapBoundaries.push({
        afterCommit: commits[i - 1].hash,
        beforeCommit: commits[i].hash,
        date: commits[i].date,
        reason: 'activity_gap',
        gapDays: Math.round(gap * 10) / 10,
      });
    }
  }

  // --- 2. Keyword commits: rewrite/migrate/remove/deprecate language ---
  const keywordCommits = commits
    .filter((c) => KEYWORD_RE.test(c.subject))
    .map((c) => ({
      hash: c.hash,
      date: c.date,
      subject: c.subject,
      keyword: KEYWORD_RE.exec(c.subject)[1].toLowerCase(),
    }));

  // --- 3. Extension churn: an extension disappearing while another rises ---
  // For every commit, track which extensions were only-added vs only-removed
  // (net insertions vs a file going to zero net lines is a rough proxy —
  // this stays intentionally simple; it is a *signal* for Codex to weigh,
  // not a verdict).
  const extEvents = [];
  for (const c of commits) {
    const stat = numstat.get(c.hash);
    if (!stat) continue;
    const addedExts = new Set();
    const removedExts = new Set();
    for (const f of stat.files) {
      const ext = extOf(f.path);
      if (f.deletions > 0 && f.insertions === 0) removedExts.add(ext);
      else if (f.insertions > 0) addedExts.add(ext);
    }
    const meaningfulAdd = [...addedExts].filter((e) => !removedExts.has(e));
    const meaningfulRemove = [...removedExts].filter((e) => !addedExts.has(e));
    if (meaningfulAdd.length && meaningfulRemove.length) {
      extEvents.push({
        hash: c.hash,
        date: c.date,
        subject: c.subject,
        extensionsAdded: meaningfulAdd,
        extensionsRemoved: meaningfulRemove,
      });
    }
  }
  // Merge extension events that fall within churnWindowDays of each other and
  // involve the same swap direction — a migration is rarely one commit.
  const extensionMigrations = [];
  for (const ev of extEvents) {
    const last = extensionMigrations[extensionMigrations.length - 1];
    if (
      last &&
      daysBetween(last.lastDate, ev.date) <= churnWindowDays &&
      last.extensionsAdded.some((e) => ev.extensionsAdded.includes(e)) &&
      last.extensionsRemoved.some((e) => ev.extensionsRemoved.includes(e))
    ) {
      last.commits.push(ev.hash);
      last.lastDate = ev.date;
    } else {
      extensionMigrations.push({
        extensionsAdded: ev.extensionsAdded,
        extensionsRemoved: ev.extensionsRemoved,
        firstDate: ev.date,
        lastDate: ev.date,
        commits: [ev.hash],
      });
    }
  }

  // --- 4. Weekly activity roll-up (for canvas/overview use, not clustering) ---
  const byWeek = new Map();
  for (const c of commits) {
    const wk = isoWeek(c.date);
    const stat = numstat.get(c.hash) || { insertions: 0, deletions: 0, files: [] };
    const entry = byWeek.get(wk) || { week: wk, commits: 0, filesChanged: 0 };
    entry.commits += 1;
    entry.filesChanged += stat.files.length;
    byWeek.set(wk, entry);
  }

  const signals = {
    totalCommits: commits.length,
    dateRange: { start: commits[0].date, end: commits[commits.length - 1].date },
    gapBoundaries,
    keywordCommits,
    extensionMigrations,
    activityByWeek: [...byWeek.values()],
  };

  const outFile = path.join(sagaDir, 'signals.json');
  fs.writeFileSync(outFile, JSON.stringify(signals, null, 2));
  console.log(`wrote ${outFile}`);
  console.log(
    `  ${commits.length} commits, ${gapBoundaries.length} gap boundaries, ` +
      `${keywordCommits.length} keyword commits, ${extensionMigrations.length} extension migrations`
  );
}

main();
