import { NextApiRequest, NextApiResponse } from 'next';
import {connectToDatabase} from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { userId, tutorialId, completedAt } = req.body;
  await connectToDatabase();

  try {
    await User.updateOne(
      { _id: userId },
      { $addToSet: { completedTutorials: { tutorialId, completedAt } } }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Tutorial progress save error", err);
    return res.status(500).json({ error: "Failed to save progress" });
  }
}
