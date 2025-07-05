// src/pages/api/users/me.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User, { IUser } from "../../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const userId = (session as any)?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connectToDatabase();

    const user = await User.findById(userId).lean<IUser>();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      academicLevel: user.academicLevel || "",
      subjects: user.subjects || [],
      preferredStudyTimes: user.preferredStudyTimes || [],
      learningStyle: user.learningStyle || "",
      studyGoals: user.studyGoals || "",
      joinedGroups: (user.joinedGroups || []).map((group: any) => {
        if (typeof group === "object" && group._id) {
          return {
            _id: group._id.toString(),
            title: group.title || "",
            description: group.description || "",
          };
        }
        return { _id: group.toString(), title: "", description: "" };
      }),
    });

  } catch (error) {
    console.error("Error in /api/users/me:", error);
    return res.status(500).json({ 
      error: "Internal Server Error",
      message: "Failed to fetch user data",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
