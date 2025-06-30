import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
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
  groupInteractionHistory: [
    {
      group: { type: Schema.Types.ObjectId, ref: "StudyGroup" },
      rating: Number,
      comments: String,
      viewedAt: Date,
    },
  ][];
  matches: mongoose.Types.ObjectId[];
  completedQuizzes: {
    quizId: string;
    score: number;
    date: Date;
  }[];
  completedTutorials: {
    tutorialId: string;
    completedAt: Date;
  }[];
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: false },
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
      comments: String,
      viewedAt: Date
    }],
    groupInteractionHistory: [
    {
      group: { type: Schema.Types.ObjectId, ref: "StudyGroup" },
      rating: Number,
      comments: String,
      viewedAt: Date,
    }],
    matches: [{ type: Schema.Types.ObjectId, ref: 'MatchHistory' }],
    completedQuizzes: [
      {
        quizId: String,
        score: Number,
        date: Date,
      },
    ],
    completedTutorials: [
      {
        tutorialId: String,
        completedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
