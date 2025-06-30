// src/pages/api/users/avatar.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { userId, avatar } = req.body;

  if (!userId || !avatar) {
    return res.status(400).json({ message: "userId and avatar are required" });
  }

  await connectToDatabase();

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "Avatar updated", user });
  } catch (err) {
    console.error("Error updating avatar:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
