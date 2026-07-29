'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Move, Settings } from 'lucide-react';
import { useSagaStore } from '@/store/sagaStore';

export function SteeringWheel() {
  const { setViewport, getViewport, getNodes, zoomIn, zoomOut, fitView } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const joystickSpeed = useSagaStore(state => state.joystickSpeed);
  const setJoystickSpeed = useSagaStore(state => state.setJoystickSpeed);

  // Joystick state
  const rAF = useRef<number | null>(null);
  const joystickPos = useRef({ x: 0, y: 0 });
  const isZooming = useRef(false);
  const isCtrlHeld = useRef(false);
  const pressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') isCtrlHeld.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') isCtrlHeld.current = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startPanning = () => {
    if (rAF.current) return;
    const loop = () => {
      if (joystickPos.current.x !== 0 || joystickPos.current.y !== 0 || isZooming.current) {
        const { x, y, zoom } = getViewport();
        
        let newX = x;
        let newY = y;
        let newZoom = zoom;

        // 1. Handle Panning
        if (joystickPos.current.x !== 0 || joystickPos.current.y !== 0) {
          let distanceDecay = 1;
          const nodes = getNodes();
          if (nodes.length > 0) {
             let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
             for (const n of nodes) {
                if (n.position.x < minX) minX = n.position.x;
                if (n.position.y < minY) minY = n.position.y;
                if (n.position.x > maxX) maxX = n.position.x;
                if (n.position.y > maxY) maxY = n.position.y;
             }
             const centerX = (minX + maxX) / 2;
             const centerY = (minY + maxY) / 2;
             
             const screenW = window.innerWidth;
             const screenH = window.innerHeight;
             const projectedX = (screenW / 2 - x) / zoom;
             const projectedY = (screenH / 2 - y) / zoom;
             
             const dist = Math.sqrt(Math.pow(projectedX - centerX, 2) + Math.pow(projectedY - centerY, 2));
             if (dist > 2500) {
                distanceDecay = Math.max(0.05, 1 - (dist - 2500) / 4000);
             }
          }

          const speed = useSagaStore.getState().joystickSpeed * (1 / zoom) * distanceDecay; 
          const maxDist = 30;
          const dx = (joystickPos.current.x / maxDist) * speed;
          const dy = (joystickPos.current.y / maxDist) * speed;
          newX -= dx;
          newY -= dy;
        }

        // 2. Handle Zooming (Center-based)
        if (isZooming.current) {
           const zoomFactor = isCtrlHeld.current ? 0.985 : 1.015;
           newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 2);
           
           const cx = window.innerWidth / 2;
           const cy = window.innerHeight / 2;
           newX = cx - (cx - newX) * (newZoom / zoom);
           newY = cy - (cy - newY) * (newZoom / zoom);
        }

        setViewport({ x: newX, y: newY, zoom: newZoom });
        rAF.current = requestAnimationFrame(loop);
      } else {
        rAF.current = null;
      }
    };
    loop();
  };

  const stopPanning = () => {
    if (rAF.current) {
      cancelAnimationFrame(rAF.current);
      rAF.current = null;
    }
    joystickPos.current = { x: 0, y: 0 };
    isZooming.current = false;
    if (pressTimeout.current) clearTimeout(pressTimeout.current);
  };

  return (
    <motion.div 
      drag 
      dragMomentum={false}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="absolute z-50 bottom-8 left-8 rounded-full bg-background border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff] flex items-center justify-center transition-all duration-300 group cursor-move"
      style={{ width: isHovered ? 150 : 64, height: isHovered ? 150 : 64 }}
    >
      <AnimatePresence>
        {showSettings && isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-background border-[3px] border-border rounded-lg p-3 shadow-md flex flex-col gap-2 w-32 cursor-default pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <label className="text-[10px] font-bold font-mono tracking-wider text-muted text-center">VELOCITY</label>
            <input 
              type="range" 
              min="1" 
              max="30" 
              value={joystickSpeed}
              onChange={(e) => setJoystickSpeed(Number(e.target.value))}
              className="accent-accent"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Indicator */}
      <div className={`absolute top-2 text-muted pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
         <Move size={14} />
      </div>

      {/* Settings Control */}
      <div className={`absolute top-2 right-2 pointer-events-none transition-opacity duration-300 z-50 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
         <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} className="pointer-events-auto p-1.5 bg-background border-[3px] border-border rounded-full hover:bg-muted/30 hover:scale-110 transition-all cursor-pointer text-muted"> <Settings size={14}/> </button>
      </div>

      {/* Zoom Controls */}
      <div className={`absolute inset-0 rounded-full flex justify-between items-center px-4 pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
         <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); zoomOut(); }} className="pointer-events-auto p-2 bg-background border-[3px] border-border rounded-full hover:bg-muted/30 hover:scale-110 transition-all cursor-pointer"> <ZoomOut size={16} className="text-foreground" /> </button>
         <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); zoomIn(); }} className="pointer-events-auto p-2 bg-background border-[3px] border-border rounded-full hover:bg-muted/30 hover:scale-110 transition-all cursor-pointer"> <ZoomIn size={16} className="text-foreground" /> </button>
      </div>
      
      {/* Fit View Control */}
      <div className={`absolute bottom-3 pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
         <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); fitView({ duration: 800, padding: 0.2 }); }} className="pointer-events-auto px-2 py-0.5 bg-background border-[3px] border-border rounded-full hover:bg-muted/30 hover:scale-110 transition-all cursor-pointer text-[10px] font-bold font-mono tracking-wider text-foreground"> FIT </button>
      </div>

      {/* The Joystick / Steering Ball */}
      <motion.div 
        drag
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        dragElastic={0.25}
        onDrag={(e, info) => {
           const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
           joystickPos.current = { x: clamp(info.offset.x, -30, 30), y: clamp(info.offset.y, -30, 30) };
           startPanning();
        }}
        onDragEnd={() => {
           stopPanning();
        }}
        onPointerDown={(e) => {
           e.stopPropagation();
           isCtrlHeld.current = e.ctrlKey;
           pressTimeout.current = setTimeout(() => {
              isZooming.current = true;
              startPanning();
           }, 300);
        }} 
        onPointerUp={stopPanning}
        onPointerCancel={stopPanning}
        onPointerLeave={stopPanning}
        className="w-10 h-10 bg-accent rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing border-[3px] border-border z-10 flex items-center justify-center relative overflow-hidden"
      >
        <div className="w-4 h-4 bg-white/40 rounded-full absolute top-2 left-2 blur-[1px]" />
      </motion.div>
    </motion.div>
  );
}
