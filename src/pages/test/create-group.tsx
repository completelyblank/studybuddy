import { useState } from "react";

export default function CreateGroupTest() {
  const [result, setResult] = useState("");

  const handleCreate = async () => {
    const res = await fetch("/api/groups/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "ML Learners",
        subject: "Machine Learning",
        description: "Team up to study ML models",
        academicLevel: "Graduate",
        meetingTime: "Weekends",
        groupType: "Virtual",
        creatorId: "60f2cfc92f2e4b3f889b4567", // Replace with a real user ID
      }),
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div className="p-8 text-white bg-gray-900 min-h-screen">
      <h1 className="text-xl mb-4">Create Group Test</h1>
      <button
        onClick={handleCreate}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Group
      </button>

      {result && (
        <pre className="mt-4 bg-gray-800 p-4 rounded text-green-400">
          {result}
        </pre>
      )}
    </div>
  );
}
