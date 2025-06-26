import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import StudyGroup from "../../../models/StudyGroup";
import User from "../../../models/User";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
      return res.status(400).json({ message: "Missing groupId or userId" });
    }

    const group = await StudyGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Filter out user from group's members
    group.members = group.members.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== userId
    );
    await group.save();

    // Remove group from user's joinedGroups
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedGroups: group._id },
    });

    return res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error leaving group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
