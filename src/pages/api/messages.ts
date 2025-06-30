import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../utils/dbConnect";
import Message from "../../models/Messages"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomId } = req.query;

  await dbConnect();

  if (req.method === "GET") {
    try {
      if (!roomId || typeof roomId !== "string") {
        return res.status(400).json({ error: "Invalid roomId" });
      }

      const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
      return res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
