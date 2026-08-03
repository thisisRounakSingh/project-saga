import Link from "next/link";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { CursorSwitcher } from "../components/CursorSwitcher";
import { FooterName } from "../components/FooterName";
import { ArrowLeft } from "lucide-react";

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono selection:bg-accent selection:text-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b-[3px] border-border">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-2xl font-black uppercase tracking-wider hover:text-accent transition-colors"
          >
            SAGA
          </Link>
          <span className="hidden md:inline-block text-xs uppercase tracking-widest font-semibold opacity-80">
            THE CODEBASE YOU INHERITED
          </span>
          <Link
            href="/learn"
            className="text-xs uppercase tracking-widest font-bold hover:text-accent transition-colors text-accent ml-4 border-l-[3px] border-border pl-4"
          >
            LEARN
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase">
          <Link
            href="/"
            className="bg-inverted-bg text-inverted-fg px-4 py-1 text-xs border-[3px] border-border hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back
          </Link>
          <CursorSwitcher />
          <ThemeSwitcher />
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-8 flex-1 flex flex-col max-w-5xl mx-auto w-full">
        <div className="border-[3px] border-border bg-dots mb-12 shadow-[8px_8px_0_var(--color-border)] dark:shadow-[8px_8px_0_#fff]">
          <div className="bg-background m-4 md:m-8 p-6 md:p-12 border-[3px] border-border">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8">
              Project Description
            </h1>

            <div className="space-y-8 text-lg font-medium leading-relaxed">
              <section>
                <h2 className="text-2xl font-black uppercase tracking-widest mb-4 text-accent border-b-[3px] border-border pb-2">
                  What Saga Does
                </h2>
                <p className="mb-4">
                  Codex reads a repo&apos;s entire git history and hands off a
                  file to a hosted, canvas-based app where the architecture
                  diagram visibly grows and reshapes itself in sync with a
                  narrated, question-answering tour of how — and why — the
                  codebase became what it is.
                </p>
                <p>
                  You run a Codex skill (<code>$saga</code>) against a cloned
                  repo. Codex reads the full commit history, clusters it into
                  acts, writes a narration for each one, pre-bakes answers to
                  the causal questions a new hire would actually ask (&quot;why
                  did the shell become a WebSocket?&quot;), and diffs the module
                  structure act-to-act. That file gets handed to a hosted web
                  app: the architecture diagram redraws itself as you scroll or
                  press play, narration runs alongside it, and you can ask Codex
                  — the same Codex installed on your machine — anything else
                  about the history, right from the page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black uppercase tracking-widest mb-4 text-accent border-b-[3px] border-border pb-2">
                  What Makes It Unique
                </h2>
                <ul className="list-disc pl-6 space-y-4">
                  <li>
                    <strong>
                      The diagram is the headline, the narrative is the
                      supporting track.
                    </strong>{" "}
                    Nothing out there renders an architecture diagram that
                    grows, shrinks, and reshapes itself act to act. That&apos;s
                    the one mechanic worth leading a demo with.
                  </li>
                  <li>
                    <strong>
                      It&apos;s built around causal &quot;why,&quot; not just
                      &quot;what happened.&quot;
                    </strong>{" "}
                    The pre-baked Q&A explicitly targets the questions a git log
                    can&apos;t answer on its own — a stack swap, a language
                    migration, a removal — and labels each answer{" "}
                    <code>confirmed</code> or <code>inferred</code>.
                  </li>
                  <li>
                    <strong>
                      Live Q&A is grounded in your own local Codex.
                    </strong>{" "}
                    The chat panel in the browser is answered by the same Codex
                    session running on your machine, not a shared backend model.
                  </li>
                  <li>
                    <strong>One model, end to end.</strong> Every step —
                    extraction, clustering, narration, self-review, live chat —
                    is Codex.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black uppercase tracking-widest mb-4 text-accent border-b-[3px] border-border pb-2">
                  How to Install and Use
                </h2>
                <div className="bg-inverted-bg text-inverted-fg p-6 border-[3px] border-border my-6">
                  <h3 className="text-xl font-bold mb-4 uppercase text-accent">
                    Running the UI locally
                  </h3>
                  <div className="mb-4 text-sm opacity-90 space-y-2">
                    <p>
                      <strong>Note:</strong> The web-UI deployed at Vercel is
                      not tested enough and requires many fixes. We highly
                      advise cloning the UI and running it from localhost for
                      the best experience and to avoid any cross-origin issues
                      with the local Codex instance.
                    </p>
                    <p>
                      The whole environment was thoroughly tested on Ubuntu.
                      Currently, only macOS and Linux-based systems are
                      supported.
                    </p>
                  </div>

                  <pre className="bg-background text-foreground p-4 border-[3px] border-border overflow-x-auto text-sm font-mono mb-6">
                    {`# 1. Clone the repository
git clone https://github.com/thisisRounakSingh/project-saga.git
cd project-saga

# 2. Install dependencies
npm install

# 3. Start the UI
npm run dev

# The UI will be available at http://localhost:3000`}
                  </pre>

                  <h3 className="text-xl font-bold mb-4 uppercase text-accent mt-6">
                    Running the Skill
                  </h3>
                  <p className="mb-4 text-sm opacity-90">
                    First, install the skill via the skills.sh CLI. Then, once
                    the UI is running, you can run the skill against any
                    repository you have cloned locally.
                  </p>

                  <pre className="bg-background text-foreground p-4 border-[3px] border-border whitespace-pre-wrap wrap-break-word text-sm font-mono">
                    {`# 1. Install the skill
npx skills add thisisRounakSingh/project-saga

# 2. In your target repository directory, run the skill
codex "$saga use the skill to explain me this repo, open the browser if possible or else share the url."

# This will generate a project.saga.json file 
# and give you a link to open it in the UI.`}
                  </pre>

                  <p className="mt-4 text-sm opacity-90">
                    <strong>Note:</strong> We highly recommend using the local
                    UI. If you do, make sure to explicitly tell Codex in your
                    prompt that the base URL is{" "}
                    <code>http://localhost:3000</code>.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-8 pb-8 text-center text-sm font-bold tracking-widest uppercase flex flex-col sm:flex-row items-center justify-center gap-2 border-t-[3px] border-border bg-background z-10 relative">
        <span>Orchestrated By</span>
        <FooterName />
      </footer>
    </div>
  );
}
