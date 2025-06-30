import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  console.log("UserID: ", session?.user.id);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [joinedGroups, setJoinedGroups] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
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
        const [matchRes, joinedRes, userRes] = await Promise.all([
          axios.get("/api/resources/matchmaking", { params: { userId } }),
          axios.get("/api/groups/user", { params: { userId } }),
          axios.get("/api/users/me", { params: { userId } }),
        ]);

        setMatches(matchRes.data || []);
        setJoinedGroups(joinedRes.data || []);
        setAvatarUrl(userRes.data.avatar || "");

        setEditProfile({
          academicLevel: userRes.data.academicLevel || "",
          subjects: userRes.data.subjects?.join(", ") || "",
          preferredStudyTimes: userRes.data.preferredStudyTimes?.join(", ") || "",
          learningStyle: userRes.data.learningStyle || "",
          studyGoals: userRes.data.studyGoals || "",
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  async function updateAvatar() {
    if (!userId || !avatarUrl.trim()) return;

    try {
      await axios.put("/api/users/avatar", { userId, avatar: avatarUrl });
      alert("Avatar updated");
    } catch {
      alert("Failed to update avatar");
    }
  }

  async function updateProfile() {
    try {
      await axios.put("/api/users/update", {
        userId,
        ...editProfile,
        subjects: editProfile.subjects.split(",").map((s) => s.trim()),
        preferredStudyTimes: editProfile.preferredStudyTimes.split(",").map((t) => t.trim()),
      });
      alert("Profile updated");
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Update failed");
    }
  }

  async function leaveGroup(groupId: string) {
    await axios.post("/api/groups/leave", { groupId, userId });
    setJoinedGroups((prev) => prev.filter((g) => g._id !== groupId));
  }

  if (status === "loading" || loading) return <p className="text-white p-6">Loading...</p>;
  if (!session || !userId) return <p>Please login to view dashboard.</p>;

  return (
    <div className="p-6 text-white bg-black min-h-screen space-y-8">
      <h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1>

      {/* 👤 Avatar */}
      <section className="bg-gray-800 p-4 rounded space-y-3">
        <h2 className="text-xl font-semibold">Profile Avatar</h2>
        <img src={avatarUrl || "/default.jpeg"} className="w-24 h-24 rounded-full object-cover" alt="avatar" />
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="Enter Avatar URL"
          className="w-full bg-gray-900 p-2 rounded text-white"
        />
        <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded" onClick={updateAvatar}>
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
              value={(editProfile as any)[name]}
              onChange={(e) => setEditProfile({ ...editProfile, [name]: e.target.value })}
            />
          </div>
        ))}
        <button className="bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded mt-2" onClick={updateProfile}>
          Save Profile
        </button>
      </section>

      {/* 🧠 Joined Study Groups */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Study Groups</h2>
        {joinedGroups.length ? (
          <ul className="space-y-2">
            {joinedGroups.map((group) => (
              <li key={group._id} className="bg-gray-800 p-4 rounded">
                <p className="font-bold">{group.title}</p>
                <p className="text-sm">{group.description}</p>
                <button
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                  onClick={() => leaveGroup(group._id)}
                >
                  Leave Group
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven’t joined any groups yet.</p>
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
