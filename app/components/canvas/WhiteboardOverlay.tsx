"use client";

import { useStore } from "@xyflow/react";

export interface WhiteboardPath {
  color: string;
  points: { x: number; y: number }[];
}

export function WhiteboardOverlay({ paths }: { paths: WhiteboardPath[] }) {
  const transform = useStore((s) => s.transform); // [x, y, zoom]

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      <g
        transform={`translate(${transform[0]}, ${transform[1]}) scale(${transform[2]})`}
      >
        {paths.map((p, i) => {
          if (p.points.length === 0) return null;
          // Simple polyline path
          const d = p.points
            .map((pt, j) => `${j === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
            .join(" ");

          return (
            <path
              key={i}
              d={d}
              stroke={p.color}
              strokeWidth={4 / transform[2]} // Maintain 4px thickness regardless of zoom, or just use 4 for scaling. Let's maintain visual thickness.
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </g>
    </svg>
  );
}
