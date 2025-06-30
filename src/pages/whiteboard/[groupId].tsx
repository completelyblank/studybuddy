// pages/whiteboard/[groupId].tsx
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const Whiteboard = dynamic(() => import("../../components/WhiteBoard"), {
  ssr: false,
});

export default function GroupWhiteboardPage() {
  const router = useRouter();
  const { groupId } = router.query;

  if (!groupId || typeof groupId !== "string") return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🖍️ Group Whiteboard</h1>
      <Whiteboard groupId={groupId} />
    </div>
  );
}
