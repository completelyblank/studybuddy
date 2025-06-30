// pages/api/feedback.ts
import dbConnect from "../../utils/dbConnect";
import User from "../../models/User";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, resourceId, rating, comments } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingIndex = user.interactionHistory.findIndex(
      (item: { resource: any }) => item.resource.toString() === resourceId
    );

    if (existingIndex !== -1) {
      // ✅ Update existing feedback
      user.interactionHistory[existingIndex].rating = rating;
      user.interactionHistory[existingIndex].comments = comments;
      user.interactionHistory[existingIndex].viewedAt = new Date();
    } else {
      // ✅ Add new feedback
      user.interactionHistory.push({
        resource: resourceId,
        rating,
        comments,
        viewedAt: new Date(),
      });
    }

    await user.save();
    return res.status(200).json({ message: "Feedback saved" });
  } catch (error) {
    console.error("Error saving feedback", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
