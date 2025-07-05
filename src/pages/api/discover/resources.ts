import User from "../../../models/User";
import Resource from "../../../models/Resource";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Extract query parameters
    const { subject, academicLevel, time } = req.query;

    // Build the query object for filtering
    const query: any = {};
    
    // Filter by subject tags (case-insensitive)
    if (subject && typeof subject === 'string' && subject.trim()) {
      query.subjectTags = { 
        $regex: subject.trim(), 
        $options: 'i' 
      };
    }
    
    // Filter by difficulty level (which maps to academic level)
    if (academicLevel && typeof academicLevel === 'string' && academicLevel.trim()) {
      query.difficultyLevel = { 
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

    // Fetch filtered resources with proper error handling
    const resources = await Resource.find(query).lean();
    
    if (!resources) {
      return res.status(200).json([]);
    }

    // Calculate average ratings from the ratings array in each resource
    const enrichedResources = resources.map((resource) => {
      let averageRating = 0;
      let ratingCount = 0;

      if (resource.ratings && Array.isArray(resource.ratings)) {
        const totalRating = resource.ratings.reduce((sum, rating) => {
          if (typeof rating.rating === 'number' && !isNaN(rating.rating)) {
            ratingCount++;
            return sum + rating.rating;
          }
          return sum;
        }, 0);

        averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
      }

      return {
        _id: resource._id.toString(),
        title: resource.title,
        contentUrl: resource.contentUrl,
        type: resource.type,
        subjectTags: resource.subjectTags || [],
        difficultyLevel: resource.difficultyLevel,
        description: resource.description,
        ratings: resource.ratings || [],
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt
      };
    });

    // Log for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log("Query Parameters:", { subject, academicLevel, time });
      console.log("Query Object:", query);
      console.log("Found Resources:", enrichedResources.length);
      console.log("Sample Resource:", enrichedResources[0]);
    }

    res.status(200).json(enrichedResources);
  } catch (error) {
    console.error("Error in resources API handler:", error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: "Failed to fetch resources",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}