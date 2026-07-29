import { create } from 'zustand';
import { SagaSession } from '@/lib/saga/schema';

export type PanelState = 'docked' | 'expanded' | 'maximized';
export type PanelTab = 'narration' | 'chat' | 'stack';

interface SagaStoreState {
  sessionData: SagaSession | null;
  activeActId: string | null;
  activePanelTab: PanelTab;
  panelState: PanelState;
  pinnedNodeIds: string[];
  selectedNodeId: string | null;
  
  // Search State
  searchQuery: string;
  searchResults: string[];
  activeSearchIndex: number;
  
  // Steering Wheel Settings
  joystickSpeed: number;
  
  setSessionData: (data: SagaSession) => void;
  setActiveActId: (id: string) => void;
  setActivePanelTab: (tab: PanelTab) => void;
  setPanelState: (state: PanelState) => void;
  toggleNodePin: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: string[]) => void;
  setActiveSearchIndex: (index: number) => void;
  setJoystickSpeed: (speed: number) => void;
  clearSearch: () => void;
}

export const useSagaStore = create<SagaStoreState>((set) => ({
  sessionData: null,
  activeActId: null,
  activePanelTab: 'narration',
  panelState: 'docked',
  pinnedNodeIds: [],
  selectedNodeId: null,
  searchQuery: '',
  searchResults: [],
  activeSearchIndex: 0,
  joystickSpeed: 8,
  
  setSessionData: (data) => set({ 
    sessionData: data, 
    activeActId: data.acts[0]?.id || null,
    searchQuery: '',
    searchResults: [],
    activeSearchIndex: 0
  }),
  setActiveActId: (id) => set({ activeActId: id, searchQuery: '', searchResults: [], activeSearchIndex: 0 }),
  setActivePanelTab: (tab) => set({ activePanelTab: tab }),
  setPanelState: (state) => set({ panelState: state }),
  toggleNodePin: (id) => set((state) => ({
    pinnedNodeIds: state.pinnedNodeIds.includes(id) 
      ? state.pinnedNodeIds.filter(pinnedId => pinnedId !== id)
      : [...state.pinnedNodeIds, id]
  })),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results, activeSearchIndex: 0 }),
  setActiveSearchIndex: (index) => set({ activeSearchIndex: index }),
  setJoystickSpeed: (speed) => set({ joystickSpeed: speed }),
  clearSearch: () => set({ searchQuery: '', searchResults: [], activeSearchIndex: 0 })
}));
