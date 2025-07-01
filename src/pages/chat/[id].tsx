import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { getSession } from "next-auth/react";
import axios from "axios";

interface ChatMessage {
  senderId: { _id: string; name: string };
  content: string;
  timestamp: string;
}

export default function ChatRoom() {
  const router = useRouter();
  const { id } = router.query; // Chat ID
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          setCurrentUser({ id: session.user.id, name: session.user.name || "Anonymous" });
        } else {
          setError("Please log in to chat");
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Failed to load user session");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  // Fetch existing messages
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/chats/${id}`, { withCredentials: true });
        console.log("Fetched messages:", res.data.messages);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load chat messages");
      }
    };
    fetchMessages();
  }, [id]);

  // Socket.IO connection
  useEffect(() => {
    if (!id || typeof id !== "string" || !currentUser) return;

    const socket = io("http://localhost:3000", {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);
      socket.emit("joinChat", id);
    });

    socket.on("message", (msg: ChatMessage) => {
      console.log("Received real-time message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err);
      setError("Failed to connect to chat server");
    });

    return () => {
      socket.disconnect();
      console.log("Socket.IO disconnected");
    };
  }, [id, currentUser]);

  const sendMessage = () => {
    if (input.trim() && socketRef.current && currentUser && id) {
      const message = {
        chatId: id,
        userId: currentUser.id,
        content: input,
      };
      console.log("Sending message:", message);
      socketRef.current.emit("sendMessage", message);
      setInput("");
    }
  };

  if (loading) return <p className="p-6 text-white">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.senderId._id === currentUser?.id ? "bg-blue-600 ml-auto" : "bg-gray-700"
            } max-w-[70%]`}
          >
            <strong>{msg.senderId.name || "Unknown"}:</strong> {msg.content}
            <span className="text-xs text-gray-400 ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="bg-gray-800 p-2 rounded text-white flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="bg-teal-600 px-4 py-2 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}