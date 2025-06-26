import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import StudyGroup from "../../../models/StudyGroup";
import Resource from "../../../models/Resource";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== "POST") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const subjectTags = user.subjects;

  const groups = await StudyGroup.find({ subject: { $in: subjectTags } }).limit(5);
  const resources = await Resource.find({ subjectTags: { $in: subjectTags } }).limit(5);

  res.status(200).json({
    recommendedGroups: groups,
    recommendedResources: resources,
  });
}
