import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/dbConnect";
import StudyPartnerRequest from "../../../models/StudyPartnerRequest";
import Chat from "../../../models/Chat";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { requestId, status, userId } = req.body;

  if (!requestId || !status || !userId) {
    return res.status(400).json({ error: "Missing requestId, status, or userId" });
  }

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const request = await StudyPartnerRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.receiverId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    request.status = status;
    await request.save();

    if (status === "approved") {
      // Check if a chat already exists between the sender and receiver
      let chat = await Chat.findOne({
        participants: { $all: [request.senderId, request.receiverId] },
      });

      if (!chat) {
        // Create a new chat
        chat = new Chat({
          participants: [request.senderId, request.receiverId],
          messages: [],
        });
        await chat.save();
      }

      return res.status(200).json({ message: "Request approved", chatId: chat._id });
    } else {
      return res.status(200).json({ message: "Request rejected" });
    }
  } catch (err) {
    console.error("Error responding to request:", err);
    return res.status(500).json({ error: "Server error" });
  }
}