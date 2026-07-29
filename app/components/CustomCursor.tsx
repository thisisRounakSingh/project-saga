"use client";
import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isNative, setIsNative] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [cursorType, setCursorType] = useState<"default" | "text" | "pointer" | "canvas" | "canvas-dragging">("default");

  useEffect(() => {
    const checkState = () => setIsNative(document.body.classList.contains("native-cursor"));
    checkState();
    
    const observer = new MutationObserver(checkState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    let currentCursorType = "default";
    let firstMove = true;

    const move = (e: MouseEvent) => {
      if (firstMove) {
        setHasMoved(true);
        firstMove = false;
      }
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      const target = e.target as Element | null;
      let nextType: "default" | "text" | "pointer" | "canvas" | "canvas-dragging" = "default";

      if (target && typeof target.closest === 'function') {
        const isClickable = target.closest('a, button, [role="button"]') !== null;
        const isCanvas = target.closest('.react-flow') !== null;
        
        let isText = false;
        if (['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(target.tagName)) {
          isText = true;
        } else {
          for (let i = 0; i < target.childNodes.length; i++) {
            const child = target.childNodes[i];
            if (child.nodeType === 3 && child.textContent?.trim().length) {
              isText = true;
              break;
            }
          }
        }

        if (isCanvas) {
          nextType = e.buttons === 1 ? "canvas-dragging" : "canvas";
        } else if (isClickable) {
          nextType = "pointer";
        } else if (isText) {
          nextType = "text";
        }
      }

      if (currentCursorType !== nextType) {
        currentCursorType = nextType;
        setCursorType(nextType);
      }
    };

    const up = () => {
      if (currentCursorType === "canvas-dragging") {
        currentCursorType = "canvas";
        setCursorType("canvas");
      }
    };

    window.addEventListener("pointermove", move, { passive: true, capture: true });
    window.addEventListener("pointerup", up, { passive: true, capture: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", move, { capture: true });
      window.removeEventListener("pointerup", up, { capture: true });
    };
  }, []);

  if (isNative || !hasMoved) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 will-change-transform"
      style={{
        zIndex: 2147483647,
      }}
    >
      {cursorType === "text" && (
        <div className="w-0.5 h-6 bg-foreground absolute -top-3 -left-px" />
      )}
      
      {cursorType === "pointer" && (
        <div className="w-7.5 h-7.5 border-[3px] border-foreground rounded-full absolute -top-3.75 -left-3.75 bg-transparent transition-all duration-150 ease-out shadow-sm" />
      )}

      {cursorType === "canvas" && (
        <div className="w-6 h-6 border-[3px] border-foreground rounded-full absolute -top-3 -left-3 bg-transparent transition-all duration-150 ease-out shadow-sm" />
      )}

      {cursorType === "canvas-dragging" && (
        <div className="w-3 h-3 bg-foreground rounded-full absolute -top-1.5 -left-1.5 transition-all duration-150 ease-out shadow-sm" />
      )}

      {cursorType === "default" && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="35" height="35" className="absolute -top-0.75 -left-2.25 drop-shadow-md">
          <path fill="var(--foreground)" stroke="var(--background)" strokeWidth="1.5" d="M 13.277344 5 C 13.011344 5 12.757313 5.1049688 12.570312 5.2929688 C 12.383312 5.4809687 12.277344 5.734 12.277344 6 L 12.279297 39 C 12.279297 39.553 12.726297 40 13.279297 40 L 16.277344 40 L 16.277344 5 L 13.277344 5 z M 18.277344 5.5683594 L 18.277344 39.417969 L 25.423828 32.464844 C 25.658828 32.235844 25.991453 32.136219 26.314453 32.199219 C 26.636453 32.263219 26.908063 32.481203 27.039062 32.783203 L 32.984375 46.519531 L 36.501953 44.904297 C 37.003953 44.674297 37.224141 44.082078 36.994141 43.580078 L 30.90625 30.279297 L 41.095703 29.404297 C 41.488703 29.371297 41.824125 29.110281 41.953125 28.738281 C 42.082125 28.366281 41.981312 27.954594 41.695312 27.683594 L 18.277344 5.5683594 z M 25.779297 34.908203 L 23.171875 37.445312 L 26.902344 46.384766 C 27.057344 46.758766 27.421219 47 27.824219 47 L 31.011719 47 L 25.779297 34.908203 z"/>
        </svg>
      )}
    </div>
  );
}
