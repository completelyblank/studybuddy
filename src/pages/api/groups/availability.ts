import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import StudyGroup from "../../../models/StudyGroup";
import User from "../../../models/User";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  users: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { groupId } = req.query;
  console.log("Received groupId:", groupId);

  if (!groupId || typeof groupId !== "string" || !Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ error: "Valid groupId is required" });
  }

  try {
    await connectToDatabase();
    const group = await StudyGroup.findById(groupId).select("members");
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    console.log("Found group:", group);

    const users = await User.find(
      { _id: { $in: group.members } },
      { name: 1, preferredStudyTimes: 1 }
    );
    if (!users.length) {
      return res.status(404).json({ error: "No members found" });
    }

    const availability: AvailabilitySlot[] = [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    for (const day of days) {
      const slotsByDay: { [userId: string]: TimeSlot[] } = {};
      users.forEach((user) => {
        slotsByDay[user._id.toString()] = user.preferredStudyTimes.filter(
          (slot: TimeSlot) => slot.day === day
        );
      });

      const overlaps = findOverlaps(slotsByDay);
      overlaps.forEach((overlap) => {
        const userNames = users
          .filter((user) => overlap.users.includes(user._id.toString()))
          .map((user) => user.name);
        availability.push({
          day,
          startTime: overlap.startTime,
          endTime: overlap.endTime,
          users: userNames,
        });
      });
    }

    console.log("Calculated availability:", availability);
    res.status(200).json(availability);
  } catch (err) {
    console.error("Error fetching availability:", err);
    res.status(500).json({ error: "Server error" });
  }
}

function findOverlaps(slotsByDay: { [userId: string]: TimeSlot[] }): AvailabilitySlot[] {
  const overlaps: AvailabilitySlot[] = [];
  const userIds = Object.keys(slotsByDay);

  if (userIds.length < 2) {
    return slotsByDay[userIds[0]]?.map((slot) => ({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      users: userIds,
    })) || [];
  }

  for (let i = 0; i < userIds.length; i++) {
    for (const slot1 of slotsByDay[userIds[i]]) {
      const start1 = toMinutes(slot1.startTime);
      const end1 = toMinutes(slot1.endTime);
      let overlapUsers = [userIds[i]];

      for (let j = 0; j < userIds.length; j++) {
        if (i === j) continue;
        for (const slot2 of slotsByDay[userIds[j]]) {
          const start2 = toMinutes(slot2.startTime);
          const end2 = toMinutes(slot2.endTime);
          if (start1 < end2 && start2 < end1) {
            overlapUsers.push(userIds[j]);
            const startTime = formatTime(Math.max(start1, start2));
            const endTime = formatTime(Math.min(end1, end2));
            overlaps.push({
              day: slot1.day,
              startTime,
              endTime,
              users: overlapUsers,
            });
            break;
          }
        }
      }
    }
  }

  return overlaps;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}
