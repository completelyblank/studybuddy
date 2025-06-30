import { useEffect, useState } from "react";
import axios from "axios";
import ResourceCard from "../components/ResourceCard";
import GroupCard from "../components/GroupCard";
import type { Resource } from "../types/resource_type";

type GroupFeedback = {
  user: string;
  rating: number;
  comments?: string;
  ratedAt: string;
};

type Group = {
  _id: string;
  title: string;
  description: string;
  subject: string;
  academicLevel: string;
  averageRating?: number;
  feedbackComments?: GroupFeedback[];
};

type Filters = {
  subject: string;
  academicLevel: string;
  time: string;
};

export default function DiscoverPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filters, setFilters] = useState<Filters>({
    subject: "",
    academicLevel: "",
    time: "",
  });
  const [minRating, setMinRating] = useState<number>(0);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    const fetchJoinedGroups = async () => {
      try {
       const res = await axios.get("/api/users/me", {
  withCredentials: true, // 🔑 CRUCIAL for NextAuth JWT or session
});
        setJoinedGroupIds(res.data.joinedGroups || []);
      } catch (err) {
        console.error("Error fetching joined groups", err);
      }
    };
    fetchJoinedGroups();
  }, []);

  const fetchData = async () => {
    try {
      const [groupRes, resourceRes] = await Promise.all([
        axios.get<Group[]>("/api/discover/groups", { params: filters }),
        axios.get<Resource[]>("/api/discover/resources", { params: filters }),
      ]);
      setGroups(groupRes.data || []);
      setResources(resourceRes.data || []);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      await axios.post("/api/groups/join", { groupId });
      setJoinedGroupIds((prev) => [...prev, groupId]);
    } catch (err) {
      console.error("Join group error:", err);
    }
  };

  const handleLeave = async (groupId: string) => {
    try {
      await axios.post("/api/groups/leave", { groupId });
      setJoinedGroupIds((prev) => prev.filter((id) => id !== groupId));
    } catch (err) {
      console.error("Leave group error:", err);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Discover Study Resources & Groups</h1>

      {/* 🔍 Filters */}
      <section className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Subject", key: "subject" },
          { label: "Academic Level", key: "academicLevel" },
          { label: "Preferred Study Time", key: "time" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-sm mb-1">{label}</label>
            <input
              className="w-full bg-gray-900 p-2 rounded"
              value={filters[key as keyof Filters]}
              onChange={(e) =>
                setFilters({ ...filters, [key]: e.target.value })
              }
              placeholder={`Filter by ${label.toLowerCase()}`}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm mb-1">Minimum Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full bg-gray-800 text-white p-2 rounded"
          >
            <option value={0}>All Ratings</option>
            <option value={3}>3+ stars</option>
            <option value={4}>4+ stars</option>
          </select>
        </div>
      </section>

      {/* 🧠 Groups */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Study Groups</h2>
        {groups.length === 0 ? (
          <p>No matching groups found.</p>
        ) : (
          <ul className="space-y-3">
            {groups.map((g) => (
              <GroupCard
                key={g._id}
                group={g}
                isJoined={joinedGroupIds.includes(g._id)}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            ))}
          </ul>
        )}
      </section>

      {/* 📚 Resources */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Resources</h2>
        {resources
          .filter(
            (r) => !minRating || (r.averageRating && r.averageRating >= minRating)
          )
          .map((r) => (
            <ResourceCard key={r._id} resource={r} />
          ))}
      </section>
    </div>
  );
}
