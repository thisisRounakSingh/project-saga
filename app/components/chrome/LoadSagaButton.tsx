"use client";

import { useState } from "react";
import { LoadSagaDialog } from "./LoadSagaDialog";

export function LoadSagaButton({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        LOAD.SAGA &rarr;
      </button>
      <LoadSagaDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
