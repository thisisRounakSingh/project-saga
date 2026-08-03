"use client";

import { useSagaStore } from "@/store/sagaStore";
import { ExternalLink, Layers } from "lucide-react";

export function StackView() {
  const sessionData = useSagaStore((state) => state.sessionData);
  const setActiveActId = useSagaStore((state) => state.setActiveActId);

  const stack = sessionData?.techStack || [];
  const acts = sessionData?.acts || [];

  const handleActJump = (actId: string) => {
    if (acts.some((a) => a.id === actId)) {
      setActiveActId(actId);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="text-accent" size={28} />
        <h2 className="text-3xl font-black tracking-tighter uppercase">
          Tech Stack
        </h2>
      </div>

      {stack.length === 0 ? (
        <div className="border-[3px] border-border border-dashed p-8 text-muted text-sm font-bold uppercase tracking-widest text-center">
          No stack data found.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {stack.map((item, index) => {
            const introducedAct = acts.find((a) => a.id === item.introducedAct);
            return (
              <div
                key={index}
                className="bg-background border-[3px] border-border p-4 shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black tracking-tighter">
                      {item.name}
                    </h3>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">
                      {item.role}
                    </p>
                  </div>
                  {item.docsUrl && (
                    <a
                      href={item.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-foreground transition-colors p-1"
                      title="View Documentation"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>

                <div className="mt-2 pt-3 border-t-2 border-border border-dashed flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                    Introduced In
                  </span>
                  <button
                    onClick={() => handleActJump(item.introducedAct)}
                    className="text-xs font-bold bg-accent/10 text-accent px-2 py-1 border-2 border-accent/20 hover:bg-accent hover:text-white transition-colors cursor-pointer"
                  >
                    {introducedAct
                      ? introducedAct.codename
                      : item.introducedAct}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
