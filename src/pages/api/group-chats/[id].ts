import { NextApiRequest, NextApiResponse } from "next";
import GroupChat from "../../../models/GroupChat";
import dbConnect from "../../../utils/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid id" });
  }

  try {
    const groupChat = await GroupChat.findOne({ groupId: id }).populate("groupId", "title");
    if (!groupChat) {
      return res.status(404).json({ error: "Group chat not found" });
    }
    res.status(200).json(groupChat);
  } catch (err) {
    console.error("Error fetching group chat:", err);
    res.status(500).json({ error: "Server error" });
  }
}