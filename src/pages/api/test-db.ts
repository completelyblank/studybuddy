import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    return res.status(200).json({ message: "MongoDB Connected ✅" });
  } catch (err) {
    return res.status(500).json({ message: "MongoDB Connection Failed ❌", error: err });
  }
}
