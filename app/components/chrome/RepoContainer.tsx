'use client';

import { useSagaStore } from '@/store/sagaStore';
import { Menu, Home } from 'lucide-react';
import Link from 'next/link';

export function RepoContainer() {
  const repoName = useSagaStore((state) => state.sessionData?.repo.name);

  return (
    <div className="flex items-center gap-4">
      {/* Hamburger / Home Link */}
      <Link
        href="/"
        className="p-2 border-[3px] border-border hover:bg-inverted-bg hover:text-inverted-fg transition-colors flex items-center justify-center bg-background text-foreground group relative"
        title="Go to Home"
      >
        <Menu className="w-5 h-5 group-hover:hidden" />
        <Home className="w-5 h-5 hidden group-hover:block" />
      </Link>

      <div className="flex flex-col">
        <span className="text-xs font-bold tracking-widest text-muted uppercase">
          Repository
        </span>
        <span className="text-lg font-black tracking-tighter">
          {repoName || 'Loading...'}
        </span>
      </div>
    </div>
  );
}
