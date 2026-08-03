#!/usr/bin/env bash
# slice-act.sh — print only the commits.tsv / numstat.txt lines for one act's
# commit range (inclusive), so writing one act never requires reading the
# full history back into context.
#
# Usage:
#   scripts/slice-act.sh <saga_dir> <from_hash> <to_hash>
#
# <from_hash> may be the literal string ROOT to mean "start of history".
# Both commits.tsv and numstat.txt are chronological (oldest first), so a
# single forward pass over each file is enough — no re-invocation of git.
set -euo pipefail

SAGA_DIR="$1"; FROM="$2"; TO="$3"

echo "### commits.tsv slice ($FROM..$TO) ###"
awk -F'\x1f' -v from="$FROM" -v to="$TO" '
  BEGIN { show = (from == "ROOT") }
  $1 == from { show = 1 }
  show { print }
  $1 == to { exit }
' "$SAGA_DIR/commits.tsv"

echo "### numstat.txt slice ($FROM..$TO) ###"
awk -v from="$FROM" -v to="$TO" '
  BEGIN { show = (from == "ROOT") }
  /^@@/ {
    hash = substr($0, 3)
    if (hash == from) show = 1
    if (show) print
    if (hash == to) { done = 1 }
    next
  }
  show { print }
  done && /^$/ { exit }
' "$SAGA_DIR/numstat.txt"
