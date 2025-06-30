// src/pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
console.log("✅ Model loaded is:", User.modelName);

import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  await connectToDatabase();

  const {
    name,
    email,
    password,
    academicLevel,
    subjects,
    preferredStudyTimes,
    learningStyle,
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      academicLevel,
      subjects,
      preferredStudyTimes,
      learningStyle,
      joinedGroups: [],
      interactionHistory: [],
      matches: [],
    });

    res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
}
