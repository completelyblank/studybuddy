import { connectToDatabase } from "../../../lib/mongodb";
import Group from "../../../models/StudyGroup"; 
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();

  const { subject, academicLevel } = req.query;

  const filter: any = {};
  if (subject) filter.subject = subject;
  if (academicLevel) filter.academicLevel = academicLevel;

  try {
    const results = await Group.find(filter).limit(10);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ message: "Server error while fetching groups" });
  }
}
