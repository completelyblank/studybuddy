import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/dbConnect";
import Chat from "../../../models/Chat";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid chat ID" });
  }

  try {
    const chat = await Chat.findById(id).populate("messages.senderId", "name avatar")

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    return res.status(200).json(chat);
  } catch (err) {
    console.error("Error fetching chat:", err);
    return res.status(500).json({ error: "Server error" });
  }
}