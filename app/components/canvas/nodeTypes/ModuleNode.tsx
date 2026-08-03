import { Handle, Position } from "@xyflow/react";
import { ModuleNodeData } from "@/lib/saga/schema";
import { useSagaStore } from "@/store/sagaStore";
import { MessageSquare, Pin, PinOff, X } from "lucide-react";
import { motion } from "framer-motion";

export function ModuleNode({ data, id }: { data: ModuleNodeData; id: string }) {
  const selectedNodeIds = useSagaStore((state) => state.selectedNodeIds);
  const isSelected = selectedNodeIds.includes(id);
  const isContextMenuAnchor = useSagaStore(
    (state) => state.contextMenuNodeId === id,
  );
  const isPinned = useSagaStore((state) => state.pinnedNodeIds.includes(id));
  const toggleNodePin = useSagaStore((state) => state.toggleNodePin);
  const setActivePanelTab = useSagaStore((state) => state.setActivePanelTab);
  const activeActId = useSagaStore((state) => state.activeActId);
  const submitDirectQuestion = useSagaStore(
    (state) => state.submitDirectQuestion,
  );
  const panelState = useSagaStore((state) => state.panelState);
  const setPanelState = useSagaStore((state) => state.setPanelState);
  const sessionData = useSagaStore((state) => state.sessionData);
  const activeAct = sessionData?.acts.find((a) => a.id === activeActId);

  // Find the next act for deletion tooltip
  const acts = sessionData?.acts || [];
  const activeActIndex = acts.findIndex((a) => a.id === activeActId);
  const nextAct =
    activeActIndex >= 0 && activeActIndex < acts.length - 1
      ? acts[activeActIndex + 1]
      : null;

  const searchResults = useSagaStore((state) => state.searchResults);
  const activeSearchIndex = useSagaStore((state) => state.activeSearchIndex);
  const isSearched =
    searchResults.length > 0 && searchResults[activeSearchIndex] === id;

  // Status colors
  const statusColors = {
    new: "bg-[#ffeb3b] dark:bg-[#fff9c4]/30 border-black dark:border-[#fff9c4] text-black dark:text-[#fff9c4]", // Pop yellow
    modified:
      "bg-[#00e5ff] dark:bg-[#b2ebf2]/30 border-black dark:border-[#b2ebf2] text-black dark:text-[#b2ebf2]", // Pop cyan
    deleted:
      "bg-[#ff1744] dark:bg-[#ffcdd2]/30 border-black dark:border-[#ffcdd2] text-white dark:text-[#ffcdd2]", // Pop red
    unchanged:
      "bg-white dark:bg-black border-black dark:border-white text-black dark:text-white",
  };

  const isCinematicMode = useSagaStore((state) => state.isCinematicMode);

  // File type color coding heuristics
  const getFileTypeBorder = () => {
    // Only apply type color coding in cinematic mode to emphasize core logic, or always based on preference
    // The user requested: "Introduce color code... red for core business logic. [Obviously during narration when user switch to core business logic, all file are red colored]"
    const lowerPath = data.path.toLowerCase();
    const lowerName = data.name.toLowerCase();
    if (isCinematicMode) {
      // In cinematic mode, the filtered modules are by definition the "Core Business Logic" the user is focusing on
      return "border-red-500 shadow-[4px_4px_0_#ef4444] dark:shadow-[4px_4px_0_#ef4444] text-red-600 dark:text-red-400";
    }

    if (
      lowerPath.includes("service") ||
      lowerPath.includes("core") ||
      lowerPath.includes("util") ||
      lowerName.includes("service")
    ) {
      return "border-red-500 dark:border-red-400"; // Business Logic
    }
    if (
      lowerPath.includes("component") ||
      lowerPath.includes("page") ||
      lowerPath.includes("ui") ||
      lowerPath.endsWith(".tsx") ||
      lowerPath.endsWith(".jsx")
    ) {
      return "border-blue-500 dark:border-blue-400"; // UI
    }
    if (
      lowerPath.includes("store") ||
      lowerPath.includes("db") ||
      lowerPath.includes("repo")
    ) {
      return "border-green-500 dark:border-green-400"; // Data
    }

    return "border-black dark:border-white";
  };

  const bgClass = statusColors[data.status] || statusColors.unchanged;
  const borderClass = getFileTypeBorder();

  const handleAskAboutThis = (e: React.MouseEvent) => {
    e.stopPropagation();
    const paths =
      selectedNodeIds.length > 1
        ? selectedNodeIds
            .map((sid) => activeAct?.modules.find((m) => m.name === sid)?.path)
            .filter(Boolean)
            .join(", ")
        : data.path;
    if (panelState === "docked") setPanelState("expanded");
    setActivePanelTab("chat");
    submitDirectQuestion(`Tell me about the following file(s): ${paths}`);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedNodeIds.length > 1) {
      selectedNodeIds.forEach((sid) => toggleNodePin(sid));
    } else {
      toggleNodePin(id);
    }
  };

  const isMultipleSelected = selectedNodeIds.length > 1;
  const totalLinesChanged = isMultipleSelected
    ? selectedNodeIds.reduce((sum, sid) => {
        const m = activeAct?.modules.find((m) => m.name === sid);
        return sum + (m?.linesChanged || 0);
      }, 0)
    : data.linesChanged || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
      className={`relative px-4 py-3 border-[3px] shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] min-w-50 transition-all duration-300 ${bgClass} ${borderClass} ${isSelected ? "ring-2 ring-accent" : ""} ${isSearched ? "animate-pulse ring-4 ring-accent scale-105 z-50" : ""}`}
    >
      {/* Manga corner ticks */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-[3px] border-l-[3px] border-foreground -translate-x-1 -translate-y-1" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-[3px] border-r-[3px] border-foreground translate-x-1 translate-y-1" />

      {isPinned && (
        <div className="absolute -top-3 -right-3 bg-accent text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border-2 border-background z-10">
          P
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2 border-border bg-background"
      />

      <div className="flex flex-col items-center text-center">
        <span className="font-bold tracking-tighter text-sm mb-1">
          {data.name}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-tight line-clamp-2">
          {data.summary}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-border bg-background"
      />
      {/* Floating Callout (Only visible on large screens when context menu is anchored here) */}
      {isContextMenuAnchor && (
        <div
          className="absolute left-[calc(100%+1rem)] top-0 w-64 bg-background border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] z-100 hidden lg:flex flex-col p-4 gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <h3
              className="font-black text-lg tracking-tighter truncate"
              title={
                isMultipleSelected
                  ? `${selectedNodeIds.length} files selected`
                  : data.name
              }
            >
              {isMultipleSelected
                ? `${selectedNodeIds.length} files selected`
                : data.name}
            </h3>
            <p
              className="text-xs text-muted font-bold tracking-widest break-all line-clamp-2"
              title={isMultipleSelected ? "Multiple files" : data.path}
            >
              {isMultipleSelected ? "Multiple files" : data.path}
            </p>
          </div>

          <div
            className={`grid ${isMultipleSelected ? "grid-cols-1" : "grid-cols-2"} gap-2`}
          >
            {!isMultipleSelected && (
              <div className="bg-muted/10 p-2 border-2 border-border">
                <span className="block text-[8px] font-black uppercase tracking-widest text-muted">
                  Status
                </span>
                <span className="text-xs font-bold capitalize">
                  {data.status}
                </span>
              </div>
            )}
            <div className="bg-muted/10 p-2 border-2 border-border">
              <span className="block text-[8px] font-black uppercase tracking-widest text-muted">
                Lines
              </span>
              <span className="text-xs font-bold">{totalLinesChanged}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleAskAboutThis}
              className="w-full flex items-center justify-center gap-2 bg-accent text-white border-2 border-border p-2 text-xs font-bold uppercase tracking-widest hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-border)] dark:hover:shadow-[2px_2px_0_#fff] transition-all"
            >
              <MessageSquare size={14} /> Ask
            </button>
            <button
              onClick={handlePin}
              className={`w-full flex items-center justify-center gap-2 border-2 border-border p-2 text-xs font-bold uppercase tracking-widest hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-border)] dark:hover:shadow-[2px_2px_0_#fff] transition-all ${isPinned ? "bg-muted/20" : "bg-background"}`}
            >
              {isPinned ? <PinOff size={14} /> : <Pin size={14} />}{" "}
              {isPinned ? "Unpin" : "Pin"}
            </button>
          </div>
        </div>
      )}

      {data.status === "deleted" && (
        <div
          className="absolute -top-2 -right-2 z-50 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-background shadow-sm"
          title={
            nextAct
              ? `This file is no longer present in Act ${nextAct.order}`
              : "This file has been removed"
          }
        >
          <X size={12} strokeWidth={3} />
        </div>
      )}
    </motion.div>
  );
}
