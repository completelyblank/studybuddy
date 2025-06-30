import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    fetch(`/api/resources/matchmaking?userId=${userId}`)
      .then((res) => res.json())
      .then(setMatches)
      .catch(console.error);
  }, [session]);

  return (
    <div className="p-8 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold">StudyBudy</h1>

      {!session ? (
        <button onClick={() => signIn()} className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
          Sign In
        </button>
      ) : (
        <>
          <p className="mt-4">Welcome, {session.user?.name}</p>
          <button onClick={() => signOut()} className="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
            Sign Out
          </button>

          <h2 className="text-2xl mt-6">Top Matches</h2>
          <ul className="mt-2 space-y-2">
            {matches.map((m: any) => (
              <li key={m.userId} className="border border-gray-700 p-3 rounded bg-gray-800">
                <strong>{m.name}</strong> ({m.email}) - Score: {(m.score * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
