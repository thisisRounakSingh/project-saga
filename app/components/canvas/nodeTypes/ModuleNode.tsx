import { Handle, Position } from '@xyflow/react';
import { ModuleNodeData } from '@/lib/saga/schema';
import { useSagaStore } from '@/store/sagaStore';

export function ModuleNode({ data, id }: { data: ModuleNodeData; id: string }) {
  const isSelected = useSagaStore(state => state.selectedNodeId === id);
  const isPinned = useSagaStore(state => state.pinnedNodeIds.includes(id));
  
  const searchResults = useSagaStore(state => state.searchResults);
  const activeSearchIndex = useSagaStore(state => state.activeSearchIndex);
  const isSearched = searchResults.length > 0 && searchResults[activeSearchIndex] === id;
  
  // Status colors
  const statusColors = {
    new: 'bg-[#ffeb3b] dark:bg-[#fff9c4]/30 border-black dark:border-[#fff9c4] text-black dark:text-[#fff9c4]', // Pop yellow
    modified: 'bg-[#00e5ff] dark:bg-[#b2ebf2]/30 border-black dark:border-[#b2ebf2] text-black dark:text-[#b2ebf2]', // Pop cyan
    deleted: 'bg-[#ff1744] dark:bg-[#ffcdd2]/30 border-black dark:border-[#ffcdd2] text-white dark:text-[#ffcdd2]', // Pop red
    unchanged: 'bg-white dark:bg-black border-black dark:border-white text-black dark:text-white',
  };

  const bgClass = statusColors[data.status] || statusColors.unchanged;

  return (
    <div className={`relative px-4 py-3 border-[3px] shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] min-w-50 transition-all duration-300 ${bgClass} ${isSelected ? 'ring-2 ring-accent' : ''} ${isSearched ? 'animate-pulse ring-4 ring-accent scale-105 z-50' : ''}`}>
      {/* Manga corner ticks */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-[3px] border-l-[3px] border-foreground -translate-x-1 -translate-y-1" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-[3px] border-r-[3px] border-foreground translate-x-1 translate-y-1" />
      
      {isPinned && (
        <div className="absolute -top-3 -right-3 bg-accent text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border-2 border-background z-10">
          P
        </div>
      )}

      <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-border bg-background" />
      
      <div className="flex flex-col items-center text-center">
        <span className="font-bold tracking-tighter text-sm mb-1">{data.name}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-tight line-clamp-2">{data.summary}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-border bg-background" />
    </div>
  );
}
