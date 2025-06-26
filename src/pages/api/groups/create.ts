// src/pages/api/groups/create.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import StudyGroup from "../../../models/StudyGroup";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === "POST") {
    try {
      const { title, subject, description, academicLevel, meetingTime, groupType, creatorId } = req.body;

      const group = await StudyGroup.create({
        title,
        subject,
        description,
        academicLevel,
        meetingTime,
        groupType,
        members: [creatorId],
      });

      res.status(201).json(group);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create group" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
