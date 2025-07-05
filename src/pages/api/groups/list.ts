import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import StudyGroup from "../../../models/StudyGroup";
import User from "../../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectToDatabase();

    // Extract query parameters for filtering
    const { subject, academicLevel, time } = req.query;

    // Build the query object for filtering
    const query: any = {};
    
    // Filter by subject (case-insensitive)
    if (subject && typeof subject === 'string' && subject.trim()) {
      query.subject = { 
        $regex: subject.trim(), 
        $options: 'i' 
      };
    }
    
    // Filter by academic level (case-insensitive)
    if (academicLevel && typeof academicLevel === 'string' && academicLevel.trim()) {
      query.academicLevel = { 
        $regex: academicLevel.trim(), 
        $options: 'i' 
      };
    }
    
    // Filter by creation time if provided
    if (time && typeof time === 'string' && time.trim()) {
      try {
        const timeDate = new Date(time);
        if (!isNaN(timeDate.getTime())) {
          query.createdAt = { $gte: timeDate };
        }
      } catch (error) {
        console.warn("Invalid time parameter:", time);
      }
    }

    // Fetch filtered groups with proper error handling
    const groups = await StudyGroup.find(query).lean();
    
    if (!groups) {
      return res.status(200).json([]);
    }

    // Get users with group interaction history for rating calculation
    const users = await User.find({ 
      "groupInteractionHistory.0": { $exists: true } 
    }).lean();

    const groupFeedbackMap = new Map();

    // Calculate ratings from user interaction history
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
        if (typeof entry.rating === 'number' && !isNaN(entry.rating)) {
          data.total += entry.rating;
          data.count += 1;
        }
        
        if (entry.comments) {
          data.comments.push({
            user: user._id.toString(),
            rating: entry.rating,
            comments: entry.comments,
            ratedAt: entry.ratedAt || new Date(),
          });
        }
      }
    }

    // Enrich groups with rating data
    const enrichedGroups = groups.map((group) => {
      const groupId = group._id.toString();
      const feedback = groupFeedbackMap.get(groupId);
      
      const averageRating = feedback && feedback.count > 0 
        ? Math.round((feedback.total / feedback.count) * 10) / 10 
        : null;

      return {
        _id: groupId,
        title: group.title,
        description: group.description,
        subject: group.subject,
        academicLevel: group.academicLevel,
        meetingTime: group.meetingTime,
        groupType: group.groupType,
        members: group.members || [],
        chatHistory: group.chatHistory || [],
        whiteboardState: group.whiteboardState,
        averageRating,
        feedbackComments: feedback ? feedback.comments : [],
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
      };
    });

    // Log for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log("Query Parameters:", { subject, academicLevel, time });
      console.log("Query Object:", query);
      console.log("Found Groups:", enrichedGroups.length);
      console.log("Sample Group:", enrichedGroups[0]);
    }

    res.status(200).json(enrichedGroups);
  } catch (error) {
    console.error("Error in groups API handler:", error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: "Failed to fetch groups",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
