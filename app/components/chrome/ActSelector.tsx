"use client";

import { useSagaStore } from "@/store/sagaStore";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar, GitCommit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ActSelector() {
  const sessionData = useSagaStore((state) => state.sessionData);
  const activeActId = useSagaStore((state) => state.activeActId);
  const setActiveActId = useSagaStore((state) => state.setActiveActId);
  const isPlaying = useSagaStore((state) => state.isPlaying);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!sessionData || !activeActId) return null;

  const activeAct = sessionData.acts.find((a) => a.id === activeActId);
  if (!activeAct) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-4 bg-background border-[3px] border-border px-4 py-2 shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] overflow-hidden whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              {sessionData.acts.map((act) => (
                <button
                  key={act.id}
                  onClick={() => setActiveActId(act.id)}
                  className={`w-3 h-3 rounded-full border-2 transition-colors shrink-0 ${
                    act.id === activeActId
                      ? "bg-accent border-accent"
                      : "bg-transparent border-border hover:bg-muted/20"
                  }`}
                  title={`Act ${act.order}: ${act.codename}`}
                />
              ))}
            </div>
            <div className="flex flex-col text-left border-l-[3px] border-border border-dashed pl-4 shrink-0">
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-70 leading-tight">
                Act {activeAct.order}
              </span>
              <span className="text-sm font-black tracking-tighter uppercase">
                {activeAct.codename}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropdown-wrapper"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 bg-background border-[3px] border-border px-4 py-2 hover:bg-inverted-bg hover:text-inverted-fg transition-colors group shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff]"
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-70 leading-tight">
                  Act {activeAct.order}
                </span>
                <span className="text-sm font-black tracking-tighter uppercase">
                  {activeAct.codename}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-background border-2 border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] flex flex-col z-50 pointer-events-auto max-h-[80vh] overflow-y-auto">
                {sessionData.acts.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => {
                      setActiveActId(act.id);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col text-left p-4 border-b-[3px] border-border last:border-b-0 hover:bg-inverted-bg hover:text-inverted-fg transition-colors ${
                      act.id === activeActId ? "bg-muted/10" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold tracking-widest uppercase">
                        Act {act.order}
                      </span>
                      <span className="text-sm font-black tracking-tighter uppercase">
                        {act.codename}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 text-xs opacity-80 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(act.dateRange.start).toLocaleDateString(
                            undefined,
                            { month: "short", year: "numeric" },
                          )}{" "}
                          -{" "}
                          {new Date(act.dateRange.end).toLocaleDateString(
                            undefined,
                            { month: "short", year: "numeric" },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitCommit className="w-3 h-3" />
                        <span>{act.commitCount} commits</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
