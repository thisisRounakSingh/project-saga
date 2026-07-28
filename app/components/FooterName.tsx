"use client";
import { useEffect, useRef } from "react";

export function FooterName() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    // Mix of English, Japanese Katakana, Cyrillic, and Greek
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンБГДЖИЛПУФЦЧШЩЮЯΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ";

    const textA = "＠ディス・イズ・ロウナク・シン";
    const textB = "@thisisrounaksingh";

    let isA = true;
    let lastSwitch = Date.now();
    let lastTick = Date.now();

    let charStates: { iters: number; char: string }[] = Array(textA.length)
      .fill(0)
      .map(() => ({ iters: 0, char: "" }));

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = 350;
    const cssHeight = 30;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    let cachedFgColor = "";
    let lastColorCheck = 0;

    let wA = 0;
    let wB = 0;
    let currentWrapperWidth = 0;

    const render = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const now = Date.now();
      const elapsed = now - lastSwitch;

      // Switch every 4 seconds to give plenty of time to read
      if (elapsed > 4000) {
        isA = !isA;
        lastSwitch = now;
        const nextText = isA ? textA : textB;
        // Setup decoder effect for each character
        charStates = Array(nextText.length)
          .fill(0)
          .map(() => ({
            // Between 15 and 45 ticks (0.6s to 1.8s of scrambling)
            iters: 15 + Math.floor(Math.random() * 30),
            char: chars[Math.floor(Math.random() * chars.length)],
          }));
      }

      // Slower tick rate for character cycling (every 40ms)
      if (now - lastTick > 40) {
        for (let i = 0; i < charStates.length; i++) {
          if (charStates[i].iters > 0) {
            charStates[i].iters--;
            charStates[i].char =
              chars[Math.floor(Math.random() * chars.length)];
          }
        }
        lastTick = now;
      }

      if (now - lastColorCheck > 500) {
        const style = getComputedStyle(document.body);
        let fg = style.getPropertyValue("--foreground").trim();
        if (!fg) {
          fg = document.documentElement.classList.contains("dark")
            ? "#ffffff"
            : "#000000";
        }
        cachedFgColor = fg;
        lastColorCheck = now;
      }

      ctx.fillStyle = cachedFgColor || "#000000";
      ctx.font = "900 18px sans-serif";
      ctx.textBaseline = "middle";

      if (wA === 0) {
        wA = ctx.measureText(textA).width;
        wB = ctx.measureText(textB).width;
        currentWrapperWidth = wA;
        wrapper.style.width = `${currentWrapperWidth}px`;
      }

      const targetWidth = isA ? wA : wB;
      currentWrapperWidth += (targetWidth - currentWrapperWidth) * 0.15;
      wrapper.style.width = `${currentWrapperWidth}px`;

      const targetText = isA ? textA : textB;

      const charWidths = targetText
        .split("")
        .map((c) => ctx.measureText(c).width);
      const totalTargetWidth = charWidths.reduce((a, b) => a + b, 0);

      let currentX = cssWidth / 2 - totalTargetWidth / 2;
      ctx.textAlign = "center";

      for (let i = 0; i < targetText.length; i++) {
        const charW = charWidths[i];
        const centerX = currentX + charW / 2;

        let displayChar = targetText[i];
        if (charStates[i] && charStates[i].iters > 0) {
          displayChar = charStates[i].char;
        }

        ctx.fillText(displayChar, centerX, cssHeight / 2);
        currentX += charW;
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative mx-2 h-7.5"
      style={{ width: "200px" }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "350px", height: "30px" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none pointer-events-none select-none"
      />
    </div>
  );
}
