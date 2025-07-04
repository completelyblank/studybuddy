import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Navbar from "../components/Navbar";

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
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white p-8 font-sans">
      <Navbar />

      <div className="flex items-center gap-4 mt-6">
        <img src="./logo.png" alt="Logo" className="h-20 w-20 rounded-xl shadow-md" />
        <h1 className="text-4xl font-bold text-teal-300 drop-shadow-lg">StudyBudy</h1>
      </div>

      {!session ? (
        <button
          onClick={() => signIn()}
          className="mt-6 bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg shadow-lg transition"
        >
          Sign In
        </button>
      ) : (
        <>
          <p className="mt-4 text-lg">Welcome, <span className="font-semibold text-blue-300">{session.user?.name}</span> 👋</p>
          <button
            onClick={() => signOut()}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md"
          >
            Sign Out
          </button>

          <h2 className="text-2xl mt-8 font-semibold text-teal-200">Top Matches</h2>
          <ul className="mt-4 space-y-4">
            {matches.map((m: any) => (
              <li
                key={m.userId}
                className="bg-white/10 backdrop-blur-md border border-teal-400/40 p-4 rounded-xl shadow hover:scale-[1.02] transition-transform"
              >
                <p className="text-xl font-semibold text-teal-200">{m.name}</p>
                <p className="text-sm text-gray-300">{m.email}</p>
                <p className="text-sm font-medium text-blue-300">Match Score: {(m.score * 100).toFixed(1)}%</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
