"use client";

import { useState, useRef, useEffect } from "react";
import { useSagaStore } from "@/store/sagaStore";
import { Trash2, X, MessageSquarePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TrashCan() {
  const sessionData = useSagaStore((state) => state.sessionData);
  const activeActId = useSagaStore((state) => state.activeActId);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const acts = sessionData?.acts || [];
  const currentActIndex = acts.findIndex((a) => a.id === activeActId);
  const computedTrashFiles: {
    id: string;
    name: string;
    summary: string;
    actId: string;
  }[] = [];

  if (currentActIndex > 0) {
    for (let i = 0; i < currentActIndex; i++) {
      acts[i].modules.forEach((m) => {
        if (m.status === "deleted") {
          computedTrashFiles.push({
            id: m.name,
            name: m.name,
            summary: m.summary,
            actId: acts[i].id,
          });
        }
      });
    }
  }

  return (
    <div className="flex-1" ref={containerRef}>
      <motion.button
        id="trash-can-btn"
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative pointer-events-auto p-3 rounded-full border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] transition-colors ${
          isOpen
            ? "bg-red-500 text-white border-red-500"
            : "bg-background hover:bg-red-500 hover:text-white"
        }`}
      >
        <Trash2 size={18} />
        <motion.div
          key={computedTrashFiles.length}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-background"
        >
          {computedTrashFiles.length}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute top-full left-0 mt-3 w-80 max-h-96 overflow-y-auto bg-background border-[3px] border-border shadow-[8px_8px_0_var(--color-border)] dark:shadow-[8px_8px_0_#fff] flex flex-col pointer-events-auto"
          >
            <div className="sticky top-0 bg-background border-b-[3px] border-border p-3 flex justify-between items-center z-10">
              <h3 className="font-black uppercase tracking-tighter flex items-center gap-2 text-sm">
                <Trash2 size={14} /> Deleted Modules
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted/20 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-col">
              {computedTrashFiles.map((file, idx) => (
                <div
                  key={`${file.actId}-${file.id}-${idx}`}
                  className="p-4 border-b-2 border-border/20 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-red-500">
                      {file.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted bg-muted/10 px-2 py-0.5 rounded-full border border-border/30">
                        Act {file.actId}
                      </span>
                      <button
                        onClick={() => {
                          useSagaStore.getState().addPendingChatContext({
                            actId: file.actId,
                            text: `Deleted File: ${file.name}\nReason: ${file.summary}`,
                          });
                          useSagaStore.getState().setActivePanelTab("chat");
                          useSagaStore.getState().setPanelState("expanded");
                        }}
                        className="p-1 text-muted hover:text-accent transition-colors"
                        title="Add to Chat Context"
                      >
                        <MessageSquarePlus size={14} />
                      </button>
                    </div>
                  </div>
                  <span className="block text-xs text-muted leading-relaxed">
                    {file.summary}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
