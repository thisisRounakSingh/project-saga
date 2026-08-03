"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export function SkillButton({ skillContent }: { skillContent: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-background text-foreground px-8 py-4 text-sm font-bold tracking-widest uppercase border-[3px] border-border border-dashed hover:bg-border hover:text-background dark:hover:text-background transition-colors"
      >
        SKILL.MD
      </button>

      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-background border-[3px] border-border shadow-[8px_8px_0_var(--color-border)] dark:shadow-[8px_8px_0_#fff] w-full max-w-4xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-[3px] border-border bg-dots relative overflow-hidden">
              <h2 className="text-xl font-black uppercase tracking-wider relative z-10 bg-background/80 px-2 border-2 border-border shadow-[2px_2px_0_var(--color-border)] dark:shadow-[2px_2px_0_#fff]">SKILL.MD</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 border-2 border-border bg-background hover:bg-muted/20 transition-colors shadow-[2px_2px_0_var(--color-border)] dark:shadow-[2px_2px_0_#fff] relative z-10"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background text-foreground">
              <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {skillContent}
              </pre>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
