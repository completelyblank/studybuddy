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
      callbackUrl: "/dashboard", // Redirect after login
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In to StudyBuddy</h1>

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 py-2 px-4 rounded text-white font-semibold"
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
