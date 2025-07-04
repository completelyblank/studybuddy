"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GroupAvailability from "../components/GroupAvailability";
import Navbar from "../components/Navbar";

interface Chat {
  _id: string;
  participants: { _id: string; name: string; email?: string; avatar?: string }[];
  messages: { senderId: { _id: string; name: string }; content: string; timestamp: string }[];
}

interface Group {
  _id: string;
  title: string;
  description: string;
  members?: string[];
}

interface Match {
  userId: string;
  name: string;
  score: number;
}

interface PendingRequest {
  _id: string;
  senderId: { _id: string; name: string; email?: string; avatar?: string };
  receiverId: { _id: string; name: string; email?: string; avatar?: string };
  status: string;
}

interface EditProfileState {
  academicLevel: string;
  subjects: string;
  preferredStudyTimes: string;
  learningStyle: string;
  studyGoals: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [editProfile, setEditProfile] = useState<EditProfileState>({
    academicLevel: "",
    subjects: "",
    preferredStudyTimes: "",
    learningStyle: "",
    studyGoals: "",
  });
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io("http://localhost:3000", {
      path: "/api/socket",
      addTrailingSlash: false,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO for dashboard");
      newSocket.emit("joinUserRoom", userId);
    });

    newSocket.on("matchFound", ({ matchId }) => {
      toast.success(`Match found! ID: ${matchId}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    newSocket.on("newMessage", ({ chatId, content, sender }) => {
      toast.info(`New message in chat ${chatId} from ${sender}: ${content}`, {
        position: "top-right",
        autoClose: 5000,
        onClick: () => router.push(`/chat/${chatId}`),
      });
    });

    newSocket.on("sessionReminder", ({ sessionId, time }) => {
      toast.warning(`Session ${sessionId} starts at ${time}`, {
        position: "top-right",
        autoClose: 10000,
        onClick: () => router.push(`/session/${sessionId}`),
      });
    });

    newSocket.on("error", ({ message }) => {
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      toast.error("Failed to connect to notification server", {
        position: "top-right",
        autoClose: 5000,
      });
    });

    const fetchData = async () => {
      try {
        const [matchRes, joinedRes, userRes, requestsRes, chatsRes] = await Promise.all([
          axios.get("/api/resources/matchmaking", { params: { userId }, withCredentials: true }),
          axios.get("/api/groups/user", { params: { userId }, withCredentials: true }),
          axios.get("/api/users/me", { params: { userId }, withCredentials: true }),
          axios.get("/api/requests/pending", { params: { userId }, withCredentials: true }),
          axios.get("/api/chats/user", { params: { userId }, withCredentials: true }),
        ]);

        // Transform preferredStudyTimes to a formatted string
        const formattedPreferredStudyTimes = userRes.data.preferredStudyTimes
          ?.map((t: { day: string; startTime: string; endTime: string }) => `${t.day}:${t.startTime}-${t.endTime}`)
          .join(", ") || "";

        setMatches(matchRes.data || []);
        setJoinedGroups(
          (joinedRes.data || []).filter((group: Group) => !group.members || group.members.length > 0)
        );
        setAvatarUrl(userRes.data.avatar || "https://www.gravatar.com/avatar/?d=mp");
        setPendingRequests(requestsRes.data || []);
        setChats(chatsRes.data || []);

        setEditProfile({
          academicLevel: userRes.data.academicLevel || "",
          subjects: userRes.data.subjects?.join(", ") || "",
          preferredStudyTimes: formattedPreferredStudyTimes,
          learningStyle: userRes.data.learningStyle || "",
          studyGoals: userRes.data.studyGoals || "",
        });

        matchRes.data.forEach((match: Match) => {
          newSocket.emit("findMatch", userId);
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        toast.error("Failed to load dashboard data", {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [userId, router]);

  async function updateAvatar() {
    if (!userId || !avatarUrl.trim()) {
      toast.error("Please provide a valid avatar URL", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    try {
      await axios.put("/api/users/avatar", { userId, avatar: avatarUrl }, { withCredentials: true });
      setEditProfile((prev) => ({ ...prev, avatar: avatarUrl }));
      toast.success("Avatar updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Avatar update error:", err);
      toast.error("Failed to update avatar", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }

  async function updateProfile() {
    try {
      const preferredStudyTimesArray = editProfile.preferredStudyTimes
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => {
          const [day, timeRange] = t.split(":");
          const [startTime, endTime] = timeRange?.split("-") || [];
          return {
            day: day || "",
            startTime: startTime || "",
            endTime: endTime || "",
          };
        })
        .filter((obj) => obj.day && obj.startTime && obj.endTime);

      await axios.put(
        "/api/users/update",
        {
          userId,
          academicLevel: editProfile.academicLevel,
          subjects: editProfile.subjects
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
          preferredStudyTimes: preferredStudyTimesArray,
          learningStyle: editProfile.learningStyle,
          studyGoals: editProfile.studyGoals,
        },
        { withCredentials: true }
      );

      toast.success("Profile updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }

  async function leaveGroup(groupId: string) {
    try {
      await axios.post("/api/groups/leave", { groupId, userId }, { withCredentials: true });
      setJoinedGroups((prev) => prev.filter((g) => g._id !== groupId));
      toast.success("Left group successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error leaving group:", err);
      toast.error("Failed to leave group", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }

  async function sendStudyPartnerRequest(receiverId: string) {
    try {
      await axios.post("/api/requests/send", { senderId: userId, receiverId }, { withCredentials: true });
      toast.success("Study partner request sent!", {
        position: "top-right",
        autoClose: 3000,
      });
      const requestsRes = await axios.get("/api/requests/pending", {
        params: { userId },
        withCredentials: true,
      });
      setPendingRequests(requestsRes.data || []);
    } catch (err) {
      console.error("Error sending request:", err);
      toast.error("Failed to send request", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }

  async function respondToRequest(requestId: string, status: "approved" | "rejected") {
    try {
      const res = await axios.post(
        "/api/requests/respond",
        { requestId, status, userId },
        { withCredentials: true }
      );
      toast.success(`Request ${status}`, {
        position: "top-right",
        autoClose: 3000,
        onClick: status === "approved" && res.data.chatId ? () => router.push(`/chat/${res.data.chatId}`) : undefined,
      });
      const [requestsRes, chatsRes] = await Promise.all([
        axios.get("/api/requests/pending", { params: { userId }, withCredentials: true }),
        axios.get("/api/chats/user", { params: { userId }, withCredentials: true }),
      ]);
      setPendingRequests(requestsRes.data || []);
      setChats(chatsRes.data || []);
      if (status === "approved" && res.data.chatId) {
        router.push(`/chat/${res.data.chatId}`);
      }
    } catch (err) {
      console.error("Error responding to request:", err);
      toast.error("Failed to respond to request", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }

  async function initiateChat(userId2: string) {
    try {
      const res = await axios.post("/api/chats/initiate", { userId1: userId, userId2 }, { withCredentials: true });
      const chatId = res.data.chatId;
      toast.success("Chat initiated successfully", {
        position: "top-right",
        autoClose: 3000,
        onClick: () => router.push(`/chat/${chatId}`),
      });
      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.error("Error initiating chat:", err);
      toast.error("Failed to initiate chat", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white p-6">
        <Navbar />
        <p>Loading...</p>
      </div>
    );
  }

  if (!session || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white p-6">
        <Navbar />
        <p>Please login to view dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white p-6 space-y-8">
      <Navbar />
      <h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1>

      {/* 👤 Avatar */}
      <section className="bg-white/10 border border-teal-400/40 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-3">
        <h2 className="text-xl font-semibold">Profile Avatar</h2>
        <img
          src={avatarUrl || "/default.jpeg"}
          className="w-24 h-24 rounded-full object-cover"
          alt="avatar"
        />
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="Enter Avatar URL"
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
        />
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          onClick={updateAvatar}
        >
          Update Avatar
        </button>
      </section>

      {/* ✏️ Profile Preferences */}
      <section className="bg-white/10 border border-teal-400/40 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-3">
        <h2 className="text-xl font-semibold">Edit Preferences</h2>
        {[
          { label: "Academic Level", name: "academicLevel" },
          { label: "Subjects (comma separated)", name: "subjects" },
          { label: "Preferred Study Times (e.g., Monday:10:00-12:00)", name: "preferredStudyTimes" },
          { label: "Learning Style", name: "learningStyle" },
          { label: "Study Goals", name: "studyGoals" },
        ].map(({ label, name }) => (
          <div key={name}>
            <label className="block text-sm mb-1">{label}</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              value={editProfile[name as keyof EditProfileState]}
              onChange={(e) => setEditProfile({ ...editProfile, [name]: e.target.value })}
            />
          </div>
        ))}
        <button
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition"
          onClick={updateProfile}
        >
          Save Profile
        </button>
      </section>

      {/* 🧠 Joined Study Groups */}
      <section className="bg-white/10 border border-teal-400/40 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-3">
        <h2 className="text-xl font-semibold mb-2">Your Study Groups</h2>
        {joinedGroups.length ? (
          <ul className="space-y-4">
            {joinedGroups.map((group) => (
              <li key={group._id} className="bg-gray-800 p-4 rounded">
                <p className="font-bold">{group.title}</p>
                <p className="text-sm">{group.description}</p>
                <div className="mt-2 space-x-2">
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                    onClick={() => router.push(`/chat/group/${group._id}`)}
                  >
                    Open Group Chat
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                    onClick={() => router.push(`/whiteboard/${group._id}`)}
                  >
                    Open Whiteboard
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                    onClick={() => leaveGroup(group._id)}
                  >
                    Leave Group
                  </button>
                </div>
                <div className="mt-4">
                  <GroupAvailability groupId={group._id} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven’t joined any groups yet.</p>
        )}
      </section>

      {/* 📬 Pending Study Partner Requests */}
      <section className="bg-white/10 border border-teal-400/40 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-3">
        <h2 className="text-xl font-semibold mb-2">Study Partner Requests</h2>
        {pendingRequests.length ? (
          <ul className="space-y-2">
            {pendingRequests.map((request) => (
              <li key={request._id} className="bg-gray-800 p-4 rounded">
                <p className="font-bold">
                  {request.senderId._id === userId
                    ? `Sent to ${request.receiverId.name} (${request.status})`
                    : `Received from ${request.senderId.name} (${request.status})`}
                </p>
                {request.status === "pending" && request.receiverId._id === userId && (
                  <div className="mt-2 space-x-2">
                    <button
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition"
                      onClick={() => respondToRequest(request._id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                      onClick={() => respondToRequest(request._id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                )}
                {request.status === "approved" && (
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                    onClick={() => initiateChat(request.senderId._id === userId ? request.receiverId._id : request.senderId._id)}
                  >
                    Start Chat
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No study partner requests.</p>
        )}
      </section>

      {/* 💬 Active Chats */}
      <section className="bg-white/10 border border-teal-400/40 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-3">
        <h2 className="text-xl font-semibold mb-2">Your Private Chats</h2>
        {chats.length ? (
          <ul className="space-y-2">
            {chats.map((chat) => {
              const otherParticipant = chat.participants.find((p) => p._id !== userId);
              return (
                <li key={chat._id} className="bg-gray-800 p-4 rounded">
                  <p className="font-bold">Chat with {otherParticipant?.name || "Unknown"}</p>
                  <p className="text-sm">
                    Last message: {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : "No messages yet"}
                  </p>
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                    onClick={() => router.push(`/chat/${chat._id}`)}
                  >
                    Open Chat
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>You have no active private chats.</p>
        )}
      </section>

      {/* 🤝 Suggested Study Partners */}
      <section className="bg-white/10 border border-teal-400/40 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-3">
        <h2 className="text-xl font-semibold mb-2">Suggested Study Partners</h2>
        {matches.length ? (
          <ul className="space-y-2">
            {matches.map((match) => (
              <li key={match.userId} className="bg-gray-800 p-4 rounded">
                <p className="font-bold">{match.name}</p>
                <p className="text-sm">Match score: {(match.score * 100).toFixed(0)}%</p>
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                  onClick={() => sendStudyPartnerRequest(match.userId)}
                >
                  Request Study Partner
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No compatible matches yet.</p>
        )}
      </section>

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