import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/dbConnect";
import User from "../../../models/User";

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
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter out the groupId
    user.joinedGroups = user.joinedGroups.filter(
      (id: any) => id.toString() !== groupId.toString()
    );

    await user.save();

    return res.status(200).json({ message: "Left group" });
  } catch (err) {
    console.error("Leave group error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
