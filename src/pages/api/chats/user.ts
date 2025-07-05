import { NextApiRequest, NextApiResponse } from "next";
import Chat from "../../../models/Chat";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../utils/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const userId = (session as any)?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await dbConnect();

    const chats = await Chat.find({
      participants: userId,
    })
      .populate("messages.senderId", "name email avatar")
      .populate("participants", "name email avatar")
      .lean();

    const transformedChats = chats.map((chat: any) => ({
      _id: chat._id?.toString() || "",
      participants: (chat.participants || []).map((participant: any) => ({
        _id: participant._id?.toString() || "",
        name: participant.name,
        email: participant.email,
        avatar: participant.avatar || null,
      })),
      messages: (chat.messages || []).map((message: any) => ({
        _id: message._id?.toString() || "",
        senderId: {
          _id: message.senderId._id?.toString() || "",
          name: message.senderId.name,
          email: message.senderId.email,
          avatar: message.senderId.avatar || null,
        },
        content: message.content,
        timestamp: message.timestamp || message.createdAt,
      })),
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }));

    res.status(200).json(transformedChats);
  } catch (error: any) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: "Failed to fetch user chats",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}