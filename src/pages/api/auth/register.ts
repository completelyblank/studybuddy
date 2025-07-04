import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

console.log("✅ Model loaded is:", User.modelName);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const {
    name,
    email,
    password,
    academicLevel,
    subjects,
    preferredStudyTimes,
    learningStyle,
  } = req.body;

  // Validate required fields
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  // Validate subjects
  if (!Array.isArray(subjects) || subjects.length === 0 || !subjects.every((s: any) => typeof s === "string" && s.trim())) {
    return res.status(400).json({ message: "Subjects must be a non-empty array of strings" });
  }

  // Validate preferredStudyTimes
  if (preferredStudyTimes && !Array.isArray(preferredStudyTimes)) {
    return res.status(400).json({ message: "Preferred study times must be an array" });
  }
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  for (const slot of preferredStudyTimes || []) {
    if (!slot.day || !days.includes(slot.day)) {
      return res.status(400).json({ message: "Each time slot must have a valid day" });
    }
    if (!slot.startTime || !timeRegex.test(slot.startTime)) {
      return res.status(400).json({ message: "Each time slot must have a valid start time (HH:MM)" });
    }
    if (!slot.endTime || !timeRegex.test(slot.endTime)) {
      return res.status(400).json({ message: "Each time slot must have a valid end time (HH:MM)" });
    }
    const startMinutes = parseInt(slot.startTime.split(":")[0]) * 60 + parseInt(slot.startTime.split(":")[1]);
    const endMinutes = parseInt(slot.endTime.split(":")[0]) * 60 + parseInt(slot.endTime.split(":")[1]);
    if (startMinutes >= endMinutes) {
      return res.status(400).json({ message: "End time must be after start time" });
    }
  }

  try {
    await connectToDatabase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      academicLevel: academicLevel || "",
      subjects,
      preferredStudyTimes: preferredStudyTimes || [],
      learningStyle: learningStyle || "",
      joinedGroups: [],
      interactionHistory: [],
      matches: [],
    });

    console.log(`User registered: ${user._id}, Email: ${email}`);
    res.status(201).json({ message: "User registered", userId: user._id.toString() });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
}
