// src/pages/api/users/quiz-score.ts
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (req.method !== "POST") return res.status(405).end("Only POST allowed");

  const { userId, quizId, score } = req.body;
  if (!userId || !quizId) return res.status(400).json({ error: "Missing fields" });

  try {
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          completedQuizzes: { quizId, score, date: new Date() }
        }
      }
    );
    res.status(200).json({ message: "Score saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
}
