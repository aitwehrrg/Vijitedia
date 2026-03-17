"use client";

import { memo } from "react";

type Point = { x: number; y: number };
export type Connection = {
    start: Point;
    end: Point;
    type: "prereq" | "postreq";
};

export const ConnectionLines = memo(
    ({ connections }: { connections: Connection[] }) => {
        if (connections.length === 0) return null;

        return (
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-visible">
                <defs>
                    <marker
                        id="arrow-prereq"
                        viewBox="0 0 12 12"
                        refX="10"
                        refY="6"
                        markerWidth="8"
                        markerHeight="8"
                        orient="auto-start-reverse"
                        className="text-amber-500 dark:text-amber-400"
                    >
                        <path d="M0,0 L12,6 L0,12 L3,6 z" fill="currentColor" />
                    </marker>
                    <marker
                        id="arrow-postreq"
                        viewBox="0 0 12 12"
                        refX="10"
                        refY="6"
                        markerWidth="8"
                        markerHeight="8"
                        orient="auto-start-reverse"
                        className="text-blue-500 dark:text-blue-400"
                    >
                        <path d="M0,0 L12,6 L0,12 L3,6 z" fill="currentColor" />
                    </marker>
                </defs>
                {connections.map((conn, i) => {
                    const dx = conn.end.x - conn.start.x;
                    const curveIntensity = Math.min(
                        Math.max(Math.abs(dx) * 0.5, 40),
                        150
                    );
                    const pathData = `M ${conn.start.x} ${conn.start.y} C ${conn.start.x + curveIntensity} ${conn.start.y}, ${conn.end.x - curveIntensity} ${conn.end.y}, ${conn.end.x} ${conn.end.y}`;
                    const colorClass =
                        conn.type === "prereq"
                            ? "text-amber-500 dark:text-amber-400"
                            : "text-blue-500 dark:text-blue-400";

                    return (
                        <path
                            key={i}
                            d={pathData}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={
                                conn.type === "prereq" ? "5,5" : "0"
                            }
                            markerEnd={`url(#arrow-${conn.type})`}
                            className={`opacity-80 transition-all duration-300 ${colorClass}`}
                        />
                    );
                })}
            </svg>
        );
    }
);

ConnectionLines.displayName = "ConnectionLines";
