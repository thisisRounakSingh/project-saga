"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { useSagaStore } from "@/store/sagaStore";

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sessionData = useSagaStore((state) => state.sessionData);
  const activeActId = useSagaStore((state) => state.activeActId);
  const searchQuery = useSagaStore((state) => state.searchQuery);
  const searchResults = useSagaStore((state) => state.searchResults);
  const activeSearchIndex = useSagaStore((state) => state.activeSearchIndex);

  const setSearchQuery = useSagaStore((state) => state.setSearchQuery);
  const setSearchResults = useSagaStore((state) => state.setSearchResults);
  const setActiveSearchIndex = useSagaStore(
    (state) => state.setActiveSearchIndex,
  );
  const clearSearch = useSagaStore((state) => state.clearSearch);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
        clearSearch();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearSearch]);

  // Perform search when query or act changes
  useEffect(() => {
    if (!searchQuery.trim() || !sessionData || !activeActId) {
      if (searchResults.length > 0) setSearchResults([]);
      return;
    }

    const activeAct = sessionData.acts.find((a) => a.id === activeActId);
    if (!activeAct) return;

    const lowerQuery = searchQuery.toLowerCase();
    const matches = activeAct.modules
      .filter(
        (m) =>
          m.name.toLowerCase().includes(lowerQuery) ||
          m.summary.toLowerCase().includes(lowerQuery),
      )
      .map((m) => m.name); // ID in React Flow is m.name in this codebase

    // Only update if changed to avoid loops
    if (JSON.stringify(matches) !== JSON.stringify(searchResults)) {
      setSearchResults(matches);
    }
  }, [searchQuery, activeActId, sessionData, searchResults, setSearchResults]);

  const handleNext = () => {
    if (searchResults.length > 0) {
      setActiveSearchIndex((activeSearchIndex + 1) % searchResults.length);
    }
  };

  const handlePrev = () => {
    if (searchResults.length > 0) {
      setActiveSearchIndex(
        (activeSearchIndex - 1 + searchResults.length) % searchResults.length,
      );
    }
  };

  const handleClear = () => {
    clearSearch();
    setIsExpanded(false);
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative flex items-center bg-background border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] h-12 overflow-hidden"
      initial={{ width: 48, borderRadius: 24 }}
      animate={{
        width: isExpanded || searchQuery.length > 0 ? 360 : 48,
        borderRadius: isExpanded || searchQuery.length > 0 ? 8 : 24,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => {
        if (!searchQuery && document.activeElement !== inputRef.current) {
          setIsExpanded(false);
        }
      }}
      onClick={() => {
        setIsExpanded(true);
        inputRef.current?.focus();
      }}
    >
      <div className="flex items-center justify-center w-12 h-12 shrink-0 cursor-pointer">
        <Search size={20} className="text-foreground" />
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder="Search nodes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsExpanded(true)}
        onBlur={() => {
          // Delay blur to allow clicks on buttons to register
          setTimeout(() => {
            if (!searchQuery) setIsExpanded(false);
          }, 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (e.shiftKey) handlePrev();
            else handleNext();
          } else if (e.key === "Escape") {
            handleClear();
          }
        }}
        className="flex-1 h-full bg-transparent border-none outline-none text-foreground font-mono text-sm placeholder:text-muted"
      />

      <AnimatePresence>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center shrink-0 pr-2 gap-1"
          >
            {searchResults.length > 0 ? (
              <span className="text-xs font-mono font-bold text-muted mr-1">
                {activeSearchIndex + 1}/{searchResults.length}
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-accent mr-1">
                0/0
              </span>
            )}

            <div className="flex flex-col">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="hover:text-accent hover:bg-muted/20 rounded p-0.5"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="hover:text-accent hover:bg-muted/20 rounded p-0.5"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 hover:text-accent hover:bg-muted/20 rounded"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
