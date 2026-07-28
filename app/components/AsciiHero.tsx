"use client";
import { useEffect, useRef } from "react";

interface Particle {
  char: string;
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function AsciiHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId: number;
    const mouse = { x: -1000, y: -1000, radius: 60 };
    const charSet = "01#@%&?!";

    const initParticles = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      if (canvas.width === 0 || canvas.height === 0) return;

      const offscreen = document.createElement("canvas");
      const step = 8;
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;

      const offscreenCtx = offscreen.getContext("2d", {
        willReadFrequently: true,
      });
      if (!offscreenCtx) return;

      offscreenCtx.fillStyle = "white";
      offscreenCtx.fillRect(0, 0, offscreen.width, offscreen.height);

      offscreenCtx.fillStyle = "black";
      const fontSizeByWidth = offscreen.width / 5;
      const fontSizeByHeight = offscreen.height / 2.5;
      const fontSize = Math.max(
        60,
        Math.min(fontSizeByWidth, fontSizeByHeight, 150),
      );
      offscreenCtx.font = `900 ${fontSize}px sans-serif`;
      offscreenCtx.textAlign = "center";
      offscreenCtx.textBaseline = "middle";
      offscreenCtx.fillText(
        "READ",
        offscreen.width / 2,
        offscreen.height / 2 - fontSize * 0.6,
        offscreen.width * 0.9,
      );
      offscreenCtx.fillText(
        "THE CODE",
        offscreen.width / 2,
        offscreen.height / 2 + fontSize * 0.6,
        offscreen.width * 0.9,
      );

      const imgData = offscreenCtx.getImageData(
        0,
        0,
        offscreen.width,
        offscreen.height,
      );

      particles = [];

      for (let y = 0; y < offscreen.height; y += step) {
        for (let x = 0; x < offscreen.width; x += step) {
          const idx = (y * offscreen.width + x) * 4;
          const r = imgData.data[idx];

          if (r < 128) {
            const actualChar =
              charSet[Math.floor(Math.random() * charSet.length)];

            particles.push({
              char: actualChar,
              ox: x,
              oy: y,
              x: x,
              y: y,
              vx: 0,
              vy: 0,
            });
          }
        }
      }
    };

    initParticles();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initParticles, 100);
    };
    window.addEventListener("resize", onResize);
    setTimeout(initParticles, 100);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    let cachedFgColor = "";
    let lastColorCheck = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (time - lastColorCheck > 500) {
        const style = getComputedStyle(document.body);
        let fg = style.getPropertyValue("--foreground").trim();
        if (!fg) {
          fg = document.documentElement.classList.contains("dark")
            ? "#ffffff"
            : "#000000";
        }
        cachedFgColor = fg;
        lastColorCheck = time;
      }

      ctx.fillStyle = cachedFgColor || "#000000";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (Math.random() < 0.05) {
          p.char = charSet[Math.floor(Math.random() * charSet.length)];
        }

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * 4;
          p.vy -= Math.sin(angle) * force * 4;
        }

        const spring = 0.15;
        const friction = 0.8;

        p.vx += (p.ox - p.x) * spring;
        p.vy += (p.oy - p.y) * spring;

        p.vx *= friction;
        p.vy *= friction;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillText(p.char, p.x, p.y);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="w-full h-50 md:h-75 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
      />
    </div>
  );
}
