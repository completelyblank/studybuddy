import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import MatchHistory from "../../../models/MatchHistory";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getTopMatches } from "../../../lib/similarity";

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

    const currentUser = (await User.findById(userId).lean()) as any as import("../../../models/User").IUser;
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const users = (await User.find({ _id: { $ne: userId } }).lean()) as any as import("../../../models/User").IUser[];

    if (!users || users.length === 0) {
      return res.status(200).json([]);
    }

    const matches = getTopMatches(currentUser, users, 3, 0.2);

    // Save to match history if matches exist
    if (matches.length > 0) {
      try {
        for (const match of matches) {
          const matchedSubjects = (currentUser.subjects || []).filter((subject: string) =>
            (match.user.subjects || []).includes(subject)
          );

          await MatchHistory.create({
            userA: currentUser._id,
            userB: match.user._id,
            matchedSubjects,
            compatibilityScore: match.score,
          });
        }
      } catch (historyError) {
        console.warn("Failed to save match history:", historyError);
        // Don't fail the request if history saving fails
      }
    }

    const transformedMatches = matches.map(({ user, score }) => ({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
    }));

    res.status(200).json(transformedMatches);
  } catch (error: any) {
    console.error("Error in matchmaking API:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: "Failed to find study partners",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
