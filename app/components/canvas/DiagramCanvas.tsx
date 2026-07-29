'use client';

import { useEffect, useCallback } from 'react';
import { ReactFlow, Background, BackgroundVariant, useReactFlow, ReactFlowProvider, Node, Edge, useNodesState, useEdgesState, addEdge, Connection, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSagaStore } from '@/store/sagaStore';
import { getLayoutedElements } from '@/lib/canvas/layout';
import { ModuleNode } from './nodeTypes/ModuleNode';
import { SteeringWheel } from './SteeringWheel';

const nodeTypes = {
  moduleNode: ModuleNode,
};

function DiagramCanvasInner() {
  const sessionData = useSagaStore(state => state.sessionData);
  const activeActId = useSagaStore(state => state.activeActId);
  
  const searchResults = useSagaStore(state => state.searchResults);
  const activeSearchIndex = useSagaStore(state => state.activeSearchIndex);
  const clearSearch = useSagaStore(state => state.clearSearch);

  const { fitView } = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (!sessionData || !activeActId) return;
    
    const activeAct = sessionData.acts.find(a => a.id === activeActId);
    if (!activeAct) return;

    const layout = getLayoutedElements(
      activeAct.modules,
      activeAct.connections
    );
    
    setNodes(layout.nodes as Node[]);
    setEdges(layout.edges as Edge[]);
    
    // Fit view after a slight delay
    const timeout = setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 50);
    return () => clearTimeout(timeout);
  }, [sessionData, activeActId, setNodes, setEdges, fitView]);

  // Pan to search result
  useEffect(() => {
    if (searchResults.length > 0 && searchResults[activeSearchIndex]) {
       fitView({ nodes: [{ id: searchResults[activeSearchIndex] }], duration: 800, maxZoom: 1.2 });
    }
  }, [searchResults, activeSearchIndex, fitView]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges],
  );

  if (!sessionData || !activeActId) return null;

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onMoveStart={(e) => {
         // Clear search if the user manually pans or zooms
         if (e && searchResults.length > 0) {
           clearSearch();
         }
      }}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.1}
      maxZoom={2}
      className="bg-background"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--foreground)" className="opacity-[0.15] dark:opacity-30" />
      <SteeringWheel />
    </ReactFlow>
  );
}

export function DiagramCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <ReactFlowProvider>
        <DiagramCanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
