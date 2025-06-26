// src/pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import User from "../../../models/User";
import { connectToDatabase } from "../../../lib/mongodb";

const handler = NextAuth({
  providers: [
   CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found");
        const valid = await compare(credentials.password, user.password);
        if (!valid) throw new Error("Invalid password");
        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
});

// ✅ This is the correct export
export default handler;
