"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useMemoryStore } from "@/store/memoryStore";
import { useSagaStore } from "@/store/sagaStore";
import {
  X,
  Send,
  Bot,
  User,
  Pin,
  Plus,
  Trash2,
  RefreshCcw,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ChatView() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const currentSession = useMemoryStore((state) =>
    state.savedSessions.find((s) => s.id === sessionId),
  );
  const isViewOnly = currentSession?.isViewOnly || false;

  const chatTabs = useSagaStore((state) => state.chatTabs);
  const activeChatTabId = useSagaStore((state) => state.activeChatTabId);
  const createChatTab = useSagaStore((state) => state.createChatTab);
  const switchChatTab = useSagaStore((state) => state.switchChatTab);
  const closeChatTab = useSagaStore((state) => state.closeChatTab);
  const restoreChatTab = useSagaStore((state) => state.restoreChatTab);
  const removePendingChatContext = useSagaStore(
    (state) => state.removePendingChatContext,
  );
  const clearPendingChatContext = useSagaStore(
    (state) => state.clearPendingChatContext,
  );
  const pinnedNodeIds = useSagaStore((state) => state.pinnedNodeIds);
  const submitDirectQuestion = useSagaStore(
    (state) => state.submitDirectQuestion,
  );

  const activeTab = chatTabs.find((t) => t.id === activeChatTabId);
  const pendingChatContext = activeTab?.pendingChatContext || [];
  const chatHistory = activeTab?.chatHistory || [];
  const toggleNodePin = useSagaStore((state) => state.toggleNodePin);
  const isTyping = useSagaStore((state) => state.isTyping);

  const [input, setInput] = useState("");
  const [showTrash, setShowTrash] = useState(false);

  const activeTabs = chatTabs.filter((t) => !t.isArchived);
  const archivedTabs = chatTabs.filter((t) => t.isArchived);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory.length, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && pendingChatContext.length === 0) return;

    // Build context prefix if any
    const contextPrefix =
      pendingChatContext.length > 0
        ? `[Referring to ${pendingChatContext.length} quote(s)]\n`
        : "";

    const fullMessage = contextPrefix + input;
    submitDirectQuestion(fullMessage);

    setInput("");
    clearPendingChatContext();
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      {/* Mock Session Indicator removed */}

      {/* Chat Tabs Bar */}
      <div className="shrink-0 flex items-center justify-between bg-muted/10 border-b-[3px] border-border p-2 gap-2 relative">
        <div className="flex items-center gap-2 overflow-x-auto">
          {activeTabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-1.5 border-2 cursor-pointer transition-all ${
                activeChatTabId === tab.id
                  ? "bg-accent text-white border-accent shadow-[2px_2px_0_var(--color-border)] dark:shadow-[2px_2px_0_#fff]"
                  : "bg-background border-border hover:-translate-y-0.5"
              }`}
              onClick={() => switchChatTab(tab.id)}
            >
              <span className="text-xs font-bold whitespace-nowrap">
                {tab.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeChatTab(tab.id);
                }}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={createChatTab}
            className="shrink-0 p-1.5 border-2 border-border bg-background hover:-translate-y-0.5 transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={() => setShowTrash(!showTrash)}
          className={`shrink-0 p-1.5 border-2 transition-all ${
            showTrash
              ? "bg-accent text-white border-accent"
              : "bg-background border-border hover:-translate-y-0.5 text-muted"
          }`}
          title="Archived Tabs"
        >
          <Trash2 size={14} />
        </button>

        {/* Trash Dropdown */}
        <AnimatePresence>
          {showTrash && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-2 top-full mt-2 w-48 bg-background border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] z-100 flex flex-col p-2 gap-2"
            >
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted border-b-2 border-border pb-1 mb-1">
                Archived Tabs
              </h4>
              {archivedTabs.length === 0 ? (
                <p className="text-xs text-muted text-center py-2">
                  No archived tabs
                </p>
              ) : (
                archivedTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="flex items-center justify-between p-2 bg-muted/10 hover:bg-muted/20 border-2 border-border text-xs"
                  >
                    <span className="font-bold truncate max-w-25">
                      {tab.title}
                    </span>
                    <button
                      onClick={() => {
                        restoreChatTab(tab.id);
                        setShowTrash(false);
                      }}
                      className="text-accent hover:scale-110 transition-transform"
                      title="Restore Session"
                    >
                      <RefreshCcw size={12} />
                    </button>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted">
            <Bot size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest text-center">
              Ask about this codebase
            </p>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`shrink-0 w-8 h-8 rounded border-[3px] border-border flex items-center justify-center ${
                  msg.role === "user" ? "bg-muted/20" : "bg-accent text-white"
                }`}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3 border-[3px] border-border text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-muted/10 shadow-[2px_2px_0_var(--color-border)] dark:shadow-[2px_2px_0_#fff]"
                      : "bg-background shadow-[2px_2px_0_var(--color-accent)] border-l-[3px] border-l-accent"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))
        )}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 flex-row"
          >
            <div className="shrink-0 w-8 h-8 rounded border-[3px] border-border bg-accent text-white flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="p-3 border-[3px] border-border bg-background shadow-[2px_2px_0_var(--color-accent)] border-l-[3px] border-l-accent text-sm text-muted">
              <span className="animate-pulse">Typing...</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t-[3px] border-border bg-background p-4 relative">
        {isViewOnly && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center border-t-[3px] border-border">
            <div className="flex items-center gap-2 text-muted font-bold tracking-widest uppercase text-xs">
              <Info size={14} />
              Chat Disabled in View-Only Mode
            </div>
          </div>
        )}
        
        {/* Context Tray (Pending Quotes + Pinned Nodes) */}
        <AnimatePresence>
          {(pendingChatContext.length > 0 || pinnedNodeIds.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-3"
            >
              {pendingChatContext.map((ctx, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-muted/20 border-2 border-border rounded-full px-3 py-1 text-xs"
                >
                  <span
                    className="font-bold text-muted-foreground truncate max-w-37.5"
                    title={ctx.text}
                  >
                    &quot;{ctx.text}&quot;
                  </span>
                  <button
                    onClick={() => removePendingChatContext(idx)}
                    className="text-muted hover:text-foreground transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {pinnedNodeIds.map((nodeId) => (
                <div
                  key={`pin-${nodeId}`}
                  className="flex items-center gap-2 bg-accent/20 border-2 border-accent/50 rounded-full px-3 py-1 text-xs"
                >
                  <Pin size={12} className="text-accent" />
                  <span
                    className="font-bold text-foreground truncate max-w-37.5"
                    title={`Pinned: ${nodeId}`}
                  >
                    {nodeId}
                  </span>
                  <button
                    onClick={() => toggleNodePin(nodeId)}
                    className="text-muted hover:text-foreground transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isViewOnly ? "Chat disabled..." : "Ask a question..."}
            disabled={isViewOnly}
            className="flex-1 bg-muted/10 border-[3px] border-border p-3 text-sm focus:outline-none focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isViewOnly || (!input.trim() && pendingChatContext.length === 0)}
            className="shrink-0 bg-accent text-white border-[3px] border-border p-3 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-border)] dark:hover:shadow-[2px_2px_0_#fff] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
