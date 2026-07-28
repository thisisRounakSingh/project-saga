"use client";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState("auto");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "auto";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme);
  }, []);

  const applyTheme = (t: string) => {
    const root = document.documentElement;
    if (t === "auto") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (systemDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else if (t === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const cycleTheme = () => {
    const nextTheme =
      theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      onClick={cycleTheme}
      className="text-xs font-bold tracking-widest uppercase border-[3px] border-border px-3 py-1 bg-background text-foreground hover:bg-inverted-bg hover:text-inverted-fg transition-colors"
    >
      THEME: {theme}
    </button>
  );
}
