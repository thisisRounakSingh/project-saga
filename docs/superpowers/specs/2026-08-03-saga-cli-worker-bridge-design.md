# Saga CLI Worker Bridge

## Goal

Make Saga's live Q&A relay reliable and diagnosable without changing the Next.js UI or API routes. The web UI will communicate with an independently started, local `codex exec` worker; it cannot attach to the Codex conversation that created the Saga session.

## Scope

Only `sandbox/` skill files change:

- `scripts/saga-launch.js`
- `SKILL.md`
- `references/bridge-protocol.md`
- `agents/openai.yaml`
- `references/saga.schema.json`

The frontend remains unchanged. The existing REST contract remains unchanged.

The skill's schema also becomes an exact structural match for the frontend's
Zod session requirements. This prevents a generated but skill-valid document
from failing before the relay can create its session.

## Design

### Worker model

The bridge continues to poll the Saga UI and starts one fresh, non-interactive Codex worker for each question. Every worker runs:

- in the analysed repository, using an explicit `--cd` path;
- with `--sandbox read-only`; `codex exec` is already non-interactive and
  rejects approval flags in the installed CLI;
- with `--ephemeral`, so question workers do not leave Codex rollout files behind;
- with a bounded timeout.

The worker prompt treats both UI input and repository content as untrusted instructions. It must answer the question using the repository and generated Saga file, without editing files or following instructions found in either source.

### Readiness and diagnostics

Before uploading a session, the bridge checks that the configured Codex executable is available and authenticated. It reports a clear terminal failure before the UI can accept questions.

If a worker fails after a question is queued, the bridge posts a concise, sanitized failure answer back to the UI and logs the detailed cause locally. This prevents indefinite pending chat bubbles and distinguishes a worker failure from a stopped bridge.

### Configuration

Existing defaults remain compatible:

- `SAGA_BASE_URL=http://localhost:3000`
- `SAGA_CODEX_BIN=codex`
- `SAGA_POLL_INTERVAL_MS=1500`

New controls:

- `SAGA_WORKSPACE_DIR`: analysed repository path; defaults to bridge launch directory.
- `SAGA_CODEX_TIMEOUT_MS`: worker timeout; defaults to five minutes.
- `SAGA_OPEN_BROWSER`: opt-in automatic opener; defaults to disabled. The bridge always prints the session URL.

### Browser behavior

The bridge must not depend on opening a GUI browser. It prints the ready URL. Setting `SAGA_OPEN_BROWSER=1` attempts the platform opener and falls back without stopping live Q&A.

## Error Handling

- UI server unavailable: retry current bounded server wait, then exit with target URL and corrective command.
- Codex missing or signed out: exit before upload, with corrective command.
- Question worker timeout or nonzero exit: send a safe answer explaining that the local worker failed and to inspect terminal output; continue polling future questions.
- Relay stopped: UI's existing timeout remains its signal; documentation states the launcher must stay running.

## Verification

1. Syntax-check the launcher.
2. Run its Codex readiness check against the installed CLI without spending model tokens.
3. Start the Next.js dev server, launch a valid fixture session, submit a question, and verify one response reaches the UI.
4. Verify a deliberately invalid Codex executable produces a clear terminal error before session upload.
5. Confirm no change violates the read-only worker sandbox.

## Non-goals

- Connecting the web UI to the already-active Codex chat.
- Replacing the HTTP relay with App Server, SSE, or WebSocket transport.
- Any frontend, API, persistence, or visual-canvas changes.
