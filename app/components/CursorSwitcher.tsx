"use client";
import { useEffect, useState } from "react";

export function CursorSwitcher() {
  const [native, setNative] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cursor") === "native";
    }
    return false;
  });

  useEffect(() => {
    if (native) {
      document.body.classList.add("native-cursor");
    } else {
      document.body.classList.remove("native-cursor");
    }
  }, [native]);

  const toggle = () => {
    const next = !native;
    setNative(next);
    localStorage.setItem("cursor", next ? "native" : "custom");
    if (next) {
      document.body.classList.add("native-cursor");
    } else {
      document.body.classList.remove("native-cursor");
    }
  };

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      className="bg-transparent text-foreground px-2 py-1 text-xs border border-border hover:opacity-80 transition-opacity uppercase tracking-widest font-bold"
      title="Toggle Custom Cursor"
    >
      {native ? "NATIVE CURSOR" : "CUSTOM CURSOR"}
    </button>
  );
}
