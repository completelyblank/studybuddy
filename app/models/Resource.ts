import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  contentUrl: string;
  type: 'Video' | 'Article' | 'Quiz';
  subjectTags: string[];
  difficultyLevel?: string;
  description?: string;
  ratings: {
    user: mongoose.Types.ObjectId;
    rating: number;
    ratedAt: Date;
  }[];
  averageRating: number;
}

const resourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  contentUrl: { type: String, required: true },
  type: { type: String, enum: ['Video', 'Article', 'Quiz'], required: true },
  subjectTags: [String],
  difficultyLevel: String,
  description: String,
  ratings: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    ratedAt: Date
  }],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', resourceSchema);
