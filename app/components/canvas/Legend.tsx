"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";

export function Legend() {
  const [isOpen, setIsOpen] = useState(false);

  const types = [
    { label: "Business Logic", colorClass: "bg-red-500" },
    { label: "UI Components", colorClass: "bg-blue-500" },
    { label: "Data & Store", colorClass: "bg-green-500" },
    { label: "Other", colorClass: "bg-foreground" },
  ];

  const statuses = [
    { label: "New", colorClass: "bg-[#ffeb3b] dark:bg-[#fff9c4]" },
    { label: "Modified", colorClass: "bg-[#00e5ff] dark:bg-[#b2ebf2]" },
    { label: "Deleted", colorClass: "bg-[#ff1744] dark:bg-[#ffcdd2]" },
    { label: "Unchanged", colorClass: "bg-white dark:bg-black" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-background p-2 rounded-full border-[3px] border-border shadow-[2px_2px_0_var(--color-border)] dark:shadow-[2px_2px_0_#fff] hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all"
        title="Color Legend"
      >
        <Info size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
          Legend
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-3 w-56 bg-background border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] p-4 flex flex-col gap-4 z-50"
          >
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-black uppercase tracking-widest">
                Color Legend
              </h4>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-muted/20 p-1 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                Module Type (Border)
              </h5>
              <ul className="flex flex-col gap-2">
                {types.map((t) => (
                  <li
                    key={t.label}
                    className="flex items-center gap-2 text-xs font-bold"
                  >
                    <div
                      className={`w-3 h-3 rounded-full border-2 border-background ${t.colorClass}`}
                    />
                    {t.label}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                Change Status (Fill)
              </h5>
              <ul className="flex flex-col gap-2">
                {statuses.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center gap-2 text-xs font-bold"
                  >
                    <div
                      className={`w-3 h-3 border-2 border-border ${s.colorClass}`}
                    />
                    {s.label}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
