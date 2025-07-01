// pages/api/requests/send.js
import mongoose from "mongoose";
import StudyPartnerRequest from "../../../models/StudyPartnerRequest";
import {connectToDatabase} from "../../../lib/mongodb";

export default async function handler(req: { method: string; body: { senderId: any; receiverId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; message?: string; request?: any; }): void; new(): any; }; }; }) {
  await connectToDatabase();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: "Missing senderId or receiverId" });
  }

  try {
    // Check for existing request
    const existingRequest = await StudyPartnerRequest.findOne({
      senderId,
      receiverId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Request already pending" });
    }

    const request = new StudyPartnerRequest({ senderId, receiverId });
    await request.save();
    res.status(201).json({ message: "Request sent", request });
  } catch (err) {
    console.error("Error sending request:", err);
    res.status(500).json({ error: "Server error" });
  }
}