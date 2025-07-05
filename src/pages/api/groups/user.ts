import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import StudyGroup from "../../../models/StudyGroup";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const userId = (session as any)?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connectToDatabase();
    
    const user = await User.findById(userId)
      .populate<{
        joinedGroups: IStudyGroup[];
      }>({
        path: "joinedGroups",
        model: StudyGroup,
        select: "title description members subject academicLevel groupType",
        populate: {
          path: "members",
          model: User,
          select: "_id name email avatar",
        },
      })
      .lean<IUser>();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const transformedGroups = (user.joinedGroups || []).map((group) => ({
      _id: group._id?.toString() || "",
      title: group.title || "",
      description: group.description || "",
      subject: (group as any).subject || "",
      academicLevel: (group as any).academicLevel || "",
      groupType: (group as any).groupType || "Virtual",
      members: (group.members || [])
        .filter((member): member is Types.ObjectId | string => member != null)
        .map((member) => {
          if (typeof member === 'object' && member !== null) {
            return {
              _id: member._id?.toString() || "",
              name: (member as any).name || "",
              email: (member as any).email || "",
              avatar: (member as any).avatar || null,
            };
          }
          return member.toString();
        }),
    }));

    res.status(200).json(transformedGroups);
  } catch (error) {
    console.error("Failed to fetch user's groups:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: "Failed to fetch user groups",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}