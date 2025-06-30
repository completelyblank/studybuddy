import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Resource from "../../../models/Resource";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { subject, difficultyLevel } = req.query;

  const filters: any = {};
  if (subject) filters.subjectTags = subject;
  if (difficultyLevel) filters.difficultyLevel = difficultyLevel;

  try {
    const resources = await Resource.find(filters).sort({ averageRating: -1 });
    res.status(200).json(resources);
  } catch (error) {
    console.error("Failed to fetch tutorials:", error);
    res.status(500).json({ message: "Error fetching tutorials" });
  }
}
