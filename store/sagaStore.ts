import { create } from "zustand";
import { SagaSession } from "@/lib/saga/schema";

export type PanelState = "docked" | "expanded" | "maximized";
export type PanelTab = "narration" | "chat" | "stack" | "file";

export interface ChatContextItem {
  actId: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

export interface ChatTab {
  id: string;
  title: string;
  chatHistory: ChatMessage[];
  pendingChatContext: ChatContextItem[];
  isArchived?: boolean;
}

interface SagaStoreState {
  sessionData: SagaSession | null;
  activeActId: string | null;
  activePanelTab: PanelTab;
  panelState: PanelState;
  pinnedNodeIds: string[];
  selectedNodeIds: string[];
  contextMenuNodeId: string | null;

  // Search State
  searchQuery: string;
  searchResults: string[];
  activeSearchIndex: number;

  // Steering Wheel Settings
  joystickSpeed: number;

  // Chat Context
  chatTabs: ChatTab[];
  activeChatTabId: string;
  isTyping: boolean;

  // Playback
  isPlaying: boolean;
  activeNarrationIndex: number;
  isCinematicMode: boolean;
  narrationSpeed: number;

  // Whiteboard
  isWhiteboardMode: boolean;
  whiteboardColor: string;
  setIsWhiteboardMode: (val: boolean) => void;
  setWhiteboardColor: (val: string) => void;

  trashCanFiles: { id: string; name: string; summary: string; actId: string }[];

  setSessionData: (data: SagaSession) => void;
  setActiveActId: (id: string) => void;
  setActivePanelTab: (tab: PanelTab) => void;
  setPanelState: (state: PanelState) => void;
  toggleNodePin: (id: string) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  setContextMenuNodeId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: string[]) => void;
  setActiveSearchIndex: (index: number) => void;
  setJoystickSpeed: (speed: number) => void;
  clearSearch: () => void;
  setIsPlaying: (val: boolean) => void;
  setActiveNarrationIndex: (index: number) => void;
  toggleCinematicMode: () => void;
  isTransitioningAct: boolean;
  setIsTransitioningAct: (val: boolean) => void;
  setNarrationSpeed: (speed: number) => void;
  addTrashCanFile: (file: {
    id: string;
    name: string;
    summary: string;
    actId: string;
  }) => void;
  clearTrashCan: () => void;

  // Chat Actions
  createChatTab: () => void;
  switchChatTab: (id: string) => void;
  closeChatTab: (id: string) => void;
  restoreChatTab: (id: string) => void;
  addPendingChatContext: (item: ChatContextItem) => void;
  removePendingChatContext: (index: number) => void;
  clearPendingChatContext: () => void;
  pushChatMessage: (msg: ChatMessage) => void;
  submitDirectQuestion: (text: string) => void;
}

export const useSagaStore = create<SagaStoreState>((set) => ({
  sessionData: null,
  activeActId: null,
  activePanelTab: "narration",
  panelState: "docked",
  pinnedNodeIds: [],
  selectedNodeIds: [],
  contextMenuNodeId: null,
  searchQuery: "",
  searchResults: [],
  activeSearchIndex: 0,
  joystickSpeed: 8,
  chatTabs: [
    {
      id: "default",
      title: "Main Chat",
      chatHistory: [],
      pendingChatContext: [],
      isArchived: false,
    },
  ],
  activeChatTabId: "default",
  isTyping: false,
  isPlaying: false,
  activeNarrationIndex: 0,
  isCinematicMode: false,
  isTransitioningAct: false,
  narrationSpeed: 5000,
  isWhiteboardMode: false,
  whiteboardColor: "#ef4444",
  trashCanFiles: [],

  setSessionData: (data) =>
    set({
      sessionData: data,
      activeActId: data.acts[0]?.id || null,
      activeNarrationIndex: 0,
      searchQuery: "",
      searchResults: [],
      activeSearchIndex: 0,
    }),
  setActiveActId: (id) =>
    set({
      activeActId: id,
      searchQuery: "",
      searchResults: [],
      activeSearchIndex: 0,
      activeNarrationIndex: 0,
    }),
  setActivePanelTab: (tab) => set({ activePanelTab: tab }),
  setPanelState: (state) => set({ panelState: state }),
  toggleNodePin: (id) =>
    set((state) => ({
      pinnedNodeIds: state.pinnedNodeIds.includes(id)
        ? state.pinnedNodeIds.filter((pinnedId) => pinnedId !== id)
        : [...state.pinnedNodeIds, id],
    })),
  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  setContextMenuNodeId: (id) => set({ contextMenuNodeId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) =>
    set({ searchResults: results, activeSearchIndex: 0 }),
  setActiveSearchIndex: (index) => set({ activeSearchIndex: index }),
  setJoystickSpeed: (speed) => set({ joystickSpeed: speed }),
  clearSearch: () =>
    set({ searchQuery: "", searchResults: [], activeSearchIndex: 0 }),
  setIsPlaying: (val) => set({ isPlaying: val }),
  setActiveNarrationIndex: (index) => set({ activeNarrationIndex: index }),
  toggleCinematicMode: () =>
    set((state) => ({ isCinematicMode: !state.isCinematicMode })),
  setIsTransitioningAct: (val) => set({ isTransitioningAct: val }),
  setNarrationSpeed: (speed) => set({ narrationSpeed: speed }),
  setIsWhiteboardMode: (val) => set({ isWhiteboardMode: val }),
  setWhiteboardColor: (val) => set({ whiteboardColor: val }),
  addTrashCanFile: (file) =>
    set((state) => {
      if (
        state.trashCanFiles.find(
          (f) => f.id === file.id && f.actId === file.actId,
        )
      )
        return state;
      return { trashCanFiles: [...state.trashCanFiles, file] };
    }),
  clearTrashCan: () => set({ trashCanFiles: [] }),

  createChatTab: () =>
    set((state) => {
      const newTabId = Date.now().toString();
      return {
        chatTabs: [
          ...state.chatTabs,
          {
            id: newTabId,
            title: `Chat ${state.chatTabs.length + 1}`,
            chatHistory: [],
            pendingChatContext: [],
            isArchived: false,
          },
        ],
        activeChatTabId: newTabId,
      };
    }),
  switchChatTab: (id) => set({ activeChatTabId: id }),
  closeChatTab: (id) =>
    set((state) => {
      const newTabs = state.chatTabs.map((t) =>
        t.id === id ? { ...t, isArchived: true } : t,
      );
      const activeTabs = newTabs.filter((t) => !t.isArchived);

      if (activeTabs.length === 0) {
        const defaultTab = {
          id: Date.now().toString(),
          title: "Main Chat",
          chatHistory: [],
          pendingChatContext: [],
          isArchived: false,
        };
        return {
          chatTabs: [...newTabs, defaultTab],
          activeChatTabId: defaultTab.id,
        };
      }

      return {
        chatTabs: newTabs,
        activeChatTabId:
          state.activeChatTabId === id
            ? activeTabs[activeTabs.length - 1].id
            : state.activeChatTabId,
      };
    }),
  restoreChatTab: (id) =>
    set((state) => ({
      chatTabs: state.chatTabs.map((t) =>
        t.id === id ? { ...t, isArchived: false } : t,
      ),
      activeChatTabId: id,
    })),
  addPendingChatContext: (item) =>
    set((state) => {
      return {
        chatTabs: state.chatTabs.map((tab) => {
          if (tab.id === state.activeChatTabId) {
            // Prevent duplicates
            if (tab.pendingChatContext.some((ctx) => ctx.text === item.text))
              return tab;
            return {
              ...tab,
              pendingChatContext: [...tab.pendingChatContext, item],
            };
          }
          return tab;
        }),
      };
    }),
  removePendingChatContext: (index) =>
    set((state) => ({
      chatTabs: state.chatTabs.map((tab) =>
        tab.id === state.activeChatTabId
          ? {
              ...tab,
              pendingChatContext: tab.pendingChatContext.filter(
                (_, i) => i !== index,
              ),
            }
          : tab,
      ),
    })),
  clearPendingChatContext: () =>
    set((state) => ({
      chatTabs: state.chatTabs.map((tab) =>
        tab.id === state.activeChatTabId
          ? { ...tab, pendingChatContext: [] }
          : tab,
      ),
    })),
  pushChatMessage: (msg) =>
    set((state) => ({
      chatTabs: state.chatTabs.map((tab) =>
        tab.id === state.activeChatTabId
          ? { ...tab, chatHistory: [...tab.chatHistory, msg] }
          : tab,
      ),
    })),
  submitDirectQuestion: async (text) => {
    // Retrieve current state to push message
    const state = useSagaStore.getState();
    const activeTab = state.chatTabs.find(
      (t) => t.id === state.activeChatTabId,
    );

    // Prevent exact duplicate questions if last message is identical
    if (activeTab && activeTab.chatHistory.length > 0) {
      const lastMsg = activeTab.chatHistory[activeTab.chatHistory.length - 1];
      if (lastMsg.role === "user" && lastMsg.text === text) return;
    }

    state.pushChatMessage({
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: Date.now(),
    });
    set({ isTyping: true });

    // Extract sessionId from URL (e.g. /s/vscode-demo)
    const urlParts =
      typeof window !== "undefined"
        ? window.location.pathname.split("/s/")
        : [];
    const sessionId = urlParts.length > 1 ? urlParts[1].split("/")[0] : null;

    if (!sessionId) {
      console.error("Could not determine session ID from URL");
      set({ isTyping: false });
      return;
    }

    try {
      // 1. Submit the question to the API
      const askRes = await fetch(`/api/sessions/${sessionId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          context: {
            quotedNarration:
              activeTab?.pendingChatContext.map((c) => ({
                actId: c.actId,
                text: c.text,
              })) || [],
            pinnedFiles: state.pinnedNodeIds,
            selectedNodeIds: state.selectedNodeIds,
          },
          actId: state.activeActId,
        }),
      });

      if (!askRes.ok) {
        throw new Error(`Failed to submit question: ${askRes.statusText}`);
      }

      // Clear pending context after submission
      state.clearPendingChatContext();

      const { questionId } = await askRes.json();

      // 2. Poll for the answer
      // Timeout after 5 minutes just in case
      const timeoutId = setTimeout(() => {
        clearInterval(pollInterval);
        const currentState = useSagaStore.getState();
        if (currentState.isTyping) {
          currentState.pushChatMessage({
            id: (Date.now() + 2).toString(),
            role: "ai",
            text: "Request timed out while waiting for Codex to answer.",
            timestamp: Date.now(),
          });
          set({ isTyping: false });
        }
      }, 300_000);

      const pollInterval = setInterval(async () => {
        try {
          const ansRes = await fetch(
            `/api/sessions/${sessionId}/answer?questionId=${questionId}`,
          );
          if (ansRes.ok) {
            const data = await ansRes.json();
            if (!data.pending) {
              clearInterval(pollInterval);
              clearTimeout(timeoutId);

              const currentState = useSagaStore.getState();
              currentState.pushChatMessage({
                id: (Date.now() + 1).toString(),
                role: "ai",
                text:
                  data.answer || "I'm sorry, I couldn't generate an answer.",
                timestamp: data.timestamp || Date.now(),
              });
              set({ isTyping: false });
            }
          }
        } catch (pollErr) {
          console.error("Error polling for answer:", pollErr);
          // Keep polling, it might be a temporary network blip
        }
      }, 1000);
    } catch (err) {
      console.error("Error submitting direct question:", err);
      const currentState = useSagaStore.getState();
      currentState.pushChatMessage({
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: "Failed to submit question. Ensure the bridge is running.",
        timestamp: Date.now(),
      });
      set({ isTyping: false });
    }
  },
}));
