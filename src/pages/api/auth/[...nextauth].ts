// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import User from "../../../models/User";
import { connectToDatabase } from "../../../lib/mongodb";

export const authOptions: NextAuthOptions = {
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
        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user) throw new Error("No user found");
        if (!user.password) throw new Error("User has no password set");
        const valid = await compare(credentials.password, user.password);
        if (!valid) throw new Error("Invalid password");
        console.log("Authorized user:", { id: user._id.toString(), name: user.name, email: user.email }); // Debug
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      console.log("JWT callback:", token); // Debug
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name || null,
        email: token.email || null,
        image: token.picture || null,
      };
      console.log("Session callback:", session); // Debug
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default NextAuth(authOptions);