import { useSession } from "next-auth/react";
import { Resource } from "../types/resource_type";
import FeedbackForm from "./FeedbackForm";

interface Props {
  resource: Resource;
}

export default function ResourceCard({ resource }: Props) {
  const { data: session } = useSession();

  return (
    <div className="bg-white/10 backdrop-blur-md border border-teal-500/40 p-4 rounded-lg text-white space-y-2 shadow-md hover:shadow-lg transition">
      <h3 className="text-lg font-bold">{resource.title}</h3>
      <p className="text-sm text-gray-300">{resource.description}</p>

      {/* ⭐ Average Rating */}
      <p className="text-sm">
        ⭐ {resource.averageRating ? `${resource.averageRating}/5` : "No ratings yet"}
      </p>

      {/* ℹ️ Resource Info */}
      <p className="text-xs text-gray-400">
        {resource.type} • {resource.difficultyLevel || "N/A"} • {resource.subjectTags.join(", ")}
      </p>

      {/* 🔗 Link */}
      <a
        href={resource.contentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-400 underline hover:text-teal-300 transition"
      >
        Open Resource
      </a>


      {/* 📝 Feedback Form */}
      {session?.user?.id && (
        <FeedbackForm resourceId={resource._id} userId={session.user.id} />
      )}
    </div>
  );
}
