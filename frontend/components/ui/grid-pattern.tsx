"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface GridPatternProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: number[][];
  patternColor?: string;
}

export function GridPattern({
  width = 100,
  height = 100,
  x = 0,
  y = 0,
  squares = [
    [0, 1],
    [1, 0],
  ],
  className,
  patternColor = "rgba(77, 124, 255, 0.08)",
  ...props
}: GridPatternProps) {
  const patternId = React.useId();
  
  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
        className
      )}
      {...props}
    >
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern
            id={patternId}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
            x={x}
            y={y}
          >
            <path
              d={`M${height/2} 0 L${height*2} 0 L${height*2} ${height/2} L${height/2} ${height/2} Z`}
              fill={patternColor}
              fillOpacity="0.4"
            />
            {squares.map(([x, y], index) => (
              <rect
                key={index}
                width={width / 4}
                height={height / 4}
                x={(width / 4) * x}
                y={(height / 4) * y}
                fill={patternColor}
                fillOpacity="0.4"
              />
            ))}
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
} 