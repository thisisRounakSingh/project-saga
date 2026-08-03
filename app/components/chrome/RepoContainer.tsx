"use client";

import { useState, useRef, useEffect } from "react";
import { useSagaStore } from "@/store/sagaStore";
import { Menu, Home, Upload } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LoadSagaDialog } from "@/app/components/chrome/LoadSagaDialog";

export function RepoContainer() {
  const repoName = useSagaStore((state) => state.sessionData?.repo.name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4">
      {/* Hamburger Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 border-[3px] border-border hover:bg-inverted-bg hover:text-inverted-fg transition-colors flex items-center justify-center bg-background text-foreground"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 bg-background border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] flex flex-col w-48 z-50 overflow-hidden"
            >
              <Link
                href="/"
                className="px-4 py-3 text-sm font-bold tracking-widest uppercase hover:bg-inverted-bg hover:text-inverted-fg transition-colors flex items-center gap-2 border-b-[3px] border-border"
              >
                <Home size={16} /> Home Screen
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDialogOpen(true);
                }}
                className="px-4 py-3 text-sm font-bold tracking-widest uppercase hover:bg-inverted-bg hover:text-inverted-fg transition-colors flex items-center gap-2 text-left"
              >
                <Upload size={16} /> Load.Saga
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-bold tracking-widest text-muted uppercase">
          Repository
        </span>
        <span className="text-lg font-black tracking-tighter">
          {repoName || "Loading..."}
        </span>
      </div>

      <LoadSagaDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
