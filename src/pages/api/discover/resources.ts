import User from "../../../models/User";
import Resource from "../../../models/Resource";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const resources = await Resource.find({});
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

  res.status(200).json(enriched);
}
