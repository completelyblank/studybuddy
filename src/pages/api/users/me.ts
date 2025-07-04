// src/pages/api/users/me.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User, { IUser } from "../../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = (session as any)?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await connectToDatabase();

  try {
    const user = await User.findById(userId).lean<IUser>();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null, // ✅ Add avatar to the response
      joinedGroups: (user.joinedGroups || []).map((group: any) => {
        if (typeof group === "object" && group._id) {
          return {
            _id: group._id.toString(),
            title: group.title ?? "",
            description: group.description ?? "",
          };
        }
        return { _id: group.toString(), title: "", description: "" };
      }),
    });

  } catch (err) {
    console.error("❌ Error in /api/users/me:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
