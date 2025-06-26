import { useState } from "react";

export default function LeaveGroupTest() {
  const [response, setResponse] = useState("");

  const handleLeaveGroup = async () => {
    const res = await fetch("/api/groups/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId: "685d1f7504c4a7a488a40f4e", // Replace with real group ID
        userId: "662a10ff7cbe52d48e123456",  // Replace with real user ID
      }),
    });

    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl mb-4">Leave Study Group (Test)</h1>
      <button
        onClick={handleLeaveGroup}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
      >
        Leave Group
      </button>

      {response && (
        <pre className="mt-4 bg-gray-800 p-4 rounded text-green-400">
          {response}
        </pre>
      )}
    </div>
  );
}
