import React from "react";
import { GroupFeedbackForm } from "./GroupFeedbackForm";
import { useSession } from "next-auth/react";

interface GroupFeedback {
  user: string;
  rating: number;
  comments?: string;
  ratedAt: string;
}

interface GroupProps {
  group: {
    _id: string;
    title: string;
    description?: string;
    subject?: string;
    academicLevel?: string;
    averageRating?: number | null;
    feedbackComments?: GroupFeedback[];
  };
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
  isJoined?: boolean;
};
   

const GroupCard: React.FC<GroupProps> = ({ group, onJoin, onLeave, isJoined = false }) => {
    const { data: session } = useSession();

    return (
        <div className="bg-gray-800 p-4 rounded shadow hover:shadow-lg transition-all duration-200">
            <h3 className="text-xl font-bold">{group.title}</h3>

            <p className="text-sm text-yellow-400 mt-1">
                ⭐ {typeof group.averageRating === "number" ? group.averageRating.toFixed(1) : "No ratings yet"} / 5
            </p>



            {group.description && (
                <p className="text-sm text-gray-300 mt-1">{group.description}</p>
            )}

            <div className="mt-2 text-sm text-gray-400 space-x-2">
                {group.subject && <span>📘 {group.subject}</span>}
                {group.academicLevel && <span>🎓 {group.academicLevel}</span>}
            </div>

            {onJoin && !isJoined && (
                <button
                    onClick={() => onJoin(group._id)}
                    className="mt-3 px-4 py-1 bg-teal-600 hover:bg-teal-700 rounded text-sm"
                >
                    Join Group
                </button>
            )}

            {onLeave && isJoined && (
                <button
                    onClick={() => onLeave(group._id)}
                    className="mt-3 px-4 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                    Leave Group
                </button>
            )}

            {/* 🔽 Feedback Comments */}
            {group.feedbackComments && group.feedbackComments.length > 0 && (
                <div className="mt-4 text-sm text-gray-300 space-y-2">
                    <p className="text-white font-semibold">💬 Feedback:</p>
                    {group.feedbackComments.map((fb, i) => (
                        <div key={i} className="bg-gray-700 p-2 rounded">
                            <p>⭐ {fb.rating} — {fb.comments || "No comment"}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(fb.ratedAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* 📝 Feedback Form (only if joined and logged in) */}
            {isJoined && session?.user?.id && (
                <div className="mt-4">
                    <GroupFeedbackForm groupId={group._id} userId={session.user.id} />
                </div>
            )}
        </div>
    );
};

export default GroupCard;