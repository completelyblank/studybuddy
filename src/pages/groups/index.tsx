// src/pages/groups/index.tsx
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Navbar from "@/src/components/Navbar";

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

export default function GroupSelectionPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetchGroups();
    fetchMatches();
  }, [session]);

  const fetchGroups = async () => {
    const res = await fetch("/api/groups/list");
    const data = await res.json();
    setGroups(data);
  };

 const fetchMatches = async () => {
  const res = await fetch(`/api/resources/matchmaking?userId=${session?.user?.id}`);
  const data = await res.json();
  setMatches(data);
  setLoading(false);
};


  const joinGroup = async (groupId: string) => {
    await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, userId: session?.user?.id })
      
    });
   

    fetchGroups();
  };

  if (!session) return <p className="text-white p-8">Please log in to view groups.</p>;
  if (loading) return <p className="text-white p-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Navbar />
      <h1 className="text-3xl font-bold mb-4">Join a Study Group</h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">Recommended Study Groups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div key={group._id} className="bg-gray-800 p-4 rounded shadow-md">
            <h3 className="text-lg font-bold">{group.title}</h3>
            <p>{group.description}</p>
            <p className="text-sm text-gray-400">Subject: {group.subject}</p>
            <button
              className="mt-2 px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded"
              onClick={() => joinGroup(group._id)}
            >
              Join Group
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-2">Matchmaking: Suggested Study Partners</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <div key={match.userId} className="bg-gray-700 p-4 rounded shadow-md">
            <h3 className="font-bold">{match.name}</h3>
            <p className="text-sm">{match.email}</p>
            <p className="text-sm text-teal-400">Compatibility Score: {(match.score * 100).toFixed(0)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
