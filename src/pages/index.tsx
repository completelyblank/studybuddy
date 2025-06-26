import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/resources/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: (session.user as any).id }),
      })
        .then((res) => res.json())
        .then(setMatches)
        .catch(console.error);
    }
  }, [session]);

  return (
    <div className="p-8 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold">StudyBudy</h1>
      {!session ? (
        <button onClick={() => signIn()} className="mt-4">Sign In</button>
      ) : (
        <>
          <p className="mt-4">Welcome, {session.user?.name}</p>
          <button onClick={() => signOut()} className="mt-2">Sign Out</button>

          <h2 className="text-2xl mt-6">Top Matches</h2>
          <ul className="mt-2 space-y-2">
            {matches.map((m: any) => (
              <li key={m.userId} className="border p-2 rounded">
                <strong>{m.name}</strong> ({m.email}) - Score: {m.score.toFixed(2)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
