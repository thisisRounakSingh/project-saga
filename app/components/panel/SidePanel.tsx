"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSagaStore, PanelTab } from "@/store/sagaStore";
import {
  BookOpen,
  MessageSquare,
  Layers,
  FileText,
  Maximize2,
  Minimize2,
  ArrowRightToLine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NarrationView } from "./NarrationView";
import { ChatView } from "./ChatView";
import { StackView } from "./StackView";
import { FileInspector } from "./FileInspector";

export function SidePanel() {
  const panelState = useSagaStore((state) => state.panelState);
  const activePanelTab = useSagaStore((state) => state.activePanelTab);
  const setPanelState = useSagaStore((state) => state.setPanelState);
  const setActivePanelTab = useSagaStore((state) => state.setActivePanelTab);
  const sessionData = useSagaStore((state) => state.sessionData);
  const activeActId = useSagaStore((state) => state.activeActId);
  const setActiveActId = useSagaStore((state) => state.setActiveActId);

  const [customWidth, setCustomWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);

  // Handle ESC key for downgrading panel state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (panelState === "maximized") setPanelState("expanded");
        else if (panelState === "expanded") setPanelState("docked");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panelState, setPanelState]);

  const toggleTab = (tab: PanelTab) => {
    if (panelState === "docked") {
      setActivePanelTab(tab);
      setPanelState("expanded");
    } else if (activePanelTab === tab) {
      setPanelState("docked");
    } else {
      setActivePanelTab(tab);
    }
  };

  const getWidth = () => {
    if (panelState === "docked") return 64;
    if (panelState === "expanded") return customWidth;
    return "calc(100% - 32px)";
  };

  const isMaximized = panelState === "maximized";
  const isDocked = panelState === "docked";

  const acts = sessionData?.acts || [];
  const currentActIndex = acts.findIndex((a) => a.id === activeActId);

  const handlePrevAct = () => {
    if (currentActIndex > 0) setActiveActId(acts[currentActIndex - 1].id);
  };

  const handleNextAct = () => {
    if (currentActIndex >= 0 && currentActIndex < acts.length - 1)
      setActiveActId(acts[currentActIndex + 1].id);
  };

  const activeAct = acts[currentActIndex];

  const getTabTitle = () => {
    if (activePanelTab === "narration" && activeAct?.narration[0]) {
      return `NARRATION - "${activeAct.narration[0].text}"`;
    }
    return activePanelTab;
  };

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        width: getWidth(),
      }}
      transition={
        isDragging
          ? { duration: 0 }
          : { type: "spring", stiffness: 300, damping: 30 }
      }
      className="bg-background border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] rounded-2xl flex flex-col z-40 overflow-hidden absolute right-4 top-4 bottom-4"
    >
      {/* Resizer Handle */}
      {!isDocked && !isMaximized && (
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-accent/50 z-50 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            const startX = e.clientX;
            const startWidth = customWidth;

            const onMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = startX - moveEvent.clientX;
              // Limit width between 300px and 80% of window width
              const newWidth = Math.max(
                300,
                Math.min(startWidth + deltaX, window.innerWidth * 0.8),
              );
              setCustomWidth(newWidth);
            };

            const onMouseUp = () => {
              document.body.style.cursor = "default";
              document.body.style.userSelect = "auto";
              setIsDragging(false);
              window.removeEventListener("mousemove", onMouseMove);
              window.removeEventListener("mouseup", onMouseUp);
            };

            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
          }}
        />
      )}
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Docked Icon Rail */}
        <div
          className={`flex flex-col items-center py-4 gap-4 w-16 shrink-0 border-border ${!isDocked ? "border-r-[3px] bg-muted/10" : ""}`}
        >
          <TabButton
            icon={<BookOpen size={20} />}
            isActive={activePanelTab === "narration" && !isDocked}
            onClick={() => toggleTab("narration")}
            label="Narration"
          />
          <TabButton
            icon={<MessageSquare size={20} />}
            isActive={activePanelTab === "chat" && !isDocked}
            onClick={() => toggleTab("chat")}
            label="Chat"
          />
          <TabButton
            icon={<Layers size={20} />}
            isActive={activePanelTab === "stack" && !isDocked}
            onClick={() => toggleTab("stack")}
            label="Stack"
          />
          <TabButton
            icon={<FileText size={20} />}
            isActive={activePanelTab === "file" && !isDocked}
            onClick={() => toggleTab("file")}
            label="File"
          />
        </div>

        {/* Expanded/Maximized Content */}
        <AnimatePresence>
          {!isDocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full overflow-hidden bg-background"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-border shrink-0">
                <span className="font-black uppercase tracking-widest text-sm truncate pr-4">
                  {getTabTitle()}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-muted/10 rounded mr-2 border border-border overflow-hidden">
                    <button
                      onClick={handlePrevAct}
                      disabled={currentActIndex <= 0}
                      className="p-1 hover:bg-muted/20 hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground transition-colors"
                      title="Previous Act"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="w-px bg-border h-4" />
                    <button
                      onClick={handleNextAct}
                      disabled={
                        currentActIndex >= acts.length - 1 ||
                        currentActIndex === -1
                      }
                      className="p-1 hover:bg-muted/20 hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground transition-colors"
                      title="Next Act"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      setPanelState(isMaximized ? "expanded" : "maximized")
                    }
                    className="p-1.5 hover:bg-muted/20 hover:text-accent rounded transition-colors"
                  >
                    {isMaximized ? (
                      <Minimize2 size={16} />
                    ) : (
                      <Maximize2 size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => setPanelState("docked")}
                    className="p-1.5 hover:bg-muted/20 hover:text-accent rounded transition-colors"
                  >
                    <ArrowRightToLine size={16} />
                  </button>
                </div>
              </div>

              {/* View Content */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {activePanelTab === "narration" && <NarrationView />}
                {activePanelTab === "chat" && <ChatView />}
                {activePanelTab === "stack" && <StackView />}
                {activePanelTab === "file" && <FileInspector />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TabButton({
  icon,
  isActive,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-3 rounded transition-all duration-200 ${
        isActive
          ? "bg-accent text-white shadow-[2px_2px_0_var(--color-border)] dark:shadow-[2px_2px_0_#fff] -translate-x-0.5 -translate-y-0.5"
          : "text-foreground hover:bg-muted/20 hover:text-accent"
      }`}
    >
      {icon}
    </button>
  );
}
