"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import axios from "axios";
import { Types } from "mongoose";

import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  id: string;
  name: string;
}

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

export default function CreateGroup() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [groupType, setGroupType] = useState<"Virtual" | "In-Person">("Virtual");
  const [groupId, setGroupId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Initialize Socket.IO and fetch session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        console.log("Session fetched:", session);
        if (session?.user) {
          setUser({ id: session.user.id, name: session.user.name || "Anonymous" });

          socket = io("http://localhost:3000", {
            path: "/api/socket",
            addTrailingSlash: false,
          });

          socket.on("connect", () => {
            console.log("Connected to Socket.IO for create group");
            socket.emit("joinUserRoom", session.user.id);
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
        } else {
          setError("Please log in to create a group");
          toast.error("Please log in to create a group", {
            position: "top-right",
            autoClose: 5000,
          });
          router.push("/auth/signin");
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Failed to load user session");
        toast.error("Failed to load user session", {
          position: "top-right",
          autoClose: 5000,
        });
        router.push("/auth/signin");
      } finally {
        setIsSessionLoading(false);
      }
    };
    fetchSession();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [router]);

  // Handle group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError("Group name is required");
      toast.error("Group name is required", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required");
      toast.error("Subject is required", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    if (!user) {
      setError("You must be logged in to create a group");
      toast.error("You must be logged in to create a group", {
        position: "top-right",
        autoClose: 5000,
      });
      router.push("/auth/signin");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      console.log("Sending create group request with user:", user);
      const response = await axios.post(
        "/api/groups/create",
        {
          name: groupName,
          description,
          subject,
          academicLevel,
          meetingTime,
          groupType,
          creatorId: user.id,
        },
        { withCredentials: true }
      );
      const groupId = response.data.groupId;
      toast.success(`Group "${groupName}" created successfully!`, {
        position: "top-right",
        autoClose: 3000,
        onClick: () => router.push(`/chat/group/${groupId}`),
      });
      router.push(`/chat/group/${groupId}`);
    } catch (err: any) {
      console.error("Error creating group:", err);
      const errorMessage = err.response?.data?.error || "Failed to create group";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
      if (err.response?.status === 401) {
        router.push("/auth/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle group search
  const handleSearchGroup = async () => {
    if (!groupId.trim()) {
      setError("Group ID is required to search");
      toast.error("Group ID is required to search", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    if (!Types.ObjectId.isValid(groupId)) {
      setError("Invalid Group ID format");
      toast.error("Invalid Group ID format", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    setError(null);
    try {
      const response = await axios.post(
        "/api/groups/join",
        {
          groupId,
          userId: user?.id,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success(`Joined group ${groupId}`, {
          position: "top-right",
          autoClose: 3000,
          onClick: () => router.push(`/chat/group/${groupId}`),
        });
        router.push(`/chat/group/${groupId}`);
      }
    } catch (err: any) {
      console.error("Error joining group:", err);
      const errorMessage = err.response?.data?.error || "Failed to join group";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white p-8 font-sans">
        <p className="text-lg text-center">Loading...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white p-8 font-sans">
        <p className="text-red-400 text-lg text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white p-8 font-sans">
      <div className="max-w-md mx-auto mt-4">
        <h1 className="text-3xl font-bold text-teal-300 drop-shadow-lg mb-6 flex-col justify-center">Create a Study Group</h1>

        {/* Group Creation Section */}
        <div className="mb-8 bg-white/10 backdrop-blur-md border border-teal-400/40 p-6 rounded-xl shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full p-3 bg-white/5 border border-teal-400/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject (e.g., Math)"
              className="w-full p-3 bg-white/5 border border-teal-400/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              className="w-full p-3 bg-white/5 border border-teal-400/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Academic Level (Optional)</label>
            <input
              type="text"
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              placeholder="Enter academic level (e.g., Undergraduate)"
              className="w-full p-3 bg-white/5 border border-teal-400/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Meeting Time (Optional)</label>
            <input
              type="text"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              placeholder="Enter meeting time (e.g., Mon 9-11 AM)"
              className="w-full p-3 bg-white/5 border border-teal-400/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Group Type</label>
            <select
              value={groupType}
              onChange={(e) => setGroupType(e.target.value as "Virtual" | "In-Person")}
              className="w-full p-3 bg-white/5 border border-teal-400/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              <option value="Virtual">Virtual</option>
              <option value="In-Person">In-Person</option>
            </select>
          </div>
          <button
            onClick={handleCreateGroup}
            disabled={loading}
            className={`w-full p-3 rounded-lg shadow-md transition ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600"
            } text-white`}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>

        {error && <p className="text-red-400 text-lg text-center">{error}</p>}
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