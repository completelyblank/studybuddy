// components/Whiteboard.tsx
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import socket from "../lib/socket";

interface Props {
  groupId: string;
}

export default function Whiteboard({ groupId }: Props) {
  const [lines, setLines] = useState<any[]>([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (!groupId) return;

    socket.emit("join-room", groupId);

    socket.on("draw", (line) => {
      setLines((prev) => [...prev, line]);
    });

    socket.on("clear", () => setLines([]));

    return () => {
      socket.off("draw");
      socket.off("clear");
    };
  }, [groupId]);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const newLine = { points: [pos.x, pos.y], stroke: "black", strokeWidth: 2 };
    setLines((prev) => [...prev, newLine]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const lastLine = lines[lines.length - 1];
    const updatedLine = {
      ...lastLine,
      points: [...lastLine.points, point.x, point.y],
    };

    const updatedLines = [...lines.slice(0, -1), updatedLine];
    setLines(updatedLines);
    socket.emit("draw", updatedLine);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearBoard = () => {
    setLines([]);
    socket.emit("clear");
  };

  return (
    <div>
      <button
        onClick={clearBoard}
        className="mb-3 bg-red-600 px-4 py-1 rounded hover:bg-red-700"
      >
        Clear
      </button>

      <Stage
        width={900}
        height={500}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        className="bg-white rounded shadow-lg"
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
