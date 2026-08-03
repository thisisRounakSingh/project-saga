# Reading history efficiently, and clustering it into acts

Read this before you start reading raw git output. The single biggest token
sink in this whole workflow is treating "cluster the history into acts" as a
task where you personally scan a commit log line by line. For a small repo
that's wasteful; for a repo the size of `microsoft/vscode` (thousands of
commits) it's the difference between a cheap run and a very expensive one.
The extraction is split into two stages specifically to avoid that.

## Stage 1: raw extraction (`scripts/extract-git-log.sh`)

Produces, in `<saga_dir>/`:

| File | Contents | Never contains |
|---|---|---|
| `commits.tsv` | one line per commit: `hash\x1fauthor\x1fdate\x1fsubject`, chronological | commit bodies, diffs |
| `numstat.txt` | `@@<hash>` marker + `insertions\tdeletions\tpath` per changed file | file content |
| `first-appearance.tsv` | path, hash, date of each file's first commit | file content |
| `repo-facts.txt` | name, url, totalCommits, date range, contributor count | — |

This stage is deterministic on purpose. Don't re-derive it with ad hoc
`git log` flags — the whole point is that the shape (and therefore the token
cost of reading it) is identical every run.

## Stage 2: signal detection (`scripts/detect-signals.js`)

Run this immediately after Stage 1:

```
node scripts/detect-signals.js <saga_dir> [--gap-days=21] [--churn-window-days=45]
```

This compresses `commits.tsv` + `numstat.txt` — which scale linearly with
repo size — into `signals.json`, which does **not**: it's a fixed handful of
candidate signals regardless of whether the repo has 80 commits or 8,000.
**Read `signals.json`, not the raw files, to decide where acts begin and
end.** It contains:

- `gapBoundaries` — pairs of adjacent commits separated by more than
  `--gap-days` (default 21) of silence. The single strongest signal for "a
  new act starts here": a long pause usually means a return to the project
  after time away, a pivot, or a new contributor picking it up.
- `keywordCommits` — every commit whose subject matches
  `rewrite|migrate|remove|deprecate|drop|replace|port|overhaul|refactor`
  (case-insensitive). These are candidates for `keyCommits` entries and for
  Q&A pre-baking (see `qa-and-confidence.md`) — they're exactly the kind of
  change a new hire would ask "why" about.
- `extensionMigrations` — windows where one file extension was net-added
  while another was net-removed (e.g. `.js` out, `.ts` in), merged together
  if they're within `--churn-window-days` of each other. This is your
  "language A to B" signal. It is a **signal**, not a verdict — always
  weigh it against the actual keyword commits and narration you write, don't
  copy it into the output verbatim.
- `activityByWeek` — a rollup for context / overview purposes, not itself a
  clustering signal.

## Turning signals into acts

1. Start from `gapBoundaries` as your first-pass act split.
2. Adjust using `keywordCommits` and `extensionMigrations` — if a gap
   boundary and a migration/keyword cluster don't quite line up, prefer
   splitting at the commit where the actual keyword/migration commit sits,
   not exactly at the silence.
3. Merge acts that are too small to say anything about (a single commit
   between two gaps, with no keyword or migration signal, usually belongs
   folded into its neighbor).
4. Don't force a fixed act count. A six-year, three-rewrite project might be
   5–12 acts; a young repo with one steady period might be 2–3. Let the
   signals decide, not a target number.

## Reading one act's actual commits (windowed, not the whole log)

Once you've settled on act boundaries (a `from` hash and a `to` hash per
act), pull **only that act's slice** to write its narration, key commits,
and module diff:

```
scripts/slice-act.sh <saga_dir> <from_hash_or_ROOT> <to_hash>
```

This prints just that range from `commits.tsv` and `numstat.txt` — nothing
before or after it. Process acts one at a time, in order, and treat each
act's slice as disposable once you've written that act's JSON: don't keep
accumulating every act's raw commit text in your working context as you move
through the repo's history. The running total should be "the signals file,
plus whatever the current act's slice is" — not "the entire log so far."

## When (rarely) you need actual code, not just metadata

Metadata is enough for narration and module diffing in the overwhelming
majority of cases — you're describing what changed and roughly how much,
not reviewing the code. The one place you may need more is verifying a
causal claim during self-review (see `qa-and-confidence.md`). If so:

- Target **one file, one commit** — e.g. `git show <hash> -- path/to/file`
  or `git log -p -1 <hash> -- path/to/file` — never a whole-act or
  whole-repo diff.
- Prefer the commit **message body** first (already sitting in
  `commits.tsv`... actually the body isn't in commits.tsv by design, since
  bodies can be long and most are empty — if a commit's subject alone is
  ambiguous and you suspect the body has the reason, `git log -1 --format=%B
  <hash>` for that one commit is cheap and worth it before reaching for a
  diff).
- If you still can't find a stated reason after that one targeted look,
  that's your answer: label the claim `inferred`, don't keep digging.

## Hard budget rules

- Never run `git log -p`, `git show`, or `git diff` across an entire act's
  range or the whole repo. One commit, one file, at most, and only when
  metadata genuinely isn't enough.
- Never load the full `commits.tsv` / `numstat.txt` into context at once for
  a repo with more than ~500 commits. Read `signals.json` for the overview,
  then only the current act's slice.
- If you find yourself about to re-run `git log` with new flags to "double
  check something," check `signals.json` first — the signal you want may
  already be computed there.
