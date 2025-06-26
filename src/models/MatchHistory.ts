import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchHistory extends Document {
  userA: mongoose.Types.ObjectId;
  userB: mongoose.Types.ObjectId;
  compatibilityScore: number;
  matchedSubjects: string[];
  matchedAt: Date;
  feedback?: string;
}

const matchHistorySchema = new Schema<IMatchHistory>({
  userA: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userB: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  compatibilityScore: { type: Number, required: true },
  matchedSubjects: [String],
  matchedAt: { type: Date, default: Date.now },
  feedback: String
});

export default mongoose.models.MatchHistory || mongoose.model<IMatchHistory>('MatchHistory', matchHistorySchema);
