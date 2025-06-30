// components/FeedbackForm.tsx
import { useState } from "react";
import axios from "axios";

interface FeedbackFormProps {
  groupId: string;
  userId: string;
}

export function GroupFeedbackForm({ groupId, userId }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/group-feedback", {
        userId,
        groupId,
        rating,
        comments,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Feedback submission error:", error);
    }
  };

  if (submitted) {
    return <p className="text-green-400">✅ Feedback submitted!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <label className="block text-sm">
        Rating:
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="ml-2 p-1 bg-gray-700 text-white rounded"
        >
          <option value={0}>Select</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <textarea
        className="w-full p-2 bg-gray-700 rounded text-sm"
        rows={3}
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Optional comments..."
      />
      <button
        type="submit"
        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded text-sm"
      >
        Submit Feedback
      </button>
    </form>
  );
}
