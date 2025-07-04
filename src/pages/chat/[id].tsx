import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { getSession } from "next-auth/react";
import axios from "axios";

interface ChatMessage {
  senderId: {
    _id: string;
    name: string;
    avatar?: string; // this matches what backend sends (not avatarUrl)
  };
  content: string;
  timestamp: string;
}

export default function ChatRoom() {
  const router = useRouter();
  const { id } = router.query; // Chat ID

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.name || "Anonymous",
            avatar: session.user.image || "https://www.gravatar.com/avatar/?d=mp",
          });
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
        const res = await axios.get(`/api/chats/${id}`, {
          withCredentials: true,
        });
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
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err);
      setError("Failed to connect to chat server");
    });

    return () => {
      socket.disconnect();
    };
  }, [id, currentUser]);

  const sendMessage = () => {
    if (input.trim() && socketRef.current && currentUser && id) {
      const message = {
        chatId: id,
        userId: currentUser.id,
        content: input,
      };
      socketRef.current.emit("sendMessage", message);
      setInput("");
    }
  };

  if (loading) return <p className="p-6 text-white">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 text-white bg-gradient-to-br from-black via-[#0f2027] to-[#203a43] min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-teal-400">💬 Group Chat</h1>

      <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto pr-2">
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.senderId._id === currentUser?.id;

          return (
            <div
              key={idx}
              className={`flex items-start ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              {!isCurrentUser && (
                <img
                  src={msg.senderId.avatar || "https://www.gravatar.com/avatar/?d=mp"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}

              <div
                className={`rounded-lg p-3 text-sm max-w-[70%] shadow ${isCurrentUser
                    ? "bg-teal-600 text-white"
                    : "bg-white/10 backdrop-blur-md text-white"
                  }`}
              >
                <div className="font-semibold">{msg.senderId.name}</div>
                <div>{msg.content}</div>
                <div className="text-xs text-gray-300 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {isCurrentUser && (
                <img
                  src={msg.senderId.avatar || "https://www.gravatar.com/avatar/?d=mp"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full ml-2"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mt-4">
        <input
          className="bg-white/10 backdrop-blur text-white p-2 rounded flex-1 border border-teal-500 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded transition font-semibold"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
