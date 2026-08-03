# Connecting to the running Saga UI (dev mode) and live Q&A

While the frontend isn't deployed yet, the last step of the skill talks to
your **local dev server**, not the hosted relay. Everything below is the
same protocol either way — only the base URL changes.

## Base URL

`scripts/saga-launch.js` reads `SAGA_BASE_URL` and defaults to
`http://localhost:3000` if it's unset. That's the one thing that changes
between now and shipping:

```bash
# now, while developing (default — no env var needed):
node scripts/saga-launch.js project.saga.json

# later, once deployed:
SAGA_BASE_URL=https://saga.vercel.app node scripts/saga-launch.js project.saga.json
```

Before starting the relay, make sure the frontend's dev server is actually
running (`npm run dev` in the frontend project, typically on port 3000). The
bridge first verifies its local Codex executable and login, then waits for
the server — see "Waiting for the server" below.

## The five endpoints the bridge and frontend both use

Same contract in dev and prod; only the host differs.

| Method | Path | Called by | Purpose |
|---|---|---|---|
| `POST` | `/api/sessions` | bridge (once, at launch) | Upload `project.saga.json`, get back a `sessionId` |
| `GET` | `/api/sessions/[id]` | frontend (on page load) | Load the saga data to render |
| `POST` | `/api/sessions/[id]/ask` | frontend (on user question) | Submit a live question |
| `GET` | `/api/sessions/[id]/questions` | bridge (polling) | Fetch questions since a cursor |
| `POST` | `/api/sessions/[id]/answer` | bridge (after `codex exec`) | Post the answer back |

The bridge never calls `/ask` and never calls `GET /api/sessions/[id]` — it
only uploads once and then relays answer <-> questions. The frontend never
talks to Codex directly; it only ever talks to these same-origin routes.

## Worker boundary

The relay cannot attach to an already-active Codex chat. For every UI
question, it starts a separate local `codex exec` worker. That worker uses
saved local CLI authentication, is rooted at `SAGA_WORKSPACE_DIR` (or the
launch directory), runs in noninteractive automation mode, and is ephemeral. Keep
the launcher process alive for the full Q&A session. `codex exec` is
non-interactive; do not pass approval flags to it.

This is intentional isolation, not a persistent conversation. The generated
Saga file and repository remain available to every question worker, but an
earlier worker's chat context does not carry over.

## What the skill's last step actually does

1. Check that `SAGA_CODEX_BIN` exists and `codex login status` succeeds.
2. Wait for `SAGA_BASE_URL` to respond to anything (even a 404 counts —
   only a connection refusal means the dev server isn't up).
3. `POST project.saga.json` to `/api/sessions`, get `sessionId`.
4. Print `<SAGA_BASE_URL>/s/<sessionId>`. Automatic browser opening is
   disabled by default; set `SAGA_OPEN_BROWSER=1` to opt in. A missing opener
   never takes down the rest of the bridge.
5. Enter a polling loop (`SAGA_POLL_INTERVAL_MS`, default 1500ms) against
   `/api/sessions/<id>/questions?since=<cursor>`.
6. For each new question: run a bounded, ephemeral Codex automation worker in
   `SAGA_WORKSPACE_DIR`, read its final output, then `POST` it to
   `/api/sessions/<id>/answer`.
7. On `Ctrl-C`, exit cleanly. The frontend should treat a bridge that's
   stopped answering as "Saga disconnected," not hang indefinitely — that's
   a frontend concern, but worth knowing when you're testing the bridge in
   isolation.

## Worker sandbox note

Every question answered through this loop originated from whoever is
looking at the browser tab — which, once this is deployed, could be anyone
with the session link, not just you at your own keyboard. Treat that as a
lower-trust trigger than a prompt you typed yourself. The network-isolated
read-only sandbox cannot call the model service; the local worker uses the
automation bypass with a prompt that forbids edits and treats UI/repository
text as untrusted data. Keep the bridge local/private.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `SAGA_BASE_URL` | `http://localhost:3000` | Saga UI base URL |
| `SAGA_CODEX_BIN` | `codex` | Codex executable used for UI workers |
| `SAGA_WORKSPACE_DIR` | bridge launch directory | Repository supplied to each worker |
| `SAGA_POLL_INTERVAL_MS` | `1500` | Question polling interval |
| `SAGA_CODEX_TIMEOUT_MS` | `60000` | Per-question worker timeout in milliseconds |
| `SAGA_OPEN_BROWSER` | unset | Set to `1` to opt into automatic browser opening |

## Waiting for the server

If you run the skill's last step before `npm run dev` is up, you'll see:

```
[saga] waiting for the Saga dev server at http://localhost:3000 — run `npm run dev` in the frontend if you haven't.
```

It keeps retrying (20 attempts, 1s apart, by default) rather than failing
immediately — the common case during development is "the frontend just
hasn't finished starting yet," not "something is actually broken."

## Troubleshooting

- **"could not reach http://localhost:3000 after 20 attempts"** — the dev
  server isn't running, or it's on a different port. Start it, or override
  `SAGA_BASE_URL` to match the actual port.
- **Browser doesn't open automatically** — the bridge printed the URL to
  the terminal; open it by hand, or set `SAGA_OPEN_BROWSER=1`. This is
  expected on headless machines and in some containers.
- **Bridge exits before a session URL** — it could not find or authenticate
  Codex. Run `codex login`, or set `SAGA_CODEX_BIN` to the right executable.
- **Question reports a local Codex worker failure** — inspect the bridge
  terminal for its detailed error, confirm the bridge is still running, then
  resend the question. A `Ctrl-C` stops live Q&A even though the loaded
  session remains viewable.
