// src/pages/api/groups/join.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import StudyGroup from "../../../models/StudyGroup";
import User from "../../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
   console.log("Request method:", req.method); 
    console.log("BODY:", req.body);
  if (req.method === "POST") {
    try {
      const { groupId, userId } = req.body;

      const group = await StudyGroup.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });

      if (group.members.includes(userId)) {
        return res.status(400).json({ message: "User already in group" });
      }

      group.members.push(userId);
      await group.save();

      await User.findByIdAndUpdate(userId, { $addToSet: { joinedGroups: groupId } });

      res.status(200).json({ message: "Joined group successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to join group" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
