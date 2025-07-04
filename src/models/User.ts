import mongoose, { Schema } from "mongoose";

interface IUser {
  name: string;
  email: string;
  password: string;
  academicLevel?: string;
  subjects: string[];
  preferredStudyTimes: { day: string; startTime: string; endTime: string }[];
  learningStyle?: string;
  joinedGroups: mongoose.Types.ObjectId[];
  interactionHistory: any[];
  matches: any[];
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    academicLevel: String,
    subjects: [String],
    preferredStudyTimes: [
      {
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
    learningStyle: String,
    joinedGroups: [{ type: Schema.Types.ObjectId, ref: "StudyGroup" }],
    interactionHistory: [Schema.Types.Mixed],
    matches: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
