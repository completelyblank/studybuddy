import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import MatchHistory from "../../../models/MatchHistory";
import { getTopMatches } from "../../../lib/similarity"; // or matchmaker, depending on your naming

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  await connectToDatabase();

  const { userId } = req.query;
if (!userId || typeof userId !== "string") {
  return res.status(400).json({ message: "Missing or invalid userId" });
}


  const currentUser = await User.findById(userId);
  if (!currentUser) return res.status(404).json({ message: "User not found" });

  const users = await User.find({ _id: { $ne: userId } });

  const matches = getTopMatches(currentUser, users, 3, 0.2);

  // Optional: Save to match history
  for (const match of matches) {
    await MatchHistory.create({
      userA: currentUser._id,
      userB: match.user._id,
      matchedSubjects: currentUser.subjects.filter((subject: string) =>
  match.user.subjects.includes(subject)
),


      compatibilityScore: match.score,
    });
  }

  res.status(200).json(matches.map(({ user, score }) => ({
    userId: user._id,
    name: user.name,
    email: user.email,
    score,
  })));
}
