import User from "../../../models/User";
import Resource from "../../../models/Resource";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    // Extract query parameters
    const { subject, academicLevel, time } = req.query;

    // Build the query object for filtering
    const query: any = {};
    if (subject) query.subject = { $regex: String(subject), $options: 'i' }; // Case-insensitive match
    if (academicLevel) query.academicLevel = String(academicLevel);
    if (time) {
      // Example: Filter resources created after the given time
      query.createdAt = { $gte: new Date(String(time)) };
    }

    // Fetch filtered resources
    const resources = await Resource.find(query);
    const allUsers = await User.find({});

    const resourceRatings: {
      [key: string]: { total: number; count: number };
    } = {};

    const seen = new Set<string>();

    for (const user of allUsers) {
      for (const item of user.interactionHistory) {
        const key = `${user._id}-${item.resource}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const id = item.resource.toString();
        if (!resourceRatings[id]) {
          resourceRatings[id] = { total: 0, count: 0 };
        }
        resourceRatings[id].total += item.rating;
        resourceRatings[id].count += 1;
      }
    }

    const enriched = resources.map((res) => {
      const r = resourceRatings[res._id.toString()];
      return {
        ...res.toObject(),
        averageRating: r ? Number((r.total / r.count).toFixed(1)) : null,
      };
    });

    // Log for debugging
    console.log("Query Parameters:", { subject, academicLevel, time });
    console.log("Resource Ratings:", resourceRatings);
    console.log("Enriched Resources:", enriched.map(r => ({
      id: r._id,
      title: r.title,
      averageRating: r.averageRating,
      subject: r.subject, // Include subject for debugging
    })));

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error in API handler:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}