import dagre from "@dagrejs/dagre";
import { ModuleNodeData, Connection } from "../saga/schema";
import { Node } from "@xyflow/react";

export function getLayoutedElements(
  modules: ModuleNodeData[],
  connections: Connection[],
  previousNodes: Node[] = [],
  direction = "TB",
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
    ranker: "network-simplex", // Puts heavily relied-upon nodes at the top
  });

  const nodes = modules.map((module) => ({
    id: module.name,
    type: "moduleNode",
    data: module,
    position: { x: 0, y: 0 },
  }));

  const edges = connections.map((conn) => ({
    id: `e-${conn.from}-${conn.to}`,
    source: conn.from,
    target: conn.to,
    label: conn.kind,
    markerEnd: {
      type: "arrowclosed",
      color: "var(--foreground)",
    },
    style: { strokeWidth: 2, stroke: "var(--foreground)" },
    animated: true,
  }));

  // Fallback for disconnected graphs: Phyllotaxis (sunflower) spiral layout
  // This arranges any number of nodes uniformly around a center of mass
  if (connections.length === 0) {
    const c = 220; // spacing factor
    nodes.forEach((node, i) => {
      const n = i + 1;
      const r = c * Math.sqrt(n);
      const theta = n * 137.5 * (Math.PI / 180); // golden angle
      node.position = {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
      };
    });
    return { nodes, edges };
  }

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const prevNodeMap = new Map(previousNodes.map((n) => [n.id, n]));
  const unassignedDeletedNodes = previousNodes.filter(
    (n) => !nodes.find((newN) => newN.id === n.id),
  );

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const dagrePos = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    if (prevNodeMap.has(node.id)) {
      node.position = prevNodeMap.get(node.id)!.position;
    } else {
      if (unassignedDeletedNodes.length > 0) {
        const deleted = unassignedDeletedNodes.shift()!;
        node.position = deleted.position;
      } else {
        node.position = dagrePos;
      }
    }
  });

  return { nodes, edges };
}
