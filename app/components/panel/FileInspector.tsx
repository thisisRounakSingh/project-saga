"use client";

import { useSagaStore } from "@/store/sagaStore";
import { MessageSquare, Pin, PinOff } from "lucide-react";

export function FileInspector() {
  const sessionData = useSagaStore((state) => state.sessionData);
  const activeActId = useSagaStore((state) => state.activeActId);
  const selectedNodeIds = useSagaStore((state) => state.selectedNodeIds);
  const pinnedNodeIds = useSagaStore((state) => state.pinnedNodeIds);
  const toggleNodePin = useSagaStore((state) => state.toggleNodePin);
  const submitDirectQuestion = useSagaStore(
    (state) => state.submitDirectQuestion,
  );
  const panelState = useSagaStore((state) => state.panelState);
  const setPanelState = useSagaStore((state) => state.setPanelState);
  const setActivePanelTab = useSagaStore((state) => state.setActivePanelTab);

  const activeAct = sessionData?.acts.find((a) => a.id === activeActId);
  const isMultipleSelected = selectedNodeIds.length > 1;
  const nodeData = activeAct?.modules.find(
    (m) => m.name === selectedNodeIds[0],
  );

  if (selectedNodeIds.length === 0 || !nodeData) {
    return (
      <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center text-muted">
        No file selected. Click a node in the canvas.
      </div>
    );
  }

  const isPinned = isMultipleSelected
    ? selectedNodeIds.every((id) => pinnedNodeIds.includes(id))
    : pinnedNodeIds.includes(nodeData.name);

  const totalLinesChanged = isMultipleSelected
    ? selectedNodeIds.reduce((sum, sid) => {
        const m = activeAct?.modules.find((m) => m.name === sid);
        return sum + (m?.linesChanged || 0);
      }, 0)
    : nodeData.linesChanged || 0;

  const handleAskAboutThis = () => {
    const paths = isMultipleSelected
      ? selectedNodeIds
          .map((sid) => activeAct?.modules.find((m) => m.name === sid)?.path)
          .filter(Boolean)
          .join(", ")
      : nodeData.path;
    if (panelState === "docked") setPanelState("expanded");
    setActivePanelTab("chat");
    submitDirectQuestion(`Tell me about the following file(s): ${paths}`);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tighter mb-2 break-all">
          {isMultipleSelected
            ? `${selectedNodeIds.length} files selected`
            : nodeData.name}
        </h2>
        <p className="text-sm text-muted font-bold tracking-widest break-all">
          {isMultipleSelected ? "Multiple files" : nodeData.path}
        </p>
      </div>

      <div
        className={`grid ${isMultipleSelected ? "grid-cols-1" : "grid-cols-2"} gap-4`}
      >
        {!isMultipleSelected && (
          <div
            className={`p-4 border-[3px] border-border ${nodeData.status === "deleted" ? "bg-red-500/10 border-red-500 text-red-500" : "bg-muted/10"}`}
          >
            <span className="block text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
              Status
            </span>
            <span className="font-bold capitalize">{nodeData.status}</span>
          </div>
        )}
        <div className="bg-muted/10 p-4 border-[3px] border-border">
          <span className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1">
            Lines Changed
          </span>
          <span className="font-bold">{totalLinesChanged}</span>
        </div>
      </div>

      <div className="bg-muted/10 p-4 border-[3px] border-border">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">
          Auto-Generated Report
        </h3>
        <p className="text-sm leading-relaxed">
          {isMultipleSelected
            ? `These ${selectedNodeIds.length} files were grouped in this selection. They encompass a total of ${totalLinesChanged} lines of changes across various components. Review their individual summaries for detailed responsibilities.`
            : `This module handles core logic for ${nodeData.summary}. It was marked as ${nodeData.status} in this act, involving ${nodeData.linesChanged || 0} lines of code changes.`}
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={handleAskAboutThis}
          className="w-full flex items-center justify-center gap-2 bg-accent text-white border-[3px] border-border p-3 font-bold uppercase tracking-widest hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--color-border)] dark:hover:shadow-[4px_4px_0_#fff] transition-all"
        >
          <MessageSquare size={18} />
          Ask About This
        </button>
        <button
          onClick={() => {
            if (isMultipleSelected) {
              selectedNodeIds.forEach((sid) => toggleNodePin(sid));
            } else {
              toggleNodePin(nodeData.name);
            }
          }}
          className={`w-full flex items-center justify-center gap-2 border-[3px] border-border p-3 font-bold uppercase tracking-widest hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--color-border)] dark:hover:shadow-[4px_4px_0_#fff] transition-all ${
            isPinned
              ? "bg-muted/20 text-foreground"
              : "bg-background text-foreground"
          }`}
        >
          {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
          {isPinned ? "Unpin File" : "Pin File"}
        </button>
      </div>
    </div>
  );
}
