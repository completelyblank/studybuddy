import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  avatar?: string;
  academicLevel?: string;
  subjects: string[];
  studyGoals?: string;
  preferredStudyTimes: string[];
  learningStyle?: string;
  joinedGroups: mongoose.Types.ObjectId[];
  interactionHistory: {
    resource: mongoose.Types.ObjectId;
    rating: number;
    viewedAt: Date;
  }[];
  matches: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  avatar: String,
  academicLevel: String,
  subjects: [String],
  studyGoals: String,
  preferredStudyTimes: [String],
  learningStyle: String,
  joinedGroups: [{ type: Schema.Types.ObjectId, ref: 'StudyGroup' }],
  interactionHistory: [{
    resource: { type: Schema.Types.ObjectId, ref: 'Resource' },
    rating: Number,
    viewedAt: Date
  }],
  matches: [{ type: Schema.Types.ObjectId, ref: 'MatchHistory' }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
