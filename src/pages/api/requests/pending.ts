import { NextApiRequest, NextApiResponse } from "next";
import StudyPartnerRequest from "../../../models/StudyPartnerRequest";
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

    const requests = await StudyPartnerRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: "pending",
    })
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar")
      .lean();

    const transformedRequests = requests.map((request) => ({
      _id: request._id.toString(),
      senderId: {
        _id: request.senderId._id.toString(),
        name: request.senderId.name,
        email: request.senderId.email,
        avatar: request.senderId.avatar || null,
      },
      receiverId: {
        _id: request.receiverId._id.toString(),
        name: request.receiverId.name,
        email: request.receiverId.email,
        avatar: request.receiverId.avatar || null,
      },
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    }));

    res.status(200).json(transformedRequests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: "Failed to fetch pending requests",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}