import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/dbConnect";
import User from "../../../models/User";
import Group from "../../../models/StudyGroup";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { userId, groupId } = req.body;

  console.log("LEAVE GROUP BODY:", req.body);

  if (!userId || !groupId) {
    return res.status(400).json({ message: "Missing userId or groupId" });
  }

  try {
    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is in the group
    if (!user.joinedGroups.includes(groupId)) {
      return res.status(400).json({ message: "User is not a member of this group" });
    }

    // Filter out the groupId
    user.joinedGroups = user.joinedGroups.filter(
      (id: any) => id.toString() !== groupId.toString()
    );

    // Optional: fix malformed preferredStudyTimes if it accidentally became a string
    if (!Array.isArray(user.preferredStudyTimes)) {
      console.warn("Invalid preferredStudyTimes value. Resetting to empty array.");
      user.preferredStudyTimes = [];
    }



    await user.save();

    // Optionally, update group's members list
    group.members = group.members.filter((id: any) => id.toString() !== userId.toString());
    await group.save();

    return res.status(200).json({ message: "Left group successfully" });
  } catch (err: any) {
    console.error("Leave group error:", err);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
}