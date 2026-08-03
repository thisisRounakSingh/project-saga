#!/usr/bin/env bash
# extract-git-log.sh — deterministic, token-cheap extraction of commit history.
#
# Why this exists: asking Codex to improvise `git log` invocations means the
# output shape (and therefore the token cost of reading it) varies run to
# run. This script always produces the same four files, in chronological
# order, containing only metadata and line-count stats — never full diffs.
#
# Usage:
#   scripts/extract-git-log.sh [output_dir]
#
# Output (all chronological, oldest commit first):
#   <output_dir>/commits.tsv         one line per commit: hash\author\date\subject
#   <output_dir>/numstat.txt         per-commit "@@<hash>" marker + numstat lines
#   <output_dir>/first-appearance.tsv  path, hash, date of each file's first commit
#   <output_dir>/repo-facts.txt      key=value facts for the schema's `repo` block
#
# None of these files contain file content — only paths and line counts.
set -euo pipefail

OUT_DIR="${1:-.saga}"
mkdir -p "$OUT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "error: not inside a git repository" >&2
  exit 1
fi

# 1. One line per commit: hash, author, ISO date, subject.
#    \x1f (unit separator) is used as the delimiter, not comma/pipe, so a
#    commit subject containing a comma or pipe can never corrupt parsing.
git log --reverse --no-color --date=iso-strict \
  --pretty=format:'%H%x1f%an%x1f%ad%x1f%s' \
  > "$OUT_DIR/commits.tsv"

# 2. Numstat (insertions, deletions, path) per commit — never full diffs.
#    Each commit's block is preceded by a "@@<hash>" marker line so it can be
#    sliced by hash range later without re-invoking git.
git log --reverse --no-color --numstat --pretty=format:'@@%H' \
  > "$OUT_DIR/numstat.txt"

# 3. First appearance of every path ever tracked, in chronological order.
#    Used for stable canvas layout ordering (nodes keep the same relative
#    position across acts instead of jumping), computed once instead of
#    re-derived by the model on every act.
git log --reverse --no-color --diff-filter=A --name-only \
  --pretty=format:'@@%H%x1f%ad' --date=iso-strict \
  | awk '
      /^@@/ { split(substr($0,3), parts, "\x1f"); hash=parts[1]; date=parts[2]; next }
      NF { print $0 "\t" hash "\t" date }
    ' > "$OUT_DIR/first-appearance.tsv"

# 4. Repo-level facts needed for the schema's top-level `repo` block.
{
  echo "name=$(basename "$(git rev-parse --show-toplevel)")"
  echo "url=$(git config --get remote.origin.url || echo '')"
  echo "totalCommits=$(git rev-list --count HEAD)"
  echo "firstCommitDate=$(git log --reverse --date=short --pretty=format:'%ad' | head -1)"
  echo "lastCommitDate=$(git log -1 --date=short --pretty=format:'%ad')"
  echo "contributors=$(git log --pretty=format:'%an' | sort -u | wc -l | tr -d ' ')"
} > "$OUT_DIR/repo-facts.txt"

wc -l < "$OUT_DIR/commits.tsv" | xargs -I{} echo "wrote {} commits to $OUT_DIR/commits.tsv"
echo "wrote $OUT_DIR/numstat.txt, first-appearance.tsv, repo-facts.txt"
