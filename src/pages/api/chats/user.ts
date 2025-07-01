import { NextApiRequest, NextApiResponse } from "next";
import Chat from "../../../models/Chat";
import dbConnect from "../../../utils/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing or invalid userId" });
  }

  try {
    const chats = await Chat.find({
      participants: userId,
    })
      .populate("messages.senderId", "name")
      .populate("participants", "name email avatar");
    res.status(200).json(chats);
  } catch (err) {
    console.error("Error fetching user chats:", err);
    res.status(500).json({ error: "Server error" });
  }
}