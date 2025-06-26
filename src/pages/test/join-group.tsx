import { useState } from "react";

export default function JoinGroupTest() {
  const [response, setResponse] = useState("");

  const handleJoinGroup = async () => {
    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId: "685d20e3a5687b91045981bb", // Replace with actual group ID
        userId: "685d20bca5687b91045981b8"   // Replace with actual user ID
      }),
    });

    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">Join Study Group (Test)</h1>
      <button
        onClick={handleJoinGroup}
        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded"
      >
        Join Group
      </button>
      {response && (
        <pre className="mt-4 bg-gray-800 p-4 rounded text-green-400">
          {response}
        </pre>
      )}
    </div>
  );
}
