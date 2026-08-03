# Pre-baking Q&A and the confirmed/inferred rule

This is the part of Saga that actually differentiates it from a plain
commit-history-to-timeline tool. Get this rule wrong and Saga's whole pitch
("answers the why") falls apart the first time it confidently invents a
reason no commit ever stated.

## Where questions come from

For every act, look at `signals.json`'s `keywordCommits` and
`extensionMigrations` entries that fall inside that act's range — each one
is a candidate question. Don't wait for a human to curate these; that's the
point of pre-baking. Typical shapes:

- An extension migration → *"Why did `<component>` move from `<ext A>` to
  `<ext B>`?"*
- A keyword commit containing "remove"/"deprecate"/"drop" → *"Why was
  `<thing>` removed?"*
- A keyword commit containing "rewrite"/"refactor"/"overhaul" → *"Why was
  `<component>` rewritten?"*
- A module that disappears from one act's module list and doesn't
  reappear → *"What happened to `<module>`?"* even without a keyword commit.

Write one Q&A pair per real signal in the act, not a fixed count per act —
an act with no migration/removal signals may reasonably have zero or one
pre-baked question; an act with three overlapping signals may have three.

## The confirmed / inferred rule

Every `qa[].confidence` value must be exactly one of two things:

- **`"confirmed"`** — a commit message (subject or body) in
  `supportingCommits` **states** the reason. The answer should be
  traceable to actual words in that commit, not just to the fact that the
  change happened.
- **`"inferred"`** — no commit says why. The answer is your best read of
  the pattern (what came before, what came after, what the change
  coincides with), clearly framed as inference, not fact.

**Never** write an answer that reads as confident and settled when it's
actually `inferred`. The `confidence` field is metadata the UI can display
as a badge, but the *answer text itself* should also carry the right amount
of hedging when the confidence is `inferred` — a reader skimming just the
answer, without noticing the badge, should still come away with the right
level of certainty.

| Confidence | Bad answer phrasing | Better answer phrasing |
|---|---|---|
| inferred | "The shell moved to a WebSocket to sandbox the renderer process." | "No commit states a reason directly; the change coincides with sandboxing work in the same act, which is the most likely driver." |
| confirmed | "The team apparently rewrote the config for TypeScript." | "The commit message explicitly states the config was rewritten to adopt TypeScript." |

## Self-review pass

After every act has narration, modules, and Q&A drafted, do one pass over
just the Q&A entries (this is cheap — it's your own draft text plus, at
most, one targeted look at a supporting commit's message body per entry,
never a full diff):

1. For each `qa` entry, re-check: does a commit in `supportingCommits`
   actually **say** this, or does it just show the change happened? If the
   former, `confirmed`; if the latter, `inferred` — regardless of how
   plausible the inferred reason sounds.
2. If an entry is marked `confirmed` but you can't point to specific
   language in the commit that states the reason, downgrade it to
   `inferred`. When genuinely unsure, `inferred` is always the safer
   default — an under-confident tool is a minor inconvenience, an
   over-confident one is the failure mode that undercuts the whole product.
3. Check narration too, not just Q&A: any sentence in `narration[].text`
   that states a *reason* (not just a change) needs the same scrutiny. If
   narration asserts a "why" with no commit support, soften it to describe
   only the "what," and move the "why" (with appropriate hedging) into a
   `qa` entry instead, where the confidence label makes the uncertainty
   visible.
4. Flag anything you can't resolve rather than guessing past it — an act
   can ship with fewer Q&A entries; it should never ship with a
   confidently wrong one.
