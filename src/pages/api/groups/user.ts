import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import StudyGroup from "../../../models/StudyGroup";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";

interface IStudyGroup {
  _id: Types.ObjectId | string;
  title: string;
  description?: string;
  members: (Types.ObjectId | string)[];
}

interface IUser {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  avatar?: string;
  academicLevel?: string;
  subjects?: string[];
  preferredStudyTimes?: { day: string; startTime: string; endTime: string }[];
  learningStyle?: string;
  studyGoals?: string;
  joinedGroups?: IStudyGroup[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(userId)
      .populate<{
        joinedGroups: IStudyGroup[];
      }>({
        path: "joinedGroups",
        model: StudyGroup,
        select: "title description members",
        populate: {
          path: "members",
          model: User,
          select: "_id", // Only fetch _id to avoid null references
        },
      })
      .lean<IUser>();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transformedGroups = (user.joinedGroups || []).map((group) => ({
      _id: group._id?.toString() || "", // Fallback for invalid _id
      title: group.title || "",
      description: group.description || "",
      members: (group.members || [])
        .filter((member): member is Types.ObjectId | string => member != null) // Filter out null/undefined
        .map((member) => member.toString()),
    }));

    res.status(200).json(transformedGroups);
  } catch (err) {
    console.error("Failed to fetch user's groups:", err);
    res.status(500).json({ message: "Server error" });
  }
}