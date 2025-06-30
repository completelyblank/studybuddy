// pages/api/group-feedback.ts
import dbConnect from "../../utils/dbConnect";
import User from "../../models/User";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, groupId, rating, comments } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Initialize if missing
    if (!user.groupInteractionHistory) user.groupInteractionHistory = [];

    const existingIndex = user.groupInteractionHistory.findIndex(
      (item: any) => item.group.toString() === groupId
    );

    if (existingIndex !== -1) {
      // ✅ Update existing feedback
      user.groupInteractionHistory[existingIndex].rating = rating;
      user.groupInteractionHistory[existingIndex].comments = comments;
      user.groupInteractionHistory[existingIndex].ratedAt = new Date();
    } else {
      // ✅ Add new feedback
      user.groupInteractionHistory.push({
        group: groupId,
        rating,
        comments,
        ratedAt: new Date(),
      });
    }

    await user.save();
    return res.status(200).json({ message: "Group feedback saved" });
  } catch (error) {
    console.error("Error saving group feedback", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
