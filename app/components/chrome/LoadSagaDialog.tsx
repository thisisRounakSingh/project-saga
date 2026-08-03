"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Terminal,
  FolderGit2,
  Loader2,
  Play,
  Trash2,
  Clock,
} from "lucide-react";
import { useMemoryStore, SavedSession } from "@/store/memoryStore";
import { useRouter } from "next/navigation";

type DialogState =
  | "LIST"
  | "IMPORT"
  | "CONNECTING"
  | "CLONE_PROMPT"
  | "CLONING"
  | "NON_LOCALHOST";

export function LoadSagaDialog({
  isOpen,
  onClose,
  forceCloneSessionId,
}: {
  isOpen: boolean;
  onClose: () => void;
  forceCloneSessionId?: string;
}) {
  const router = useRouter();
  const savedSessions = useMemoryStore((state) => state.savedSessions);
  const addOrUpdateSession = useMemoryStore(
    (state) => state.addOrUpdateSession,
  );
  const removeSession = useMemoryStore((state) => state.removeSession);
  const updateSessionMode = useMemoryStore((state) => state.updateSessionMode);

  const [dialogState, setDialogState] = useState<DialogState>("LIST");
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(
    null,
  );
  const [localPathInput, setLocalPathInput] = useState("");
  const [cloneProgress, setCloneProgress] = useState(0);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1"
        ) {
          setDialogState("NON_LOCALHOST");
          return;
        }

        if (forceCloneSessionId) {
          const session = useMemoryStore
            .getState()
            .savedSessions.find((s) => s.id === forceCloneSessionId);
          if (session) {
            setSelectedSession(session);
            setDialogState("CLONE_PROMPT");
            setLocalPathInput("");
            setCloneProgress(0);
            return;
          }
        }
        setDialogState(
          useMemoryStore.getState().savedSessions.length > 0
            ? "LIST"
            : "IMPORT",
        );
        setSelectedSession(null);
        setLocalPathInput("");
        setCloneProgress(0);
      }, 0);
    }
  }, [isOpen, forceCloneSessionId]);

  const startCodexConnection = (session: SavedSession) => {
    setSelectedSession(session);
    setDialogState("CONNECTING");

    setTimeout(() => {
      // If it already has a local path OR is explicitly view-only, jump directly in
      if (session.isViewOnly || session.localPath) {
        router.push(`/s/${session.id}`);
        onClose();
      } else {
        setDialogState("CLONE_PROMPT");
      }
    }, 2500);
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      setDialogState("CONNECTING");

      try {
        const text = await file.text();
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: text,
        });

        if (!response.ok) {
          throw new Error("Failed to upload session");
        }

        const { sessionId } = await response.json();
        const parsed = JSON.parse(text);

        const newSession: SavedSession = {
          id: sessionId,
          projectName: parsed.repo?.name || "Imported Project",
          lastOpened: Date.now(),
          localPath: null,
          isViewOnly: true,
        };

        addOrUpdateSession(newSession);

        setTimeout(() => {
          router.push(`/s/${sessionId}`);
          onClose();
        }, 1500);
      } catch (err) {
        console.error("Error importing saga:", err);
        setDialogState("IMPORT");
        alert("Failed to parse or upload .saga.json");
      }
    };
    input.click();
  };

  const handleSkipClone = () => {
    if (selectedSession) {
      updateSessionMode(selectedSession.id, true, null);
      router.push(`/s/${selectedSession.id}`);
      onClose();
    }
  };

  const handleClone = () => {
    if (selectedSession && localPathInput.trim()) {
      setDialogState("CLONING");
      // Mock progress
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 15;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          updateSessionMode(selectedSession.id, false, localPathInput);
          setTimeout(() => {
            if (forceCloneSessionId === selectedSession.id) {
              window.location.reload();
            } else {
              router.push(`/s/${selectedSession.id}`);
            }
            onClose();
          }, 500);
        }
        setCloneProgress(p);
      }, 300);
    }
  };

  if (!isOpen) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center pointer-events-auto">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-background border-[3px] border-border shadow-[8px_8px_0_var(--color-border)] dark:shadow-[8px_8px_0_#fff] flex flex-col max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-[3px] border-border bg-inverted-bg text-inverted-fg">
          <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
            {dialogState === "LIST" && "Memory: Saved Sessions"}
            {dialogState === "IMPORT" && "Import .saga.json"}
            {dialogState === "NON_LOCALHOST" && "Local UI Required"}
            {(dialogState === "CONNECTING" ||
              dialogState === "CLONE_PROMPT" ||
              dialogState === "CLONING") &&
              "Codex Integration"}
          </h2>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <AnimatePresence mode="wait">
            {dialogState === "NON_LOCALHOST" && (
              <motion.div
                key="non-localhost"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6 items-center text-center py-6"
              >
                <div className="w-16 h-16 bg-accent flex items-center justify-center text-white shadow-[4px_4px_0_var(--color-border)] mb-2">
                  <Terminal className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-wider mb-2">
                    Clone the UI Locally
                  </h3>
                  <p className="text-sm font-medium opacity-80 leading-relaxed max-w-md">
                    You&apos;re viewing the hosted version. To interact with your local Codex model and open .saga.json files, please run Project Saga locally.
                  </p>
                </div>

                <div className="bg-inverted-bg text-inverted-fg p-4 text-xs font-mono text-left w-full border-[3px] border-border shadow-[4px_4px_0_var(--color-accent)] leading-loose">
                  <span className="text-muted"># Install the skill to your Codex</span><br/>
                  npx skills add thisisRounakSingh/project-saga<br/><br/>
                  <span className="text-muted"># Run it on any repository</span><br/>
                  codex &quot;$saga use the skill to explain me this repo...&quot;
                </div>

                <button
                  onClick={() => {
                    onClose();
                    router.push("/learn");
                  }}
                  className="w-full bg-background border-[3px] border-border py-4 font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_var(--color-accent)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-accent)] transition-all"
                >
                  Learn More &rarr;
                </button>
              </motion.div>
            )}

            {dialogState === "LIST" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                {savedSessions.length === 0 ? (
                  <div className="text-center py-12 text-muted border-2 border-dashed border-border">
                    <p className="font-bold tracking-widest uppercase text-sm mb-2">
                      No Saved Sessions
                    </p>
                    <p className="text-xs">
                      Your memory is empty. Import a .saga.json to begin.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {savedSessions.map((session) => (
                      <div
                        key={session.id}
                        className="group relative flex items-center justify-between border-2 border-border p-4 hover:border-accent hover:shadow-[4px_4px_0_var(--color-accent)] transition-all cursor-pointer bg-background"
                        onClick={() => startCodexConnection(session)}
                      >
                        <div className="flex flex-col">
                          <span className="font-black text-lg">
                            {session.projectName}
                          </span>
                          <span className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2 mt-1">
                            <Clock size={12} />{" "}
                            {new Date(session.lastOpened).toLocaleDateString()}
                            {session.isViewOnly && (
                              <span className="text-[10px] bg-muted/20 px-2 py-0.5 border border-border">
                                VIEW ONLY
                              </span>
                            )}
                            {session.localPath && (
                              <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 border border-green-500/30 font-mono truncate max-w-50">
                                {session.localPath}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 border-2 border-border hover:bg-muted/20 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSession(session.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className="p-2 border-2 border-border bg-accent text-white group-hover:scale-105 transition-transform">
                            <Play size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t-[3px] border-border pt-6 flex justify-end">
                  <button
                    onClick={() => setDialogState("IMPORT")}
                    className="flex items-center gap-2 bg-inverted-bg text-inverted-fg px-4 py-2 text-sm font-bold tracking-widest uppercase border-[3px] border-border hover:opacity-80 transition-opacity"
                  >
                    <Upload size={16} /> Import .saga.json
                  </button>
                </div>
              </motion.div>
            )}

            {dialogState === "IMPORT" && (
              <motion.div
                key="import"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div
                  className="border-[3px] border-dashed border-border bg-muted/5 p-12 flex flex-col items-center justify-center text-center group hover:bg-muted/10 transition-colors cursor-pointer"
                  onClick={handleImportClick}
                >
                  <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff]">
                    <Upload size={24} />
                  </div>
                  <h3 className="font-black text-xl mb-2">Upload .saga.json</h3>
                  <p className="text-sm text-muted font-bold tracking-widest uppercase">
                    Drag & Drop or Click to browse
                  </p>
                </div>

                {savedSessions.length > 0 && (
                  <div className="flex justify-start">
                    <button
                      onClick={() => setDialogState("LIST")}
                      className="text-xs font-bold tracking-widest uppercase hover:text-accent transition-colors"
                    >
                      &larr; Back to Memory
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {dialogState === "CONNECTING" && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-6 text-center"
              >
                <Loader2 size={48} className="animate-spin text-accent" />
                <div>
                  <h3 className="font-black text-2xl uppercase tracking-tighter mb-2">
                    Connecting to Codex
                  </h3>
                  <p className="text-sm font-bold text-muted uppercase tracking-widest">
                    Sharing context & verifying repository status...
                  </p>
                </div>
              </motion.div>
            )}

            {dialogState === "CLONE_PROMPT" && (
              <motion.div
                key="clone_prompt"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-yellow-500/10 border-2 border-yellow-500/50 p-4 text-yellow-700 dark:text-yellow-400 flex gap-4">
                  <Terminal className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest mb-1">
                      Codex Bridge Offline
                    </h4>
                    <p className="text-sm font-medium leading-relaxed">
                      Saga is in View-Only mode. To activate Chat and full
                      features, you must manually clone the repository and start
                      the Codex bridge:
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex gap-4 items-start border-l-2 border-accent pl-4">
                    <div className="font-black text-accent mt-0.5">1</div>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-bold uppercase tracking-widest text-xs">
                        Clone the Repository
                      </span>
                      <code className="bg-muted/20 border border-border p-2 block font-mono text-xs overflow-x-auto text-foreground whitespace-pre">
                        git clone &lt;repository-url&gt;
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start border-l-2 border-accent pl-4">
                    <div className="font-black text-accent mt-0.5">2</div>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-bold uppercase tracking-widest text-xs">
                        Start Codex
                      </span>
                      <code className="bg-muted/20 border border-border p-2 block font-mono text-xs text-foreground whitespace-pre">
                        cd &lt;repository-folder&gt;{"\n"}codex
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start border-l-2 border-accent pl-4">
                    <div className="font-black text-accent mt-0.5">3</div>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-bold uppercase tracking-widest text-xs">
                        Activate Bridge
                      </span>
                      <span className="text-muted-foreground text-xs leading-relaxed">
                        Ask Codex this exact phrase in the terminal to connect:
                      </span>
                      <code className="bg-muted/20 border border-border p-2 block font-mono text-xs text-foreground whitespace-pre">
                        Activate the bridge for{" "}
                        {typeof window !== "undefined"
                          ? window.location.origin
                          : "http://localhost:3000"}
                        /s/{selectedSession?.id}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">
                    Confirm Local Clone Path
                  </label>
                  <div className="flex items-center border-[3px] border-border bg-background px-3 py-2 focus-within:border-accent focus-within:shadow-[4px_4px_0_var(--color-accent)] transition-all">
                    <FolderGit2 size={16} className="text-muted mr-3" />
                    <input
                      type="text"
                      value={localPathInput}
                      onChange={(e) => setLocalPathInput(e.target.value)}
                      placeholder="e.g. ~/Workspace/collegework-java"
                      className="flex-1 bg-transparent border-none outline-none text-sm font-mono placeholder:text-muted/50"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    onClick={handleClone}
                    disabled={!localPathInput.trim()}
                    className="flex-1 bg-accent text-white px-4 py-3 text-sm font-bold tracking-widest uppercase border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    I Have Activated the Bridge
                  </button>
                  <button
                    onClick={handleSkipClone}
                    className="bg-background text-foreground px-6 py-3 text-sm font-bold tracking-widest uppercase border-[3px] border-border border-dashed hover:bg-muted/10 transition-colors"
                  >
                    Skip (View-Only)
                  </button>
                </div>
              </motion.div>
            )}

            {dialogState === "CLONING" && (
              <motion.div
                key="cloning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-8 py-8"
              >
                <div className="text-center">
                  <h3 className="font-black text-2xl uppercase tracking-tighter mb-2">
                    Codex is Cloning
                  </h3>
                  <p className="text-sm font-mono text-muted truncate max-w-sm mx-auto">
                    {localPathInput}
                  </p>
                </div>

                <div className="w-full h-4 bg-muted/20 border-2 border-border overflow-hidden relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${cloneProgress}%` }}
                    transition={{ ease: "linear", duration: 0.3 }}
                  />
                </div>

                <p className="text-center font-bold tracking-widest uppercase text-sm">
                  {Math.round(cloneProgress)}% COMPLETE
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(dialogContent, document.body)
    : dialogContent;
}
