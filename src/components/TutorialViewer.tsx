import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

interface Tutorial {
  _id: string;
  type: "text" | "video" | "youtube";
  title: string;
  content: string;     // For text or YouTube ID
  videoUrl?: string;   // For MP4 videos
  estimatedTime?: number; // In seconds
}

export default function TutorialViewer({ tutorial }: { tutorial: Tutorial }) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(tutorial.estimatedTime || 60);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!tutorial.estimatedTime || done) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= (tutorial.estimatedTime || 60)) {
          clearInterval(interval);
          handleComplete();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tutorial, done]);

  async function handleComplete() {
    setDone(true);
    if (!session?.user?.id) return;

    try {
      await axios.post("/api/users/tutorial-progress", {
        userId: session.user.id,
        tutorialId: tutorial._id,
        completedAt: new Date(),
      });
    } catch (err) {
      console.error("Error saving tutorial progress", err);
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-teal-300/20 p-6 rounded-lg text-white shadow">
      <h2 className="text-xl font-bold mb-2">{tutorial.title}</h2>

      {/* Content Display */}
      {tutorial.type === "text" && (
        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: tutorial.content }} />
      )}

      {tutorial.type === "video" && tutorial.videoUrl && (
        <video
          controls
          onEnded={handleComplete}
          className="w-full max-h-[400px] rounded"
          src={tutorial.videoUrl}
        />
      )}

      {tutorial.type === "youtube" && (
        <div className="aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${tutorial.content}`}
            title="YouTube video player"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Progress Bar */}
      {tutorial.estimatedTime && (
        <div className="mt-4">
          <div className="text-sm mb-1">Progress: {Math.min((progress / (tutorial.estimatedTime || 60)) * 100, 100).toFixed(0)}%</div>
          <div className="w-full bg-white/10 h-2 rounded">
            <div
              className="bg-teal-400 h-2 rounded transition-all duration-300" 
              style={{ width: `${(progress / (tutorial.estimatedTime || 60)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {done && <p className="text-green-400 mt-2">✔️ Completed</p>}
    </div>
  );
}
