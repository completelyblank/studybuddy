"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Section, Card, Button, Badge, Grid, LoadingSpinner, EmptyState } from "../../components/ui";

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
  const [joiningGroup, setJoiningGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    // Initialize Socket.IO
    socket = io("http://localhost:3000", {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO for group selection");
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
      data.forEach((match: Match) => {
        socket.emit("findMatch", session?.user?.id);
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
    setJoiningGroup(groupId);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, userId: session?.user?.id }),
      });
      if (!res.ok) throw new Error("Failed to join group");
      toast.success(`Successfully joined group!`, {
        position: "top-right",
        autoClose: 3000,
        onClick: () => router.push(`/chat/group/${groupId}`),
      });
      await fetchGroups(); // Refresh groups
    } catch (err) {
      console.error("Error joining group:", err);
      toast.error("Failed to join group", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setJoiningGroup(null);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center">
        <Card variant="elevated" className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-gray-300 mb-6">Please sign in to view and join study groups</p>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      <Section title="Study Groups" subtitle="Join groups that match your interests and schedule">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recommended Study Groups */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Available Study Groups</h3>
              {groups.length > 0 ? (
                <Grid cols={2} gap="lg">
                  {groups.map((group) => (
                    <Card key={group._id} variant="elevated" className="hover:scale-105 transition-transform">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2">{group.title}</h4>
                          <Badge variant="info" className="mb-2">
                            {group.subject}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <Badge variant="success" size="sm">
                            {group.members.length} members
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4 line-clamp-2">{group.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div>
                          <span className="text-gray-400">Level:</span>
                          <span className="text-white ml-1">{group.academicLevel || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white ml-1">{group.groupType}</span>
                        </div>
                        {group.meetingTime && (
                          <div className="col-span-2">
                            <span className="text-gray-400">Meeting:</span>
                            <span className="text-white ml-1">{group.meetingTime}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => joinGroup(group._id)}
                        loading={joiningGroup === group._id}
                        className="w-full"
                      >
                        Join Group
                      </Button>
                    </Card>
                  ))}
                </Grid>
              ) : (
                <EmptyState
                  title="No study groups available"
                  description="Check back later for new groups or create your own"
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
            </div>

            {/* Study Partner Matches */}
            {matches.length > 0 && (
              <Card>
                <h3 className="text-xl font-semibold text-white mb-6">Recommended Study Partners</h3>
                <Grid cols={2} gap="md">
                  {matches.slice(0, 4).map((match) => (
                    <Card key={match.userId} variant="outlined">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{match.name}</h4>
                          <p className="text-sm text-gray-300">{match.email}</p>
                        </div>
                        <Badge variant="success">
                          {(match.score * 100).toFixed(0)}% Match
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard')}
                        className="w-full"
                      >
                        View Profile
                      </Button>
                    </Card>
                  ))}
                </Grid>
              </Card>
            )}

            {/* Call to Action */}
            <Card className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Can't find the right group?</h3>
              <p className="text-gray-300 mb-6">
                Create your own study group and invite others to join
              </p>
              <Button onClick={() => router.push('/group/create')} size="lg">
                Create New Group
              </Button>
            </Card>
          </div>
        )}
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