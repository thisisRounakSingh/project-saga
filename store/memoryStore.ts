import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SavedSession {
  id: string; // The session ID (e.g. 'vscode-demo')
  projectName: string;
  lastOpened: number;
  localPath: string | null;
  isViewOnly: boolean;
}

interface MemoryStoreState {
  savedSessions: SavedSession[];
  addOrUpdateSession: (session: SavedSession) => void;
  removeSession: (id: string) => void;
  updateSessionMode: (
    id: string,
    isViewOnly: boolean,
    localPath: string | null,
  ) => void;
}

export const useMemoryStore = create<MemoryStoreState>()(
  persist(
    (set) => ({
      savedSessions: [],
      addOrUpdateSession: (session) =>
        set((state) => {
          const existing = state.savedSessions.find((s) => s.id === session.id);
          if (existing) {
            return {
              savedSessions: state.savedSessions
                .map((s) => (s.id === session.id ? session : s))
                .sort((a, b) => b.lastOpened - a.lastOpened),
            };
          }
          return {
            savedSessions: [session, ...state.savedSessions].sort(
              (a, b) => b.lastOpened - a.lastOpened,
            ),
          };
        }),
      removeSession: (id) =>
        set((state) => ({
          savedSessions: state.savedSessions.filter((s) => s.id !== id),
        })),
      updateSessionMode: (id, isViewOnly, localPath) =>
        set((state) => ({
          savedSessions: state.savedSessions.map((s) =>
            s.id === id ? { ...s, isViewOnly, localPath } : s,
          ),
        })),
    }),
    {
      name: "saga-memory-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
