import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/dbConnect";
import StudyGroup from "../../../models/StudyGroup";
import User from "../../../models/User";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("Request headers:", req.headers);
  console.log("Cookies:", req.cookies);
  console.log("Session token:", req.cookies["next-auth.session-token"]);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("JWT Token:", token);

  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name, description, subject, academicLevel, meetingTime, groupType, creatorId } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Group name is required" });
  }
  if (!subject || typeof subject !== "string") {
    return res.status(400).json({ error: "Subject is required" });
  }
  if (creatorId !== token.id) {
    return res.status(403).json({ error: "Invalid creator ID" });
  }

  try {
    await dbConnect();
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const studyGroup = new StudyGroup({
      title: name,
      description: description || "",
      subject,
      academicLevel: academicLevel || "",
      meetingTime: meetingTime || "",
      groupType: groupType || "Virtual",
      members: [creatorId],
      chatHistory: [],
      whiteboardState: {},
    });

    await studyGroup.save();
    console.log(`Group created: ${studyGroup._id}, Title: ${name}`);
    return res.status(201).json({ groupId: studyGroup._id.toString() });
  } catch (err) {
    console.error("Error creating group:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
