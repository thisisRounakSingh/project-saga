# Saga: The Codebase You Inherited

[![skills.sh](https://skills.sh/b/thisisRounakSingh/project-saga)](https://skills.sh/thisisRounakSingh/project-saga/saga)

> [!WARNING]
> **🚧 Under Construction:** This project is still under testing and requires major improvements.

Saga is a tool and visualizer that reads a repository's entire git history and narrates it over time. It walks the git log, clusters commits into acts, and diffs the dependency graph between versions to create a `.saga.json` document.

Press play on the frontend, and the architecture diagram morphs version by version. Pause at any panel and ask questions to understand the historical context behind architectural decisions. No streaming, no auth, no vendor lock—just pure repository history exploration.

## How to Use Saga (Testing Phase)

> [!NOTE]
> **OS Compatibility:** The Saga skill currently relies on bash scripts to parse git history, so it only natively supports **macOS and Linux**. (Windows users may need to use WSL).

To test the Saga skill in your desired repository, follow these step-by-step instructions:

### Step 1: Install the Skill

You can install this skill in two ways:

#### Option A: Install via skills.sh CLI (Recommended)

Run the following command in the root of your target repository:

```bash
npx skills add thisisRounakSingh/project-saga
```

*(You can also visit [skills.sh/thisisRounakSingh/project-saga](https://skills.sh/thisisRounakSingh/project-saga) for more details once the repository is fully indexed by the registry).*

#### Option B: Manual Installation

1. Navigate to the repository where you want to run Saga.
2. Create an agent skills directory by running: `mkdir -p .agents/skills`
3. Copy the `codex-skill` folder from this (Saga) repository into your target repository's `.agents/skills` directory, renaming it to `saga`.
   For example: `cp -r /path/to/project-saga/skills/saga .agents/skills/saga`

### Step 2: Trigger the Skill with Codex

By default, the skill connects to the deployed Saga UI at `https://project-saga-snowy.vercel.app/`.

1. Open your target repository in your IDE where Codex is running.
2. Prompt Codex with an instruction similar to this:
   > "Please use the Saga skill to explain this repository. Make sure to explicitly turn on the browser and inform me when it is ready."
3. Codex will automatically discover the skill and execute the background scripts (parsing the git history and clustering commits).
4. Codex will then communicate with the Saga UI via a bridge to create a new session and will open the visualization in your browser.

*(Optional)* If you wish to run the UI locally instead:

1. Start the local UI server from the Saga repository: `npm run dev`
2. Set the environment variable `SAGA_BASE_URL=http://localhost:3000` when running the skill.

### Step 3: Explore

1. Codex should inform you when the session is successfully created and provide the session URL (e.g., `https://project-saga-snowy.vercel.app/s/<session-id>`).
2. Open the URL to view the timeline.
3. Press **Play** to watch the architectural changes morph over time, and use the side panel to chat with Codex about specific historical contexts or decisions.

---

#### Orchestrated By Rounak Singh

- Instagram: [@thisisrounaksingh](https://instagram.com/thisisrounaksingh)
- X: [@thisisrounakx](https://x.com/thisisrounakx) & [@ultronxnet](https://x.com/ultronxnet)
