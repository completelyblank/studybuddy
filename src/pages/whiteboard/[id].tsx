// components/Whiteboard.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { ToastContainer, toast } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import styles

// Dynamically import react-konva components with SSR disabled
const Stage = dynamic(() => import("react-konva").then((mod) => mod.Stage), { ssr: false });
const Layer = dynamic(() => import("react-konva").then((mod) => mod.Layer), { ssr: false });
const Line = dynamic(() => import("react-konva").then((mod) => mod.Line), { ssr: false });

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
      toast.success(`Joined whiteboard for group ${groupId}`, {
        position: "top-right",
        autoClose: 3000,
      });
    });

    socket.on("draw", (line) => {
      console.log("Received draw data:", line);
      setLines((prev) => [...prev, line]);
    });

    socket.on("clear", () => {
      console.log("Canvas cleared");
      setLines([]);
      toast.info("Whiteboard cleared", {
        position: "top-right",
        autoClose: 2000,
      });
    });

    socket.on("error", ({ message }) => {
      console.error("Socket.IO error:", message);
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      setIsConnected(false);
      toast.error("Failed to connect to whiteboard server", {
        position: "top-right",
        autoClose: 5000,
      });
    });

    // New Socket.IO events for notifications
    socket.on("matchFound", ({ matchId }) => {
      toast.success(`Match found! ID: ${matchId}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    socket.on("newMessage", ({ chatId, content, sender }) => {
      toast.info(`New message in chat ${chatId} from ${sender}: ${content}`, {
        position: "top-right",
        autoClose: 5000,
        onClick: () => router.push(`/chat/${chatId}`), // Navigate to chat
      });
    });

    socket.on("sessionReminder", ({ sessionId, time }) => {
      toast.warning(`Session ${sessionId} starts at ${time}`, {
        position: "top-right",
        autoClose: 10000,
        onClick: () => router.push(`/session/${sessionId}`), // Navigate to session
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [id, router]);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    const newLine = { points: [pos.x, pos.y], stroke: "black", strokeWidth: 2 };
    setLines((prev) => [...prev, newLine]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // Matches your app's dark theme
      />
    </div>
  );
}