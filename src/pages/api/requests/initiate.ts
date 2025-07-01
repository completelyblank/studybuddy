// pages/api/chats/initiate.js
import mongoose from "mongoose";
import Chat from "../../../models/Chat"; // Assuming you have a Chat model
import dbConnect from "../../../utils/dbConnect";

export default async function handler(req: { method: string; body: { userId1: any; userId2: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; chatId?: any; }): void; new(): any; }; }; }) {
  await dbConnect();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId1, userId2 } = req.body;

  if (!userId1 || !userId2) {
    return res.status(400).json({ error: "Missing user IDs" });
  }

  try {
    // Check if a chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [userId1, userId2] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId1, userId2],
        messages: [],
      });
      await chat.save();
    }

    res.status(200).json({ chatId: chat._id });
  } catch (err) {
    console.error("Error initiating chat:", err);
    res.status(500).json({ error: "Server error" });
  }
}