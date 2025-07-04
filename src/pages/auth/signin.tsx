// src/pages/auth/signin.tsx
import { getProviders, signIn } from "next-auth/react";
import { GetServerSideProps } from "next";
import { useState } from "react";

export default function SignIn({ providers }: { providers: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
      <div className="bg-white/10 backdrop-blur-md border border-teal-400/40 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-teal-300 drop-shadow-lg">
          Sign In
        </h1>

        <form onSubmit={handleCredentialsSignIn} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-blue-200 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-blue-200 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 py-2 px-4 rounded-lg text-white font-semibold shadow-md transition"
          >
            Sign in with Email
          </button>
        </form>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};
