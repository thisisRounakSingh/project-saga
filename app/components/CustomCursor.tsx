"use client";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [isNative, setIsNative] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [cursorType, setCursorType] = useState<"default" | "text" | "pointer">("default");

  useEffect(() => {
    const checkState = () => setIsNative(document.body.classList.contains("native-cursor"));
    checkState();
    
    const observer = new MutationObserver(checkState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const move = (e: MouseEvent) => {
      setHasMoved(true);
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = target.closest('a, button, [role="button"]') !== null;
        
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

        if (isClickable) {
          setCursorType("pointer");
        } else if (isText) {
          setCursorType("text");
        } else {
          setCursorType("default");
        }
      }
    };
    window.addEventListener("mousemove", move);

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", move);
    };
  }, []);

  if (isNative || !hasMoved) return null;

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 mix-blend-difference"
      style={{
        zIndex: 2147483647,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
      }}
    >
      {cursorType === "text" && (
        <div className="w-0.5 h-6 bg-white absolute -top-3 -left-px" />
      )}
      
      {cursorType === "pointer" && (
        <div className="w-7.5 h-7.5 border-[3px] border-white rounded-full absolute -top-3.75 -left-3.75 bg-transparent transition-all duration-150 ease-out" />
      )}

      {cursorType === "default" && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="35" height="35" fill="white" className="absolute -top-0.75 -left-2.25">
          <path d="M 13.277344 5 C 13.011344 5 12.757313 5.1049688 12.570312 5.2929688 C 12.383312 5.4809687 12.277344 5.734 12.277344 6 L 12.279297 39 C 12.279297 39.553 12.726297 40 13.279297 40 L 16.277344 40 L 16.277344 5 L 13.277344 5 z M 18.277344 5.5683594 L 18.277344 39.417969 L 25.423828 32.464844 C 25.658828 32.235844 25.991453 32.136219 26.314453 32.199219 C 26.636453 32.263219 26.908063 32.481203 27.039062 32.783203 L 32.984375 46.519531 L 36.501953 44.904297 C 37.003953 44.674297 37.224141 44.082078 36.994141 43.580078 L 30.90625 30.279297 L 41.095703 29.404297 C 41.488703 29.371297 41.824125 29.110281 41.953125 28.738281 C 42.082125 28.366281 41.981312 27.954594 41.695312 27.683594 L 18.277344 5.5683594 z M 25.779297 34.908203 L 23.171875 37.445312 L 26.902344 46.384766 C 27.057344 46.758766 27.421219 47 27.824219 47 L 31.011719 47 L 25.779297 34.908203 z"/>
        </svg>
      )}
    </div>
  );
}
