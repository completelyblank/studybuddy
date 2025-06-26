import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [recommendedGroups, setRecommendedGroups] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchData = async () => {
        try {
          const [groupsRes, matchRes, joinedRes] = await Promise.all([
            axios.post("/api/resources/recommendation", { userId: session.user.id }),
            axios.post("/api/resources/matchmaking", { userId: session.user.id }),
            axios.get("/api/groups/user", { params: { userId: session.user.id } }),
          ]);

          setRecommendedGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
          setMatches(Array.isArray(matchRes.data) ? matchRes.data : []);
          setJoinedGroups(Array.isArray(joinedRes.data) ? joinedRes.data : []);
        } catch (err) {
          console.error("Dashboard data fetch failed:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [session?.user?.id]);

  if (status === "loading" || loading) return <p className="text-white p-6">Loading dashboard...</p>;
  if (!session) return <p>Please login to view dashboard.</p>;

  return (
    <div className="p-6 text-white bg-black min-h-screen space-y-6">
      <h1 className="text-3xl font-bold mb-2">Welcome, {session.user?.name}</h1>

      {/* 👤 Joined Groups */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Study Groups</h2>
        {joinedGroups.length === 0 ? (
          <p>You haven't joined any groups yet.</p>
        ) : (
          <ul className="space-y-2">
            {joinedGroups.map((group) => (
              <li key={group._id} className="bg-gray-800 p-4 rounded">
                <p className="font-bold">{group.title}</p>
                <p className="text-sm text-gray-300">{group.description}</p>
                <button
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                  onClick={() => leaveGroup(group._id)}
                >
                  Leave Group
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 🧠 Recommended Groups */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Recommended Groups</h2>
        {recommendedGroups.length === 0 ? (
          <p>No recommendations yet.</p>
        ) : (
          <ul className="space-y-2">
            {recommendedGroups.map((group) => (
              <li key={group._id} className="bg-gray-800 p-4 rounded">
                <p className="font-bold">{group.title}</p>
                <p className="text-sm text-gray-300">{group.subject} • {group.academicLevel}</p>
                <button
                  className="mt-2 px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded"
                  onClick={() => joinGroup(group._id)}
                >
                  Join Group
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 🤝 Match Suggestions */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Suggested Study Partners</h2>
        {matches.length === 0 ? (
          <p>No compatible partners found.</p>
        ) : (
          <ul className="space-y-2">
            {matches.map((match) => (
              <li key={match.userId} className="bg-gray-800 p-4 rounded">
                <p className="font-bold">{match.name}</p>
                <p className="text-sm text-gray-300">Match score: {(match.score * 100).toFixed(0)}%</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 💬 Coming Soon */}
      <section className="pt-4 border-t border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
        <p>Real-time group chat and collaborative whiteboard will be available in your study groups!</p>
      </section>
    </div>
  );

  // Join group handler
  async function joinGroup(groupId: string) {
    try {
      await axios.post("/api/groups/join", {
        groupId,
        userId: session.user?.id,
      });
      alert("Joined group!");
      setRecommendedGroups((prev) => prev.filter((g) => g._id !== groupId));
      fetchJoinedGroups();
    } catch (err) {
      alert("Failed to join group");
      console.error(err);
    }
  }

  // Leave group handler
  async function leaveGroup(groupId: string) {
    try {
      await axios.post("/api/groups/leave", {
        groupId,
        userId: session.user?.id,
      });
      alert("Left group!");
      setJoinedGroups((prev) => prev.filter((g) => g._id !== groupId));
    } catch (err) {
      alert("Failed to leave group");
      console.error(err);
    }
  }

  async function fetchJoinedGroups() {
    try {
      const res = await axios.get("/api/groups/user", {
        params: { userId: session.user?.id },
      });
      setJoinedGroups(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch joined groups:", err);
    }
  }
}
