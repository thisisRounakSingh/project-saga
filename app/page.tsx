import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { AsciiHero } from "./components/AsciiHero";
import { FooterName } from "./components/FooterName";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono selection:bg-accent selection:text-white">
      {/* Mobile "Store Closed" View */}
      <div className="md:hidden flex flex-col items-center justify-center min-h-screen p-6 text-center bg-dots">
        <div className="bg-background border-4 border-border p-8 shadow-[8px_8px_0_var(--color-border)] dark:shadow-[8px_8px_0_#fff] max-w-sm w-full relative">
          <div className="absolute -top-4 -left-4 bg-accent text-white font-black px-3 py-1 border-[3px] border-border -rotate-12 shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff]">
            CLOSED
          </div>
          <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">
            Saga
          </h1>
          <div className="w-full h-0.75 bg-border mb-6"></div>
          <div className="text-6xl font-black mb-6 select-none">(X_X)</div>
          <p className="text-lg font-black uppercase tracking-widest mb-4">
            Mobile View
            <br />
            Under Construction
          </p>
          <p className="text-xs font-bold tracking-widest text-muted border-t-[3px] border-border border-dashed pt-4 mt-4">
            Please visit on a tablet or desktop device to read the codebase.
          </p>
        </div>
      </div>

      {/* Desktop App View */}
      <div className="hidden md:flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-4 border-b-[3px] border-border">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black uppercase tracking-wider">
              SAGA
            </span>
            <span className="hidden md:inline-block text-xs uppercase tracking-widest font-semibold opacity-80">
              THE CODEBASE YOU INHERITED
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase">
            <button className="bg-inverted-bg text-inverted-fg px-4 py-1 text-xs border-[3px] border-border hover:opacity-80 transition-opacity">
              LOAD.SAGA &rarr;
            </button>
            <ThemeSwitcher />
          </div>
        </nav>

        {/* Main Hero Wrapper */}
        <main className="p-4 md:p-8 flex-1 flex flex-col">
          {/* Hero Box */}
          <div className="flex flex-col lg:flex-row w-full flex-1 border-[3px] border-border shadow-[8px_8px_0_var(--color-border)] dark:shadow-[8px_8px_0_#fff]">
            {/* Left Panel */}
            <div className="flex-1 flex flex-col relative border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-border bg-dots overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-bold tracking-widest text-right leading-tight z-20">
                PANEL
                <br />
                #001
              </div>

              <div className="p-8 md:p-16 flex flex-col flex-1 z-10">
                <p className="text-xs font-bold tracking-widest uppercase mb-4">
                  CHAPTER ONE
                </p>

                <div className="mb-12">
                  {/* Replaced static text with ASCII canvas animation */}
                  <AsciiHero />
                </div>

                <div className="bg-background border-[3px] border-border p-6 max-w-xl mb-12 shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff]">
                  <p className="text-lg leading-relaxed font-medium">
                    You cloned the repo. Six years of commits. Three rewrites.
                    Nobody left who remembers why the C++ shell became a
                    WebSocket.{" "}
                    <span className="bg-accent text-white px-2 py-0.5 inline-block">
                      Saga knows.
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-auto">
                  <button className="bg-inverted-bg text-inverted-fg px-8 py-4 text-sm font-bold tracking-widest uppercase border-[3px] border-border shadow-[4px_4px_0_var(--color-accent)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-accent)] transition-all">
                    LOAD.SAGA &rarr;
                  </button>
                  <button className="bg-background text-foreground px-8 py-4 text-sm font-bold tracking-widest uppercase border-[3px] border-border border-dashed hover:bg-border hover:text-background dark:hover:text-background transition-colors">
                    SKILL.MD
                  </button>
                </div>

                {/* Carousel */}
                <div className="mt-8 bg-black text-white border-[3px] border-border overflow-hidden flex py-4">
                  <div className="animate-marquee flex gap-8 px-4 text-sm font-bold tracking-widest uppercase w-max">
                  <span>CODEX</span> <span>•</span> <span>ARCH BTW</span>{" "}
                  <span>•</span> <span>REACT</span> <span>•</span>{" "}
                  <span>NEXT.JS</span> <span>•</span> <span>TYPESCRIPT</span>{" "}
                  <span>•</span> <span>RUST</span> <span>•</span>{" "}
                  <span>C++</span> <span>•</span> <span>JS</span>{" "}
                  <span>•</span> <span>GO</span> <span>•</span>{" "}
                  <span>PYTHON</span> <span>•</span> <span>WASM</span>{" "}
                  <span>•</span> <span>CODEX</span> <span>•</span>{" "}
                  <span>ARCH BTW</span> <span>•</span> <span>REACT</span>{" "}
                  <span>•</span> <span>NEXT.JS</span> <span>•</span>{" "}
                  <span>TYPESCRIPT</span> <span>•</span> <span>RUST</span>{" "}
                  <span>•</span> <span>C++</span> <span>•</span>{" "}
                  <span>JS</span> <span>•</span> <span>GO</span>{" "}
                  <span>•</span> <span>PYTHON</span> <span>•</span>{" "}
                  <span>WASM</span>
                </div>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-100 xl:w-125 flex flex-col bg-inverted-bg text-inverted-fg">
              <div className="p-8 flex-1 border-b-[3px] border-border">
                <p className="text-xs font-bold tracking-widest uppercase text-muted mb-6">
                  WHAT CODEX DOES
                </p>
                <h2 className="text-2xl font-black mb-8">
                  $ codex skill run saga
                </h2>

                <ul className="space-y-4 font-medium text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-muted">&rarr;</span>
                    <span>walks git log --reverse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted">&rarr;</span>
                    <span>clusters commits into acts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted">&rarr;</span>
                    <span>diffs the dependency graph</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted">&rarr;</span>
                    <span>
                      emits{" "}
                      <span className="bg-accent text-white px-1">
                        project.saga.json
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted">&rarr;</span>
                    <span>opens this page with it</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 bg-dots bg-background text-foreground border-border h-62.5 relative flex flex-col justify-center">
                <div className="bg-background p-4 border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff]">
                  <h3 className="text-xl font-black mb-2">
                    A play button for your repo.
                  </h3>
                  <p className="text-sm font-medium">
                    Press play, the architecture diagram morphs version by
                    version. Pause at any panel and ask codex a question.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Following sections (Steps) */}
          <section className="mt-16 flex flex-col md:flex-row border-[3px] border-border">
            {[
              "You open a repo",
              "Codex reads the history",
              "Saga narrates it",
            ].map((step, idx) => (
              <div
                key={idx}
                className={`flex-1 p-8 relative overflow-hidden bg-background ${idx !== 2 ? "border-b-[3px] md:border-b-0 md:border-r-[3px] border-border" : ""}`}
              >
                <span className="absolute -right-4 -bottom-8 text-[150px] font-black text-border opacity-5 select-none leading-none z-0">
                  0{idx + 1}
                </span>
                <div className="relative z-10">
                  <p className="text-xs font-bold tracking-widest uppercase mb-4">
                    STEP 0{idx + 1}
                  </p>
                  <h3 className="text-2xl font-black mb-4">{step}</h3>
                  <p className="text-sm font-medium opacity-80">
                    {idx === 0 &&
                      "code-oss. atom-shell in commit #1, Electron by commit #4000. Nobody wrote it down."}
                    {idx === 1 &&
                      "A local skill walks git log, clusters commits into acts, and diffs the module graph between them."}
                    {idx === 2 &&
                      "One .saga.json opens here. Play, pause, ask. The diagram redraws as the versions advance."}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* File Format Section */}
          <section className="mt-8 border-[3px] border-border bg-inverted-bg text-inverted-fg flex flex-col lg:flex-row mb-16">
            <div className="p-8 lg:p-12 flex-1 lg:max-w-md">
              <p className="text-xs font-bold tracking-widest uppercase text-muted mb-6">
                THE FILE FORMAT
              </p>
              <h2 className="text-5xl font-black mb-6">.saga.json</h2>
              <div className="space-y-6 text-sm font-medium opacity-90 leading-relaxed">
                <p>
                  A flat, versioned document. Codex writes it, the UI reads it.
                  No streaming, no auth, no vendor lock. You can commit it next
                  to your README.
                </p>
                <p>
                  Every version has: files (with role + business-logic flag),
                  edges (imports / spawns / ipc / replaces), stack (with docs
                  URL + reason it was added), narration lines, and baked-in Q&A.
                </p>
              </div>
            </div>
            <div className="p-8 lg:p-12 flex-1 border-t-[3px] lg:border-t-0 lg:border-l-[3px] border-border flex items-center justify-center">
              <div className="w-full h-full border border-muted/30 p-6 font-mono text-xs whitespace-pre overflow-x-auto">
                {`{
  "project": "code-oss",
  "versions": [{
    "id": "v2",
    "label": "1.25 LSP",
    "narration": ["Each language plugin was..."],
    "files": [
      { "id": "exthost", "role": "core",
        "business": true,
        "summary": "Extension host - now spawns..."
      }
    ]
  }]
}`}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-auto pt-16 pb-8 text-center text-sm font-bold tracking-widest uppercase flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>Orchestrated By</span>
            <FooterName />
            <span>
              —{" "}
              <a
                href="https://github.com/thisisrounaksingh"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors underline decoration-2 underline-offset-4"
              >
                Github
              </a>
              ,{" "}
              <a
                href="https://x.com/thisisrounaksingh"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors underline decoration-2 underline-offset-4"
              >
                X
              </a>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
