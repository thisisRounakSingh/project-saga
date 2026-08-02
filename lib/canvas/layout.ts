import dagre from '@dagrejs/dagre';
import { ModuleNodeData, Connection } from '../saga/schema';

export function getLayoutedElements(
  modules: ModuleNodeData[],
  connections: Connection[],
  direction = 'TB'
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 280;
  const nodeHeight = 120;

  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 200, 
    ranksep: 350,
    edgesep: 100,
    ranker: 'network-simplex' // Puts heavily relied-upon nodes at the top
  });

  const nodes = modules.map((module) => ({
    id: module.name,
    type: 'moduleNode',
    data: module,
    position: { x: 0, y: 0 },
  }));

  const edges = connections.map((conn) => ({
    id: `e-${conn.from}-${conn.to}`,
    source: conn.from,
    target: conn.to,
    label: conn.kind,
    markerEnd: {
      type: 'arrowclosed',
      color: 'var(--foreground)'
    },
    style: { strokeWidth: 2, stroke: 'var(--foreground)' },
  }));

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
}
