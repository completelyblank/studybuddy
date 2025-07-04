"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Navbar from "@/src/components/Navbar";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Group {
  _id: string;
  title: string;
  subject: string;
  description: string;
  academicLevel: string;
  meetingTime: string;
  groupType: string;
  members: string[];
}

interface Match {
  userId: string;
  name: string;
  email: string;
  score: number;
}

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

export default function GroupSelectionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    // Initialize Socket.IO
    socket = io("http://localhost:3000", {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO for group selection");
      // Join user-specific room for notifications
      socket.emit("joinUserRoom", session.user?.id);
    });

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
        onClick: () => router.push(`/chat/${chatId}`),
      });
    });

    socket.on("sessionReminder", ({ sessionId, time }) => {
      toast.warning(`Session ${sessionId} starts at ${time}`, {
        position: "top-right",
        autoClose: 10000,
        onClick: () => router.push(`/session/${sessionId}`),
      });
    });

    socket.on("error", ({ message }) => {
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      toast.error("Failed to connect to notification server", {
        position: "top-right",
        autoClose: 5000,
      });
    });

    fetchGroups();
    fetchMatches();

    return () => {
      socket.disconnect();
    };
  }, [session, router]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups/list");
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
      toast.error("Failed to load groups", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`/api/resources/matchmaking?userId=${session?.user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch matches");
      const data = await res.json();
      setMatches(data);
      setLoading(false);
      // Trigger matchFound notification for each new match
      data.forEach((match: Match) => {
        socket.emit("findMatch", session?.user?.id); // Trigger matchFound event
      });
    } catch (err) {
      console.error("Error fetching matches:", err);
      toast.error("Failed to load matches", {
        position: "top-right",
        autoClose: 5000,
      });
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, userId: session?.user?.id }),
      });
      if (!res.ok) throw new Error("Failed to join group");
      toast.success(`Successfully joined group ${groupId}`, {
        position: "top-right",
        autoClose: 3000,
        onClick: () => router.push(`/whiteboard/${groupId}`),
      });
      await fetchGroups(); // Refresh groups
    } catch (err) {
      console.error("Error joining group:", err);
      toast.error("Failed to join group", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Navbar />
        <p>Please log in to view groups.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Navbar />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white p-6">
      <Navbar />
      <h1 className="text-3xl font-bold mb-4">Join a Study Group</h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">Recommended Study Groups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div key={group._id} className="bg-white/10 backdrop-blur-md border border-teal-400/30 p-4 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-bold">{group.title}</h3>
            <p>{group.description}</p>
            <p className="text-sm text-gray-400">Subject: {group.subject}</p>
            <button className="mt-3 px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 font-semibold transition">
              Join Group
            </button>

          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-2">Matchmaking: Suggested Study Partners</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <div key={match.userId} className="bg-white/5 backdrop-blur-md border border-teal-300/30 p-4 rounded-lg shadow">
            <h3 className="font-bold">{match.name}</h3>
            <p className="text-sm">{match.email}</p>
            <p className="text-sm text-teal-400">Compatibility Score: {(match.score * 100).toFixed(0)}%</p>
          </div>
        ))}
      </div>

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
        theme="dark"
      />
    </div>
  );
}