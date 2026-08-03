"use client";

import { useEffect } from "react";
import { useSagaStore } from "@/store/sagaStore";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clapperboard,
  X,
  Gauge,
} from "lucide-react";

export function PlaybackControls() {
  const sessionData = useSagaStore((state) => state.sessionData);
  const activeActId = useSagaStore((state) => state.activeActId);
  const setActiveActId = useSagaStore((state) => state.setActiveActId);
  const isPlaying = useSagaStore((state) => state.isPlaying);
  const setIsPlaying = useSagaStore((state) => state.setIsPlaying);
  const activePanelTab = useSagaStore((state) => state.activePanelTab);
  const isCinematicMode = useSagaStore((state) => state.isCinematicMode);
  const toggleCinematicMode = useSagaStore(
    (state) => state.toggleCinematicMode,
  );
  const narrationSpeed = useSagaStore((state) => state.narrationSpeed);
  const setNarrationSpeed = useSagaStore((state) => state.setNarrationSpeed);

  const acts = sessionData?.acts || [];
  const activeIndex = acts.findIndex((a) => a.id === activeActId);

  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveActId(acts[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (activeIndex < acts.length - 1) {
      setActiveActId(acts[activeIndex + 1].id);
    }
  };

  const togglePlay = () => {
    const state = useSagaStore.getState();
    if (!isPlaying) {
      if (
        activeIndex === acts.length - 1 &&
        state.activeNarrationIndex >= acts[acts.length - 1].narration.length - 1
      ) {
        setActiveActId(acts[0].id);
      }
      state.setActivePanelTab("narration");
      if (state.panelState === "docked") {
        state.setPanelState("expanded");
      }
    } else {
      // Pausing: capture current context and switch to chat
      const currentAct = acts[activeIndex];
      if (currentAct) {
        const nIndex =
          state.activeNarrationIndex < currentAct.narration.length
            ? state.activeNarrationIndex
            : 0;
        const text = currentAct.narration[nIndex]?.text;
        if (text) {
          state.addPendingChatContext({ actId: currentAct.id, text });
          state.setActivePanelTab("chat");
          if (state.panelState === "docked") {
            state.setPanelState("expanded");
          }
        }
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleClose = () => {
    setIsPlaying(false);
    useSagaStore.getState().setPanelState("docked");
    useSagaStore.getState().setActivePanelTab("file"); // switch away from narration
    if (isCinematicMode) toggleCinematicMode();
  };

  // Speed labels
  const speedLabel =
    narrationSpeed <= 3500
      ? "Fast"
      : narrationSpeed <= 5500
        ? "Normal"
        : "Slow";

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      const effectiveSpeed = isCinematicMode
        ? narrationSpeed + 2000
        : narrationSpeed;
      interval = setInterval(() => {
        const state = useSagaStore.getState();
        const acts = state.sessionData?.acts || [];
        const currentActIndex = acts.findIndex(
          (a) => a.id === state.activeActId,
        );
        if (currentActIndex === -1) return;

        const currentAct = acts[currentActIndex];
        if (state.activeNarrationIndex < currentAct.narration.length - 1) {
          state.setActiveNarrationIndex(state.activeNarrationIndex + 1);
        } else {
          if (currentActIndex < acts.length - 1) {
            state.setActiveActId(acts[currentActIndex + 1].id);
          } else {
            useSagaStore.getState().setIsPlaying(false);
          }
        }
      }, effectiveSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isCinematicMode, narrationSpeed]);

  return (
    <div className="flex items-center bg-background border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff]">
      <button
        onClick={handlePrevious}
        disabled={activeIndex <= 0}
        className="p-2 hover:bg-inverted-bg hover:text-inverted-fg transition-colors disabled:opacity-50 border-r-[3px] border-border"
      >
        <SkipBack size={16} />
      </button>
      <button
        onClick={togglePlay}
        className="p-2 px-4 hover:bg-inverted-bg hover:text-inverted-fg transition-colors border-r-[3px] border-border"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button
        onClick={handleNext}
        disabled={activeIndex >= acts.length - 1}
        className="p-2 hover:bg-inverted-bg hover:text-inverted-fg transition-colors disabled:opacity-50 border-r-[3px] border-border"
      >
        <SkipForward size={16} />
      </button>
      <button
        title={
          isCinematicMode ? "Disable Cinematic Mode" : "Enable Cinematic Mode"
        }
        onClick={toggleCinematicMode}
        className={`p-2 transition-colors border-r-[3px] border-border ${isCinematicMode ? "bg-accent text-white hover:bg-accent/80" : "hover:bg-inverted-bg hover:text-inverted-fg"}`}
      >
        <Clapperboard size={16} />
      </button>
      {/* Speed control */}
      <div
        className="flex items-center gap-2 px-3 border-r-[3px] border-border"
        title={`Narration Speed: ${speedLabel}`}
      >
        <Gauge size={14} className="text-muted shrink-0" />
        <input
          type="range"
          min={3000}
          max={8000}
          step={500}
          value={narrationSpeed}
          onChange={(e) => setNarrationSpeed(Number(e.target.value))}
          className="w-16 h-1 accent-accent cursor-pointer"
        />
        <span className="text-[9px] font-black uppercase tracking-widest text-muted w-10">
          {speedLabel}
        </span>
      </div>
      {/* Close button: visible when narration tab is active */}
      {activePanelTab === "narration" && (
        <button
          title="Quit Narration"
          onClick={handleClose}
          className="p-2 hover:bg-red-500 hover:text-white transition-colors border-l-[3px] border-border"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
