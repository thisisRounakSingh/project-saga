'use client';

import { useSagaStore } from '@/store/sagaStore';
import { MessageSquareQuote, CheckCircle2, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export function NarrationView() {
  const sessionData = useSagaStore(state => state.sessionData);
  const activeActId = useSagaStore(state => state.activeActId);
  const addPendingChatContext = useSagaStore(state => state.addPendingChatContext);
  const setActivePanelTab = useSagaStore(state => state.setActivePanelTab);
  const activeNarrationIndex = useSagaStore(state => state.activeNarrationIndex);
  const isPlaying = useSagaStore(state => state.isPlaying);
  const activeBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPlaying && activeBlockRef.current) {
      activeBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeNarrationIndex, isPlaying]);

  const activeAct = sessionData?.acts.find(a => a.id === activeActId);

  if (!activeAct) return <div className="p-6">No active act.</div>;

  const handleQuote = (text: string) => {
    addPendingChatContext({ actId: activeAct.id, text });
    setActivePanelTab('chat');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-8 pb-20">
      
      {/* Narration Section */}
      <div className="space-y-4">
        {activeAct.narration.slice(1).map((block, idx) => {
          const absoluteIndex = idx + 1;
          const isActive = isPlaying && activeNarrationIndex === absoluteIndex;
          const isPast = !isPlaying || activeNarrationIndex >= absoluteIndex;
          
          return (
            <motion.div 
              key={idx}
              ref={isActive ? activeBlockRef : null}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isPast ? 1 : 0.4, y: 0, scale: isActive ? 1.02 : 1 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className={`group relative p-4 border-[3px] border-border shadow-[2px_2px_0_var(--color-border)] dark:shadow-[2px_2px_0_#fff] transition-all ${
                isActive ? 'bg-accent/10 border-accent ring-2 ring-accent' : 'bg-muted/10'
              }`}
            >
            <p className="text-foreground leading-relaxed">
              {block.text}
            </p>
            <button
              onClick={() => handleQuote(block.text)}
              title="Quote in Chat"
              className="absolute -bottom-3 -right-3 p-2 bg-background border-[3px] border-border text-muted hover:text-accent hover:border-accent hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_var(--color-border)] dark:hover:shadow-[4px_4px_0_#fff] transition-all rounded-full opacity-0 group-hover:opacity-100"
            >
              <MessageSquareQuote size={16} />
            </button>
          </motion.div>
          );
        })}
      </div>

      {/* Q&A Section */}
      {activeAct.qa.length > 0 && (
        <div className="space-y-4 pt-4 border-t-[3px] border-border border-dashed">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-4">AI Inferences</h3>
          
          {activeAct.qa.map((qa, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (activeAct.narration.length + idx) * 0.1 }}
              className="flex flex-col gap-2 p-4 border-[3px] border-border bg-background shadow-[2px_2px_0_var(--color-border)] dark:shadow-[2px_2px_0_#fff]"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-bold text-foreground">
                  {qa.question}
                </p>
                {qa.confidence === 'confirmed' ? (
                  <span className="shrink-0 inline-flex items-center gap-1 bg-accent text-white px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border-[3px] border-border">
                    <CheckCircle2 size={12} /> Confirmed
                  </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1 bg-transparent text-accent px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border-[3px] border-dashed border-accent">
                    <HelpCircle size={12} /> Inferred
                  </span>
                )}
              </div>
              <p className="text-muted text-sm leading-relaxed mt-2 border-l-[3px] border-accent pl-3 py-1">
                {qa.answer}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
