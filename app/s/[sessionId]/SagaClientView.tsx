"use client";

import { useSagaStore } from "@/store/sagaStore";
import { RepoContainer } from "@/app/components/chrome/RepoContainer";
import { ActSelector } from "@/app/components/chrome/ActSelector";
import { PlaybackControls } from "@/app/components/chrome/PlaybackControls";
import { SearchBar } from "@/app/components/chrome/SearchBar";
import { ThemeSwitcher } from "@/app/components/ThemeSwitcher";
import { CursorSwitcher } from "@/app/components/CursorSwitcher";
import { DiagramCanvas } from "@/app/components/canvas/DiagramCanvas";
import { SidePanel } from "@/app/components/panel/SidePanel";
import { useEffect } from "react";
import { SagaSession } from "@/lib/saga/schema";
import { useMemoryStore } from "@/store/memoryStore";

export default function SagaClientView({ session }: { session: SagaSession }) {
  const setSessionData = useSagaStore((state) => state.setSessionData);
  const isLoaded = useSagaStore((state) => state.sessionData !== null);

  useEffect(() => {
    setSessionData(session);
    
    // Extract sessionId from URL (if we can)
    const urlParts = typeof window !== "undefined" ? window.location.pathname.split("/s/") : [];
    const sessionId = urlParts.length > 1 ? urlParts[1].split("/")[0] : session.repo.name;

    // Check for localPath in URL query string (sent by saga-launch.js bridge)
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const localPath = urlParams.get("localPath");

    // Persist this session so it shows up in the "Recent Sessions" list on home page
    const existingSession = useMemoryStore.getState().savedSessions.find(s => s.id === sessionId);
    const resolvedLocalPath = localPath || existingSession?.localPath || null;

    useMemoryStore.getState().addOrUpdateSession({
      id: sessionId,
      projectName: session.repo.name,
      lastOpened: Date.now(),
      localPath: resolvedLocalPath,
      isViewOnly: !resolvedLocalPath,
    });
  }, [session, setSessionData]);

  if (!isLoaded) return <div className="p-8">Loading Session...</div>;

  return (
    <div className="flex flex-col flex-1 h-full w-full relative">
      {/* Top Chrome */}
      <nav className="relative flex items-center justify-between px-6 py-4 border-b-[3px] border-border bg-background z-100">
        <RepoContainer />
        <div className="flex items-center gap-4">
          <SearchBar />
          <PlaybackControls />
          <ActSelector />
          <div className="flex items-center gap-4 ml-4 text-sm font-bold tracking-widest uppercase">
            <CursorSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
      {/* Canvas and Panel */}
      <div className="flex-1 flex relative w-full h-full overflow-hidden bg-background">
        <DiagramCanvas />
        <SidePanel />
      </div>
    </div>
  );
}
