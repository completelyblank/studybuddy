import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import axios from "axios";
import { Types } from "mongoose";
import Navbar from "@/src/components/Navbar";

interface User {
  id: string;
  name: string;
}

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

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        console.log("Session fetched:", session);
        if (session?.user) {
          setUser({ id: session.user.id, name: session.user.name || "Anonymous" });
        } else {
          setError("Please log in to create a group");
          router.push("/auth/signin");
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Failed to load user session");
        router.push("/auth/signin");
      } finally {
        setIsSessionLoading(false);
      }
    };
    fetchSession();
  }, [router]);

  // Handle group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!user) {
      setError("You must be logged in to create a group");
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
      router.push(`/chat/group/${groupId}`);
    } catch (err: any) {
      console.error("Error creating group:", err);
      const errorMessage = err.response?.data?.error || "Failed to create group";
      if (err.response?.status === 401) {
        setError("Unauthorized: Please log in again");
        router.push("/auth/signin");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle group search
  const handleSearchGroup = () => {
    if (!groupId.trim()) {
      setError("Group ID is required to search");
      return;
    }
    if (!Types.ObjectId.isValid(groupId)) {
      setError("Invalid Group ID format");
      return;
    }
    setError(null);
    router.push(`/chat/group/${groupId}`);
  };

  if (isSessionLoading) return <p className="p-6 text-white">Loading...</p>;
  if (error && !user) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Create or Join a Study Group</h1>
      <div className="max-w-md mx-auto">
        {/* Group Creation Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Create a Study Group</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full p-2 bg-gray-800 text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject (e.g., Math)"
              className="w-full p-2 bg-gray-800 text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              className="w-full p-2 bg-gray-800 text-white rounded"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Academic Level (Optional)</label>
            <input
              type="text"
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              placeholder="Enter academic level (e.g., Undergraduate)"
              className="w-full p-2 bg-gray-800 text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Meeting Time (Optional)</label>
            <input
              type="text"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              placeholder="Enter meeting time (e.g., Mon 9-11 AM)"
              className="w-full p-2 bg-gray-800 text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Group Type</label>
            <select
              value={groupType}
              onChange={(e) => setGroupType(e.target.value as "Virtual" | "In-Person")}
              className="w-full p-2 bg-gray-800 text-white rounded"
            >
              <option value="Virtual">Virtual</option>
              <option value="In-Person">In-Person</option>
            </select>
          </div>
          <button
            onClick={handleCreateGroup}
            disabled={loading}
            className={`w-full p-2 rounded ${loading ? "bg-gray-600" : "bg-teal-600"} text-white`}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>

        {/* Group Search Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Join a Study Group</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Group ID</label>
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="Enter group ID (e.g., 68666afb5d071cc177867831)"
              className="w-full p-2 bg-gray-800 text-white rounded"
            />
          </div>
          <button
            onClick={handleSearchGroup}
            className="w-full p-2 rounded bg-blue-600 text-white"
          >
            Join Group
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
      </div>
    </div>
  );
}
