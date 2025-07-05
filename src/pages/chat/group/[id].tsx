import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { getSession } from "next-auth/react";
import axios from "axios";


type ChatMessage = {
  message: string;
  sender: string;
};

type AvatarMap = {
  [sender: string]: string; // sender => avatar url
};

export default function GroupChat() {
  const router = useRouter();
  const { id } = router.query;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<string>("");

  const [avatars, setAvatars] = useState<AvatarMap>({});

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      const identifier = session?.user?.email || session?.user?.name || "Anonymous";
      setCurrentUser(identifier);
    };
    fetchSession();
  }, []);

  // Socket connection
  useEffect(() => {
    if (!id) return;

    const socket = io("http://localhost:3000", {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    socket.emit("joinRoom", id);

    socket.on("chatMessage", async (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);

      // Fetch avatar if not already fetched
      if (!avatars[msg.sender]) {
        try {
          const { data } = await axios.get(`/api/users/avatar?userId=${msg.sender}`);
          setAvatars((prev) => ({ ...prev, [msg.sender]: data.avatar || "" }));
        } catch (err) {
          console.warn("Failed to fetch avatar for", msg.sender);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, avatars]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && socketRef.current) {
      socketRef.current.emit("chatMessage", {
        roomId: id,
        message: input,
        sender: currentUser,
      });
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold mb-6 text-teal-400">
        Group Chat: <span className="text-white">{id}</span>
      </h1>

      {/* Messages */}
      <div className="max-h-[60vh] overflow-y-auto space-y-4 bg-white/5 rounded-lg p-4 mb-4 shadow-inner">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-start space-x-3">
            <img
              src={avatars[msg.sender] || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full border border-teal-500 object-cover"
            />
            <div className="bg-gray-800 px-4 py-2 rounded-xl shadow-md max-w-lg">
              <p className="font-semibold text-teal-300">{msg.sender}</p>
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={sendMessage}
          className="bg-teal-600 hover:bg-teal-700 px-6 py-3 rounded-lg font-medium transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
