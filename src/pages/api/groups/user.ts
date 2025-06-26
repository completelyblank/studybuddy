import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import StudyGroup from "../../../models/StudyGroup";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectToDatabase();

  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const user = await User.findById(userId).populate("joinedGroups");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.joinedGroups || []);
  } catch (err) {
    console.error("Failed to fetch user's groups:", err);
    res.status(500).json({ message: "Server error" });
  }
}
