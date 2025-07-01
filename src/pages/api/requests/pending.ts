import { NextApiRequest, NextApiResponse } from "next";
import StudyPartnerRequest from "../../../models/StudyPartnerRequest";
import dbConnect from "../../../utils/dbConnect"; 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const requests = await StudyPartnerRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: "pending",
    })
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar");

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Server error" });
  }
}