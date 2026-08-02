'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { ReactFlow, Background, BackgroundVariant, useReactFlow, ReactFlowProvider, Node, Edge, useNodesState, useEdgesState, addEdge, Connection, MarkerType, OnSelectionChangeParams } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSagaStore } from '@/store/sagaStore';
import { getLayoutedElements } from '@/lib/canvas/layout';
import { ModuleNode } from './nodeTypes/ModuleNode';
import { SteeringWheel } from './SteeringWheel';
import { Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashCan } from './TrashCan';

const nodeTypes = {
  moduleNode: ModuleNode,
};

function DiagramCanvasInner() {
  const sessionData = useSagaStore(state => state.sessionData);
  const activeActId = useSagaStore(state => state.activeActId);
  const activeNarrationIndex = useSagaStore(state => state.activeNarrationIndex);
  const isPlaying = useSagaStore(state => state.isPlaying);
  const isCinematicMode = useSagaStore(state => state.isCinematicMode);
  
  const searchResults = useSagaStore(state => state.searchResults);
  const activeSearchIndex = useSagaStore(state => state.activeSearchIndex);
  const clearSearch = useSagaStore(state => state.clearSearch);
  const setActivePanelTab = useSagaStore(state => state.setActivePanelTab);
  const setPanelState = useSagaStore(state => state.setPanelState);
  const setSelectedNodeIds = useSagaStore(state => state.setSelectedNodeIds);
  const setContextMenuNodeId = useSagaStore(state => state.setContextMenuNodeId);

  const { fitView } = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [ghostNodes, setGhostNodes] = useState<{ id: string, name: string, summary: string, actId: string, x: number, y: number }[]>([]);

  useEffect(() => {
    if (!sessionData || !activeActId) return;
    
    const activeAct = sessionData.acts.find(a => a.id === activeActId);
    if (!activeAct) return;

    let filteredModules = activeAct.modules;

    if (isCinematicMode) {
      const maxNarration = Math.max(1, activeAct.narration.length - 1);
      const progress = activeNarrationIndex / maxNarration;
      
      filteredModules = activeAct.modules.map(mod => {
        const m = { ...mod };
        if (progress < 0.33) {
          if (m.status === 'new') return null;
          if (m.status === 'modified' || m.status === 'deleted') m.status = 'unchanged';
        } else if (progress < 0.66) {
          if (m.status === 'new' || m.status === 'deleted') return null;
          if (m.status === 'modified') m.status = 'unchanged';
        } else {
          if (m.status === 'deleted') return null;
        }
        return m;
      }).filter(Boolean) as typeof activeAct.modules;
    }

    const layout = getLayoutedElements(
      filteredModules,
      activeAct.connections
    );
    
    setNodes(layout.nodes as Node[]);
    setEdges(layout.edges as Edge[]);
    
    const timeout = setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 50);
    return () => clearTimeout(timeout);
  }, [sessionData, activeActId, setNodes, setEdges, fitView, isPlaying, activeNarrationIndex, isCinematicMode]);

  const isTransitioningAct = useSagaStore(state => state.isTransitioningAct);
  const pendingTransitions = useRef(false);

  // Handle Ghost Nodes for Trash Animation on Transition
  useEffect(() => {
    if (!sessionData || !activeActId || !isCinematicMode || !isPlaying) return;
    const activeAct = sessionData.acts.find(a => a.id === activeActId);
    if (!activeAct) return;

    if (isTransitioningAct && !pendingTransitions.current) {
      const state = useSagaStore.getState();
      let createdGhosts = 0;
      
      activeAct.modules.forEach(m => {
        if (m.status === 'deleted') {
          const inTrash = state.trashCanFiles.find(f => f.id === m.name && f.actId === activeActId);
          const isGhost = ghostNodes.find(g => g.id === m.name);
          if (!inTrash && !isGhost) {
             const nodeEl = document.querySelector(`[data-id="${m.name}"]`) as HTMLElement;
             if (nodeEl) {
               const rect = nodeEl.getBoundingClientRect();
               setGhostNodes(prev => [...prev, { id: m.name, name: m.name, summary: m.summary, actId: activeActId, x: rect.left, y: rect.top }]);
               createdGhosts++;
             } else {
               state.addTrashCanFile({ id: m.name, name: m.name, summary: m.summary, actId: activeActId });
             }
          }
        }
      });
      
      pendingTransitions.current = true;
      
      // If nothing to animate, transition immediately
      if (createdGhosts === 0) {
        const acts = sessionData.acts;
        const currentActIndex = acts.findIndex(a => a.id === activeActId);
        if (currentActIndex < acts.length - 1) {
          state.setActiveActId(acts[currentActIndex + 1].id);
        } else {
          state.setIsPlaying(false);
        }
        state.setIsTransitioningAct(false);
        pendingTransitions.current = false;
      }
    }
  }, [isTransitioningAct, isPlaying, sessionData, activeActId, isCinematicMode, ghostNodes]);

  // Transition to next act when ghosts finish
  useEffect(() => {
    if (isTransitioningAct && pendingTransitions.current && ghostNodes.length === 0) {
      const state = useSagaStore.getState();
      const acts = sessionData?.acts || [];
      const currentActIndex = acts.findIndex(a => a.id === activeActId);
      
      if (currentActIndex < acts.length - 1) {
        state.setActiveActId(acts[currentActIndex + 1].id);
      } else {
        state.setIsPlaying(false);
      }
      state.setIsTransitioningAct(false);
      pendingTransitions.current = false;
    }
  }, [ghostNodes, isTransitioningAct, sessionData, activeActId]);

  // Pan to search result
  useEffect(() => {
    if (searchResults.length > 0 && searchResults[activeSearchIndex]) {
       fitView({ nodes: [{ id: searchResults[activeSearchIndex] }], duration: 800, maxZoom: 1.2 });
    }
  }, [searchResults, activeSearchIndex, fitView]);

  // Panning based on narration playback — tighter zoom for cinematic
  useEffect(() => {
    if (!isPlaying || !sessionData || !activeActId || !isCinematicMode) return;
    const activeAct = sessionData.acts.find(a => a.id === activeActId);
    if (!activeAct) return;

    const narrationText = activeAct.narration[activeNarrationIndex]?.text.toLowerCase() || '';
    
    const mentionedModules = activeAct.modules.filter(m => narrationText.includes(m.name.toLowerCase()));
    
    let targetNodeIds: string[] = [];
    if (mentionedModules.length > 0) {
      targetNodeIds = mentionedModules.map(m => m.name);
    } else {
      const interestingModules = activeAct.modules.filter(m => m.status === 'new' || m.status === 'modified');
      if (interestingModules.length > 0) {
        targetNodeIds = interestingModules.map(m => m.name);
      }
    }

    if (targetNodeIds.length > 0) {
      const existingNodes = nodes.filter(n => targetNodeIds.includes(n.id));
      if (existingNodes.length > 0) {
         fitView({ nodes: existingNodes, duration: 1500, maxZoom: 1.8, padding: 0.15 });
      }
    }
  }, [activeNarrationIndex, isPlaying, sessionData, activeActId, fitView, nodes, isCinematicMode]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges],
  );

  const handleSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedNodeIds(params.nodes.map(n => n.id));
  }, [setSelectedNodeIds]);

  if (!sessionData || !activeActId) return null;

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
            setActivePanelTab('file');
            setPanelState('expanded');
          }
        }}
        onPaneClick={() => setContextMenuNodeId(null)}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        className={`bg-background ${isCinematicMode ? 'cinematic-mode' : ''}`}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--foreground)" className="opacity-[0.15] dark:opacity-30" />
        <SteeringWheel />
      </ReactFlow>
      <AnimatePresence>
        {ghostNodes.map(ghost => (
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
              useSagaStore.getState().addTrashCanFile({ id: ghost.id, name: ghost.name, summary: ghost.summary, actId: ghost.actId });
              setGhostNodes(prev => prev.filter(g => g.id !== ghost.id));
            }}
            className="fixed z-100 p-4 bg-background border-[3px] border-border shadow-[4px_4px_0_var(--color-border)] min-w-37.5"
          >
            <span className="block text-sm font-bold truncate">{ghost.name}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}

export function DiagramCanvas() {
  const isCinematicMode = useSagaStore(state => state.isCinematicMode);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full">
      <ReactFlowProvider>
        <DiagramCanvasInner />
      </ReactFlowProvider>
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4 pointer-events-auto">
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
              style={{ maxWidth: isHovered ? '250px' : '36px' }}
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
    </div>
  );
}
