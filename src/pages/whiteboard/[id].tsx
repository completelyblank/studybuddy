import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

export default function Whiteboard() {
  const router = useRouter();
  const { id } = router.query;
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Initialize Socket.IO
    socket = io("/api/socket", { path: "/api/socket" });
    socket.on("connect", () => {
      console.log("Connected to Socket.IO for whiteboard");
      socket.emit("joinWhiteboard", id); // Join whiteboard room
      setIsConnected(true);
    });

    socket.on("draw", (data) => {
      console.log("Received draw data:", data);
      // Update Konva canvas with data
    });

    socket.on("clear", () => {
      console.log("Canvas cleared");
      // Clear Konva canvas
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleDraw = (data: any) => {
    if (socket) {
      socket.emit("draw", { groupId: id, ...data }); // Include groupId
    }
  };

  const handleClear = () => {
    if (socket) {
      socket.emit("clear", id); // Include groupId
    }
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Whiteboard for Group {id}</h1>
      <div id="canvas-container">
        <p>{isConnected ? "Connected to whiteboard" : "Connecting..."}</p>
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