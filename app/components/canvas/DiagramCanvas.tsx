"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSagaStore } from "@/store/sagaStore";
import { getLayoutedElements } from "@/lib/canvas/layout";
import { ModuleNode } from "./nodeTypes/ModuleNode";
import { SteeringWheel } from "./SteeringWheel";
import { Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrashCan } from "./TrashCan";
import { Legend } from "./Legend";
import { WhiteboardOverlay, WhiteboardPath } from "./WhiteboardOverlay";

const nodeTypes = {
  moduleNode: ModuleNode,
};

function DiagramCanvasInner() {
  const sessionData = useSagaStore((state) => state.sessionData);
  const activeActId = useSagaStore((state) => state.activeActId);
  const activeNarrationIndex = useSagaStore(
    (state) => state.activeNarrationIndex,
  );
  const isPlaying = useSagaStore((state) => state.isPlaying);
  const isCinematicMode = useSagaStore((state) => state.isCinematicMode);

  const isWhiteboardMode = useSagaStore((state) => state.isWhiteboardMode);
  const whiteboardColor = useSagaStore((state) => state.whiteboardColor);
  const setIsWhiteboardMode = useSagaStore(
    (state) => state.setIsWhiteboardMode,
  );

  const searchResults = useSagaStore((state) => state.searchResults);
  const activeSearchIndex = useSagaStore((state) => state.activeSearchIndex);
  const clearSearch = useSagaStore((state) => state.clearSearch);
  const setActivePanelTab = useSagaStore((state) => state.setActivePanelTab);
  const setPanelState = useSagaStore((state) => state.setPanelState);
  const setSelectedNodeIds = useSagaStore((state) => state.setSelectedNodeIds);
  const setContextMenuNodeId = useSagaStore(
    (state) => state.setContextMenuNodeId,
  );

  const { fitView, screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [ghostNodes, setGhostNodes] = useState<
    {
      id: string;
      name: string;
      summary: string;
      actId: string;
      x: number;
      y: number;
    }[]
  >([]);

  // Whiteboard state
  const [wbPaths, setWbPaths] = useState<WhiteboardPath[]>([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (!isWhiteboardMode && wbPaths.length > 0) {
      const t = setTimeout(() => setWbPaths([]), 0);
      return () => clearTimeout(t);
    }
  }, [isWhiteboardMode, wbPaths.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isWhiteboardMode) {
        setIsWhiteboardMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWhiteboardMode, setIsWhiteboardMode]);

  const nodesRef = useRef<Node[]>([]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    if (!sessionData || !activeActId) return;

    const activeAct = sessionData.acts.find((a) => a.id === activeActId);
    if (!activeAct) return;

    let filteredModules = activeAct.modules;

    if (isCinematicMode) {
      filteredModules = activeAct.modules.filter((mod) => {
        const lowerPath = mod.path.toLowerCase();
        const lowerName = mod.name.toLowerCase();
        return (
          lowerPath.includes("service") ||
          lowerPath.includes("core") ||
          lowerPath.includes("util") ||
          lowerName.includes("service")
        );
      });
    }

    const layout = getLayoutedElements(
      filteredModules,
      activeAct.connections,
      nodesRef.current,
    );

    setNodes(layout.nodes as Node[]);
    setEdges(layout.edges as Edge[]);

    const timeout = setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 50);
    return () => clearTimeout(timeout);
  }, [
    sessionData,
    activeActId,
    setNodes,
    setEdges,
    fitView,
    isPlaying,
    activeNarrationIndex,
    isCinematicMode,
  ]);

  const prevActIdRef = useRef<string | null>(null);

  // Handle Ghost Nodes for Trash Animation on Transition
  useEffect(() => {
    if (!sessionData || !activeActId || !isCinematicMode || !isPlaying) {
      if (activeActId) prevActIdRef.current = activeActId;
      return;
    }

    if (prevActIdRef.current && prevActIdRef.current !== activeActId) {
      const prevAct = sessionData.acts.find(
        (a) => a.id === prevActIdRef.current,
      );
      if (prevAct) {
        prevAct.modules.forEach((m) => {
          if (m.status === "deleted") {
            const nodeEl = document.querySelector(
              `[data-id="${m.name}"]`,
            ) as HTMLElement;
            if (nodeEl) {
              const rect = nodeEl.getBoundingClientRect();
              setGhostNodes((prev) => [
                ...prev,
                {
                  id: m.name,
                  name: m.name,
                  summary: m.summary,
                  actId: prevActIdRef.current!,
                  x: rect.left,
                  y: rect.top,
                },
              ]);
            }
          }
        });
      }
    }
    prevActIdRef.current = activeActId;
  }, [activeActId, sessionData, isCinematicMode, isPlaying]);

  // Pan to search result
  useEffect(() => {
    if (searchResults.length > 0 && searchResults[activeSearchIndex]) {
      fitView({
        nodes: [{ id: searchResults[activeSearchIndex] }],
        duration: 800,
        maxZoom: 1.2,
      });
    }
  }, [searchResults, activeSearchIndex, fitView]);

  // Panning based on narration playback — tighter zoom for cinematic
  useEffect(() => {
    if (!isPlaying || !sessionData || !activeActId || !isCinematicMode) return;
    const activeAct = sessionData.acts.find((a) => a.id === activeActId);
    if (!activeAct) return;

    const narrationText =
      activeAct.narration[activeNarrationIndex]?.text.toLowerCase() || "";

    const mentionedModules = activeAct.modules.filter((m) =>
      narrationText.includes(m.name.toLowerCase()),
    );

    let targetNodeIds: string[] = [];
    if (mentionedModules.length > 0) {
      targetNodeIds = mentionedModules.map((m) => m.name);
    } else {
      const interestingModules = activeAct.modules.filter(
        (m) => m.status === "new" || m.status === "modified",
      );
      if (interestingModules.length > 0) {
        targetNodeIds = interestingModules.map((m) => m.name);
      }
    }

    if (targetNodeIds.length > 0) {
      const existingNodes = nodes.filter((n) => targetNodeIds.includes(n.id));
      if (existingNodes.length > 0) {
        fitView({
          nodes: existingNodes,
          duration: 1500,
          maxZoom: 1.8,
          padding: 0.15,
        });
      }
    }
  }, [
    activeNarrationIndex,
    isPlaying,
    sessionData,
    activeActId,
    fitView,
    nodes,
    isCinematicMode,
  ]);

  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges((eds) =>
        addEdge(
          { ...params, markerEnd: { type: MarkerType.ArrowClosed } },
          eds,
        ),
      ),
    [setEdges],
  );

  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      setSelectedNodeIds(params.nodes.map((n) => n.id));
    },
    [setSelectedNodeIds],
  );

  if (!sessionData || !activeActId) return null;

  return (
    <div
      className="absolute inset-0 w-full h-full"
      onPointerDown={(e) => {
        if (!isWhiteboardMode) return;
        isDrawing.current = true;
        const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        setWbPaths((prev) => [
          ...prev,
          { color: whiteboardColor, points: [pos] },
        ]);
      }}
      onPointerMove={(e) => {
        if (!isWhiteboardMode || !isDrawing.current) return;
        const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        setWbPaths((prev) => {
          const newPaths = [...prev];
          const currentPath = newPaths[newPaths.length - 1];
          currentPath.points.push(pos);
          return newPaths;
        });
      }}
      onPointerUp={() => {
        isDrawing.current = false;
      }}
      onPointerLeave={() => {
        isDrawing.current = false;
      }}
      onPointerCancel={() => {
        isDrawing.current = false;
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        panOnDrag={!isWhiteboardMode}
        selectionOnDrag={!isWhiteboardMode}
        panOnScroll={true}
        onMoveStart={(e) => {
          if (e && searchResults.length > 0) {
            clearSearch();
          }
        }}
        onSelectionChange={handleSelectionChange}
        onNodeContextMenu={(e, node) => {
          e.preventDefault();
          setContextMenuNodeId(node.id);
          if (window.innerWidth < 1024) {
            setActivePanelTab("file");
            setPanelState("expanded");
          }
        }}
        onPaneClick={() => setContextMenuNodeId(null)}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        className={`bg-background ${isCinematicMode ? "cinematic-mode" : ""} ${isWhiteboardMode ? "cursor-crosshair" : ""}`}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--foreground)"
          className="opacity-[0.15] dark:opacity-30"
        />
        <SteeringWheel />
        {isWhiteboardMode && <WhiteboardOverlay paths={wbPaths} />}
      </ReactFlow>
      <AnimatePresence>
        {ghostNodes.map((ghost) => (
          <motion.div
            key={ghost.id}
            initial={{ x: ghost.x, y: ghost.y, scale: 1, opacity: 1 }}
            animate={{
              x: 60,
              y: 60,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onAnimationComplete={() => {
              setGhostNodes((prev) => prev.filter((g) => g.id !== ghost.id));
            }}
            className="fixed z-100 p-4 bg-background border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] min-w-37.5"
          >
            <span className="block text-sm font-bold truncate">
              {ghost.name}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function DiagramCanvas() {
  const isCinematicMode = useSagaStore((state) => state.isCinematicMode);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full">
      <ReactFlowProvider>
        <DiagramCanvasInner />
      </ReactFlowProvider>
      <div className="absolute top-6 left-6 z-50 flex flex-col gap-4 pointer-events-auto items-start">
        <div className="flex items-center gap-4">
          <TrashCan />
          {/* Eye icon: compact icon next to trash, expands on hover */}
          <AnimatePresence>
            {isCinematicMode && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex items-center gap-2 bg-accent text-white p-2.5 rounded-full shadow-[2px_2px_0_var(--color-border)] dark:shadow-[2px_2px_0_#fff] border-2 border-border overflow-hidden transition-all duration-300 ease-out"
                style={{ maxWidth: isHovered ? "250px" : "36px" }}
              >
                <Eye size={16} className="shrink-0" />
                <span
                  className="text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-opacity duration-200"
                  style={{ opacity: isHovered ? 1 : 0 }}
                >
                  Showing Core Logic
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Legend />
      </div>
    </div>
  );
}
