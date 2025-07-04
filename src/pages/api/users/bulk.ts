// pages/api/users/bulk.ts
import type { NextApiRequest, NextApiResponse } from "next";
import User from "../../../models/User";
import dbConnect from "../../../utils/dbConnect";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { userIds } = req.body;
  if (!Array.isArray(userIds)) {
    return res.status(400).json({ error: "userIds must be an array" });
  }

  try {
    await dbConnect();
    const users = await User.find({ _id: { $in: userIds } }).select("name");
    const userData = users.map((user) => ({ id: user._id.toString(), name: user.name }));
    return res.status(200).json(userData);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ error: "Server error" });
  }
}