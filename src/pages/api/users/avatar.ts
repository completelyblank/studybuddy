import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === "PUT") {
    const { userId, avatar } = req.body;

    if (!userId || !avatar) {
      return res.status(400).json({ message: "userId and avatar are required" });
    }

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { avatar },
        { new: true }
      ).select("avatar");
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({ message: "Avatar updated", avatar: user.avatar });
    } catch (err) {
      console.error("Error updating avatar:", err);
      return res.status(500).json({ message: "Server error" });
    }

  } else if (req.method === "GET") {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    try {
      const user = userId.includes("@")
        ? await User.findOne({ email: userId }).select("avatar")
        : await User.findById(userId).select("avatar");

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({ avatar: user.avatar || "" });

    } catch (err) {
      console.error("Error fetching avatar:", err);
      return res.status(500).json({ message: "Server error" });
    }

  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
