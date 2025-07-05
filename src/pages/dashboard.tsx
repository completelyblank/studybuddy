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
import { Section, Card, Button, Badge, Grid, Input, LoadingSpinner, EmptyState } from "../components/ui";

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
          axios.get("/api/resources/matchmaking"),
          axios.get("/api/groups/user"),
          axios.get("/api/users/me"),
          axios.get("/api/requests/pending"),
          axios.get("/api/chats/user"),
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

        // Emit match finding for each match
        if (matchRes.data && matchRes.data.length > 0) {
          newSocket.emit("findMatch", userId);
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        const errorMessage = err.response?.data?.message || "Failed to load dashboard data";
        toast.error(errorMessage, {
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
          const [startTime, endTime] = timeRange.split("-");
          return { day, startTime, endTime };
        });

      await axios.put(
        "/api/users/update",
        {
          userId,
          academicLevel: editProfile.academicLevel,
          subjects: editProfile.subjects.split(",").map((s) => s.trim()),
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
      await axios.post("/api/groups/leave", { userId, groupId }, { withCredentials: true });
      setJoinedGroups((prev) => prev.filter((g) => g._id !== groupId));
      toast.success("Left group successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Leave group error:", err);
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
    } catch (err) {
      console.error("Send request error:", err);
      toast.error("Failed to send request", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }

  async function respondToRequest(requestId: string, status: "approved" | "rejected") {
    try {
      await axios.post("/api/requests/respond", { requestId, status }, { withCredentials: true });
      setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast.success(`Request ${status} successfully`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Respond to request error:", err);
      toast.error("Failed to respond to request", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }

  async function initiateChat(userId2: string) {
    try {
      const response = await axios.post("/api/chats/initiate", { userId1: userId, userId2 }, { withCredentials: true });
      router.push(`/chat/${response.data.chatId}`);
    } catch (err) {
      console.error("Initiate chat error:", err);
      toast.error("Failed to start chat", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      <Section title={`Welcome back, ${session.user.name}!`} subtitle="Your personalized study dashboard">
        <div className="space-y-8">
          {/* Profile Section */}
          <Grid cols={2} gap="lg">
            {/* Avatar Card */}
            <Card>
              <h3 className="text-xl font-semibold text-white mb-4">Profile Avatar</h3>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={avatarUrl || "/default.jpeg"}
                  className="w-20 h-20 rounded-full object-cover border-2 border-teal-400"
                  alt="avatar"
                />
                <div className="flex-1">
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Enter Avatar URL"
                  />
                </div>
              </div>
              <Button onClick={updateAvatar} className="w-full">
                Update Avatar
              </Button>
            </Card>

            {/* Profile Preferences */}
            <Card>
              <h3 className="text-xl font-semibold text-white mb-4">Profile Preferences</h3>
              <div className="space-y-4">
                <Input
                  label="Academic Level"
                  value={editProfile.academicLevel}
                  onChange={(e) => setEditProfile({ ...editProfile, academicLevel: e.target.value })}
                  placeholder="e.g., Undergraduate, Graduate"
                />
                <Input
                  label="Subjects (comma separated)"
                  value={editProfile.subjects}
                  onChange={(e) => setEditProfile({ ...editProfile, subjects: e.target.value })}
                  placeholder="e.g., Math, Physics, Computer Science"
                />
                <Input
                  label="Learning Style"
                  value={editProfile.learningStyle}
                  onChange={(e) => setEditProfile({ ...editProfile, learningStyle: e.target.value })}
                  placeholder="e.g., Visual, Auditory, Kinesthetic"
                />
                <Input
                  label="Study Goals"
                  value={editProfile.studyGoals}
                  onChange={(e) => setEditProfile({ ...editProfile, studyGoals: e.target.value })}
                  placeholder="e.g., Improve problem-solving skills"
                />
                <Button onClick={updateProfile} className="w-full">
                  Save Profile
                </Button>
              </div>
            </Card>
          </Grid>

          {/* Study Groups */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-6">Your Study Groups</h3>
            {joinedGroups.length > 0 ? (
              <Grid cols={2} gap="md">
                {joinedGroups.map((group) => (
                  <Card key={group._id} variant="outlined">
                    <h4 className="text-lg font-semibold text-white mb-2">{group.title}</h4>
                    <p className="text-gray-300 mb-4">{group.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/chat/group/${group._id}`)}
                      >
                        💬 Group Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/whiteboard/${group._id}`)}
                      >
                        📝 Whiteboard
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => leaveGroup(group._id)}
                      >
                        Leave Group
                      </Button>
                    </div>
                    <GroupAvailability groupId={group._id} />
                  </Card>
                ))}
              </Grid>
            ) : (
              <EmptyState
                title="No study groups yet"
                description="Join or create a study group to start collaborating"
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                action={
                  <Button onClick={() => router.push('/group/create')}>
                    Create Group
                  </Button>
                }
              />
            )}
          </Card>

          {/* Study Partner Requests */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-6">Study Partner Requests</h3>
            {pendingRequests.length > 0 ? (
              <Grid cols={2} gap="md">
                {pendingRequests.map((request) => (
                  <Card key={request._id} variant="outlined">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={request.senderId.avatar || "/default.jpeg"}
                        className="w-12 h-12 rounded-full object-cover"
                        alt="avatar"
                      />
                      <div>
                        <h4 className="font-semibold text-white">
                          {request.senderId._id === userId
                            ? `Sent to ${request.receiverId.name}`
                            : `Received from ${request.senderId.name}`}
                        </h4>
                        <Badge variant={request.status === "pending" ? "warning" : "success"}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {request.status === "pending" && request.receiverId._id === userId && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => respondToRequest(request._id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => respondToRequest(request._id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {request.status === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => initiateChat(request.senderId._id === userId ? request.receiverId._id : request.senderId._id)}
                      >
                        Start Chat
                      </Button>
                    )}
                  </Card>
                ))}
              </Grid>
            ) : (
              <EmptyState
                title="No pending requests"
                description="You have no study partner requests at the moment"
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
              />
            )}
          </Card>

          {/* Active Chats */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-6">Your Private Chats</h3>
            {chats.length > 0 ? (
              <Grid cols={2} gap="md">
                {chats.map((chat) => {
                  const otherParticipant = chat.participants.find((p) => p._id !== userId);
                  return (
                    <Card key={chat._id} variant="outlined">
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={otherParticipant?.avatar || "/default.jpeg"}
                          className="w-12 h-12 rounded-full object-cover"
                          alt="avatar"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">
                            Chat with {otherParticipant?.name || "Unknown"}
                          </h4>
                          <p className="text-sm text-gray-300">
                            {chat.messages.length > 0 
                              ? chat.messages[chat.messages.length - 1].content 
                              : "No messages yet"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/chat/${chat._id}`)}
                        className="w-full"
                      >
                        Open Chat
                      </Button>
                    </Card>
                  );
                })}
              </Grid>
            ) : (
              <EmptyState
                title="No active chats"
                description="Start a conversation with your study partners"
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
              />
            )}
          </Card>

          {/* Suggested Study Partners */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-6">Suggested Study Partners</h3>
            {matches.length > 0 ? (
              <Grid cols={2} gap="md">
                {matches.map((match) => (
                  <Card key={match.userId} variant="outlined">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">{match.name}</h4>
                      <Badge variant="success">
                        {(match.score * 100).toFixed(0)}% Match
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendStudyPartnerRequest(match.userId)}
                      className="w-full"
                    >
                      Request Study Partner
                    </Button>
                  </Card>
                ))}
              </Grid>
            ) : (
              <EmptyState
                title="No matches yet"
                description="Complete your profile to find compatible study partners"
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
            )}
          </Card>
        </div>
      </Section>

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