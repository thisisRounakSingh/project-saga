# Saga: The Codebase You Inherited

> [!WARNING]
> **🚧 Under Construction:** This project is still under testing and requires major improvements.

Saga is a tool and visualizer that reads a repository's entire git history and narrates it over time. It walks the git log, clusters commits into acts, and diffs the dependency graph between versions to create a `.saga.json` document.

Press play on the frontend, and the architecture diagram morphs version by version. Pause at any panel and ask questions to understand the historical context behind architectural decisions. No streaming, no auth, no vendor lock—just pure repository history exploration.

## How to Use Saga (Testing Phase)

> [!NOTE]
> **OS Compatibility:** The Saga skill currently relies on bash scripts to parse git history, so it only natively supports **macOS and Linux**. (Windows users may need to use WSL).

To test the Saga skill in your desired repository, follow these step-by-step instructions:

### Step 1: Install the Skill

1. Navigate to the repository where you want to run Saga.
2. Create an agent skills directory by running: `mkdir -p .agents/skills`
3. Copy the `codex-skill` folder from this (Saga) repository into your target repository's `.agents/skills` directory, renaming it to `saga`.
   For example: `cp -r /path/to/project-saga/codex-skill .agents/skills/saga`

### Step 2: Start the Saga UI

1. In a separate terminal, navigate back to your **Saga** repository (`project-saga`).
2. Start the local UI server by running: `npm run dev`
3. Ensure the UI is running (typically on `http://localhost:3000`).

### Step 3: Trigger the Skill with Codex

1. Open your target repository in your IDE where Codex is running.
2. Prompt Codex with an instruction similar to this:
   > "Please use the Saga skill to explain this repository. Make sure to explicitly turn on the browser and inform me when it is ready."
3. Codex will automatically discover the local skill in `.agents/skills/saga` and execute the background scripts (parsing the git history and clustering commits).
4. Codex will then communicate with your locally running Saga UI via a bridge to create a new session and will open the visualization in your browser.

### Step 4: Explore

1. Codex should inform you when the session is successfully created and provide the local URL (e.g., `http://localhost:3000/s/<session-id>`).
2. Open the URL to view the timeline.
3. Press **Play** to watch the architectural changes morph over time, and use the side panel to chat with Codex about specific historical contexts or decisions.

---

#### Orchestrated By Rounak Singh

- Instagram: [@thisisrounaksingh](https://instagram.com/thisisrounaksingh)
- X: [@thisisrounakx](https://x.com/thisisrounakx) & [@ultronxnet](https://x.com/ultronxnet)
