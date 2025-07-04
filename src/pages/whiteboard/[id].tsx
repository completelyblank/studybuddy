// components/Whiteboard.tsx
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Stage, Layer, Line } from "react-konva";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import Navbar from "@/src/components/Navbar";

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

export default function Whiteboard() {
  const router = useRouter();
  const { id } = router.query; // groupId from URL
  const [isConnected, setIsConnected] = useState(false);
  const [lines, setLines] = useState<any[]>([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (!id) return;

    // Initialize Socket.IO
    socket = io("http://localhost:3000", {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO for whiteboard");
      setIsConnected(true);
      socket.emit("joinWhiteboard", id); // Join whiteboard room
    });

    socket.on("joinedWhiteboard", ({ groupId }) => {
      console.log(`Joined whiteboard room: ${groupId}`);
    });

    socket.on("draw", (line) => {
      console.log("Received draw data:", line);
      setLines((prev) => [...prev, line]);
    });

    socket.on("clear", () => {
      console.log("Canvas cleared");
      setLines([]);
    });

    socket.on("error", ({ message }) => {
      console.error("Socket.IO error:", message);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

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
    socket.emit("draw", { groupId: id, ...updatedLine });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleClear = () => {
    socket.emit("clear", id);
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Whiteboard for Group {id}</h1>
      <div id="canvas-container">
        <p>{isConnected ? "Connected to whiteboard" : "Connecting..."}</p>
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
      <button
        onClick={handleClear}
        className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        Clear Canvas
      </button>
    </div>
  );
}