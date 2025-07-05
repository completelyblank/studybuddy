// types/resource.ts (create this file)

export interface Resource {
  [x: string]: any;

  _id: string;
  title: string;
  contentUrl: string;
  type: 'Video' | 'Article' | 'Quiz';
  subjectTags: string[];
  difficultyLevel?: string;
  description?: string;
  averageRating: number;
}
