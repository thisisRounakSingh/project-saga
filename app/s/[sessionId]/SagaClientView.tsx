'use client';

import { useSagaStore } from '@/store/sagaStore';
import { RepoContainer } from '@/app/components/chrome/RepoContainer';
import { ActSelector } from '@/app/components/chrome/ActSelector';
import { PlaybackControls } from '@/app/components/chrome/PlaybackControls';
import { SearchBar } from '@/app/components/chrome/SearchBar';
import { ThemeSwitcher } from '@/app/components/ThemeSwitcher';
import { CursorSwitcher } from '@/app/components/CursorSwitcher';
import { DiagramCanvas } from '@/app/components/canvas/DiagramCanvas';
import { SidePanel } from '@/app/components/panel/SidePanel';
import { useEffect } from 'react';
import { SagaSession } from '@/lib/saga/schema';

export default function SagaClientView({ session }: { session: SagaSession }) {
  const setSessionData = useSagaStore((state) => state.setSessionData);
  const isLoaded = useSagaStore((state) => state.sessionData !== null);

  useEffect(() => {
    setSessionData(session);
  }, [session, setSessionData]);

  if (!isLoaded) return <div className="p-8">Loading Session...</div>;

  return (
    <div className="flex flex-col flex-1 h-full w-full relative">
      {/* Top Chrome */}
      <nav className="flex items-center justify-between px-6 py-4 border-b-[3px] border-border bg-background z-50">
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
