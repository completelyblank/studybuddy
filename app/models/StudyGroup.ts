import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyGroup extends Document {
  title: string;
  description?: string;
  subject: string;
  academicLevel?: string;
  meetingTime?: string;
  groupType: 'Virtual' | 'In-Person';
  members: mongoose.Types.ObjectId[];
  chatHistory: {
    sender: mongoose.Types.ObjectId;
    message: string;
    sentAt: Date;
  }[];
  whiteboardState?: any;
}

const studyGroupSchema = new Schema<IStudyGroup>({
  title: { type: String, required: true },
  description: String,
  subject: { type: String, required: true },
  academicLevel: String,
  meetingTime: String,
  groupType: { type: String, enum: ['Virtual', 'In-Person'], default: 'Virtual' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  chatHistory: [{
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    message: String,
    sentAt: { type: Date, default: Date.now }
  }],
  whiteboardState: Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.models.StudyGroup || mongoose.model<IStudyGroup>('StudyGroup', studyGroupSchema);
