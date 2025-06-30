import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import StudyGroup from "../../../models/StudyGroup";
import User from "../../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  const groups = await StudyGroup.find({}).lean();
  const users = await User.find({ "groupInteractionHistory.0": { $exists: true } }).lean();

  const groupFeedbackMap = new Map();

  for (const user of users) {
    for (const entry of user.groupInteractionHistory || []) {
      const groupId = entry.group.toString();

      if (!groupFeedbackMap.has(groupId)) {
        groupFeedbackMap.set(groupId, {
          total: 0,
          count: 0,
          comments: []
        });
      }

      const data = groupFeedbackMap.get(groupId);
      data.total += entry.rating;
      data.count += 1;
      data.comments.push({
        rating: entry.rating,
        comments: entry.comments,
        ratedAt: entry.ratedAt,
      });
    }
  }

  const enrichedGroups = groups.map((group) => {
    const groupId = (group._id as any).toString(); 
    const feedback = groupFeedbackMap.get(groupId);
    return {
      ...group,
      _id: groupId,
      averageRating: feedback ? feedback.total / feedback.count : null,
      feedbackComments: feedback ? feedback.comments : [],
    };
  });

  res.status(200).json(enrichedGroups);
}
