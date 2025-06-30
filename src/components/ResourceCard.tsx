import { useSession } from "next-auth/react";
import { Resource } from "../types/resource_type";
import FeedbackForm from "./FeedbackForm";
import axios from "axios";

interface Props {
  resource: Resource;
}

export default function ResourceCard({ resource }: Props) {
  const { data: session } = useSession();

  return (
    <div className="bg-gray-800 p-4 rounded text-white space-y-2">
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
        className="text-blue-400 underline"
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
