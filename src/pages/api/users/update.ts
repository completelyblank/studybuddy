// src/pages/api/users/update.ts
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../../models/User";
import { connectToDatabase } from "../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).end();

  const { userId, academicLevel, subjects, preferredStudyTimes, learningStyle, studyGoals } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  await connectToDatabase();

  await User.findByIdAndUpdate(userId, {
    academicLevel,
    subjects,
    preferredStudyTimes,
    learningStyle,
    studyGoals,
  });

  res.status(200).json({ message: "Profile updated" });
}
