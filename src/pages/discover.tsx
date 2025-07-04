import { useEffect, useState } from "react";
import axios from "axios";
import ResourceCard from "../components/ResourceCard";
import type { Resource } from "../types/resource_type";
import { useSession } from "next-auth/react";
import Navbar from "../components/Navbar";

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
  const { data: session } = useSession();
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
        const res = await fetch("/api/groups/list");
        const data = await res.json();
        setGroups(data);
        setJoinedGroupIds(data.joinedGroups || []);
      } catch (err) {
        console.error("Error fetching joined groups", err);
      }
    };
    fetchJoinedGroups();
  }, []);

  const fetchData = async () => {
    try {
      const [groupRes, resourceRes] = await Promise.all([
        axios.get<Group[]>("/api/groups/list"),
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
      await axios.post("/api/groups/join", {
  groupId,
  userId: session?.user?.id, 
});

      setJoinedGroupIds((prev) => [...prev, groupId]);
    } catch (err) {
      console.error("Join group error:", err);
    }
  };

  const handleLeave = async (groupId: string) => {
    try {
      await axios.post("/api/groups/leave", {
  groupId,
  userId: session?.user?.id, 
});


      setJoinedGroupIds((prev) => prev.filter((id) => id !== groupId));
    } catch (err) {
      console.error("Leave group error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white p-6 space-y-6">
      <Navbar />
      <h1 className="text-3xl font-bold">Discover Study Resources & Groups</h1>

      {/* 🔍 Filters */}
      <section className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Subject", key: "subject" },
          { label: "Academic Level", key: "academicLevel" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-sm mb-1">{label}</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
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
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          >
            <option value={0}>All Ratings</option>
            <option value={3}>3+ stars</option>
            <option value={4}>4+ stars</option>
          </select>
        </div>
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
