import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
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
  const [editProfile, setEditProfile] = useState({
    academicLevel: "",
    subjects: "",
    preferredStudyTimes: "",
    learningStyle: "",
    studyGoals: "",
  });

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const [matchRes, joinedRes, userRes, requestsRes, chatsRes] = await Promise.all([
          axios.get("/api/resources/matchmaking", { params: { userId }, withCredentials: true }),
          axios.get("/api/groups/user", { params: { userId }, withCredentials: true }),
          axios.get("/api/users/me", { params: { userId }, withCredentials: true }),
          axios.get("/api/requests/pending", { params: { userId }, withCredentials: true }),
          axios.get("/api/chats/user", { params: { userId }, withCredentials: true }),
        ]);

        setMatches(matchRes.data || []);
        setJoinedGroups(joinedRes.data || []);
        setAvatarUrl(userRes.data.avatar || "");
        setPendingRequests(requestsRes.data || []);
        setChats(chatsRes.data || []);

        setEditProfile({
          academicLevel: userRes.data.academicLevel || "",
          subjects: userRes.data.subjects?.join(", ") || "",
          preferredStudyTimes: userRes.data.preferredStudyTimes?.join(", ") || "",
          learningStyle: userRes.data.learningStyle || "",
          studyGoals: userRes.data.studyGoals || "",
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        alert("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  async function updateAvatar() {
    if (!userId || !avatarUrl.trim()) {
      alert("Please provide a valid avatar URL");
      return;
    }

    try {
      await axios.put("/api/users/avatar", { userId, avatar: avatarUrl }, { withCredentials: true });
      alert("Avatar updated successfully");
    } catch (err) {
      console.error("Avatar update error:", err);
      alert("Failed to update avatar");
    }
  }

  async function updateProfile() {
    try {
      await axios.put(
        "/api/users/update",
        {
          userId,
          ...editProfile,
          subjects: editProfile.subjects.split(",").map((s) => s.trim()).filter((s) => s),
          preferredStudyTimes: editProfile.preferredStudyTimes.split(",").map((t) => t.trim()).filter((t) => t),
        },
        { withCredentials: true }
      );
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Failed to update profile");
    }
  }

  async function leaveGroup(groupId: string) {
    try {
      await axios.post("/api/groups/leave", { groupId, userId }, { withCredentials: true });
      setJoinedGroups((prev) => prev.filter((g) => g._id !== groupId));
      alert("Left group successfully");
    } catch (err) {
      console.error("Error leaving group:", err);
      alert("Failed to leave group");
    }
  }

  async function sendStudyPartnerRequest(receiverId: string) {
    try {
      await axios.post("/api/requests/send", { senderId: userId, receiverId }, { withCredentials: true });
      alert("Study partner request sent!");
      const requestsRes = await axios.get("/api/requests/pending", {
        params: { userId },
        withCredentials: true,
      });
      setPendingRequests(requestsRes.data || []);
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Failed to send request");
    }
  }

  async function respondToRequest(requestId: string, status: "approved" | "rejected") {
    try {
      const res = await axios.post(
        "/api/requests/respond",
        { requestId, status, userId },
        { withCredentials: true }
      );
      alert(`Request ${status}`);
      // Fetch updated requests and chats
      const [requestsRes, chatsRes] = await Promise.all([
        axios.get("/api/requests/pending", { params: { userId }, withCredentials: true }),
        axios.get("/api/chats/user", { params: { userId }, withCredentials: true }),
      ]);
      console.log("Updated pendingRequests:", requestsRes.data);
      console.log("Updated chats:", chatsRes.data);
      setPendingRequests(requestsRes.data || []);
      setChats(chatsRes.data || []);
      // Navigate to chat if approved
      if (status === "approved" && res.data.chatId) {
        router.push(`/chat/${res.data.chatId}`);
      }
    } catch (err) {
      console.error("Error responding to request:", err);
      alert("Failed to respond to request");
    }
  }

  async function initiateChat(userId2: string) {
    try {
      const res = await axios.post("/api/chats/initiate", { userId1: userId, userId2 }, { withCredentials: true });
      const chatId = res.data.chatId;
      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.error("Error initiating chat:", err);
      alert("Failed to initiate chat");
    }
  }

  if (status === "loading" || loading) return <p className="text-white p-6">Loading...</p>;
  if (!session || !userId) return <p className="text-white p-6">Please login to view dashboard.</p>;

  return (
    <div className="p-6 text-white bg-black min-h-screen space-y-8">
      <Navbar />
      <h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1>

      {/* 👤 Avatar */}
      <section className="bg-gray-800 p-4 rounded space-y-3">
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
          className="w-full bg-gray-900 p-2 rounded text-white"
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
          onClick={updateAvatar}
        >
          Update Avatar
        </button>
      </section>

      {/* ✏️ Profile Preferences */}
      <section className="bg-gray-800 p-4 rounded space-y-2">
        <h2 className="text-xl font-semibold">Edit Preferences</h2>
        {[
          { label: "Academic Level", name: "academicLevel" },
          { label: "Subjects (comma separated)", name: "subjects" },
          { label: "Preferred Study Times", name: "preferredStudyTimes" },
          { label: "Learning Style", name: "learningStyle" },
          { label: "Study Goals", name: "studyGoals" },
        ].map(({ label, name }) => (
          <div key={name}>
            <label className="block text-sm mb-1">{label}</label>
            <input
              className="w-full bg-gray-900 p-2 rounded text-white"
              value={editProfile[name as keyof typeof editProfile]}
              onChange={(e) => setEditProfile({ ...editProfile, [name]: e.target.value })}
            />
          </div>
        ))}
        <button
          className="bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded mt-2"
          onClick={updateProfile}
        >
          Save Profile
        </button>
      </section>

      {/* 🧠 Joined Study Groups */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Study Groups</h2>
        {joinedGroups.length ? (
          <ul className="space-y-4">
            {joinedGroups.map((group) => (
              <li key={group._id} className="bg-gray-800 p-4 rounded">
                <p className="font-bold">{group.title}</p>
                <p className="text-sm">{group.description}</p>
                <div className="mt-2 space-x-2">
                  <button
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                    onClick={() => router.push(`/chat/group/${group._id}`)}
                  >
                    Open Group Chat
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                    onClick={() => router.push(`/whiteboard/${group._id}`)}
                  >
                    Open Whiteboard
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
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
      <section>
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
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded"
                      onClick={() => respondToRequest(request._id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                      onClick={() => respondToRequest(request._id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                )}
                {request.status === "approved" && (
                  <button
                    className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
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
      <section>
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
                    className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
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
      <section>
        <h2 className="text-xl font-semibold mb-2">Suggested Study Partners</h2>
        {matches.length ? (
          <ul className="space-y-2">
            {matches.map((match) => (
              <li key={match.userId} className="bg-gray-800 p-4 rounded">
                <p className="font-bold">{match.name}</p>
                <p className="text-sm">Match score: {(match.score * 100).toFixed(0)}%</p>
                <button
                  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
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
    </div>
  );
}