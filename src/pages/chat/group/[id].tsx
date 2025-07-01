import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { getSession } from "next-auth/react";

type ChatMessage = {
  message: string;
  sender: string;
};

export default function GroupChat() {
  const router = useRouter();
  const { id } = router.query; // Changed from groupId to id
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<string>("");

  const socketRef = useRef<Socket | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setCurrentUser(session?.user?.email || session?.user?.name || "Anonymous");
    };
    fetchSession();
  }, []);

  // Socket connection logic
  useEffect(() => {
    if (!id) return;

    const socket = io("http://localhost:3000", {
      path: "/api/socket", // Updated to match your Socket.IO path
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    socket.emit("joinRoom", id); // Use id instead of groupId

    socket.on("chatMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const sendMessage = () => {
    if (input.trim() && socketRef.current) {
      socketRef.current.emit("chatMessage", {
        roomId: id, // Use id instead of groupId
        message: input,
        sender: currentUser,
      });
      setInput("");
    }
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Group Chat: {id}</h1>
      <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="bg-gray-700 p-2 rounded">
            <strong>{msg.sender || "Unknown"}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        className="bg-gray-800 p-2 rounded text-white w-full mb-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button className="bg-teal-600 px-4 py-2 rounded" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}