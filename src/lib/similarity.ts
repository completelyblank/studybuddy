import { IUser } from "../models/User";

/**
 * Converts a user profile to a string vector of interests
 */
export function userToVector(user: IUser): string[] {
  return [
    ...(user.subjects || []),
    ...(user.preferredStudyTimes || []),
    ...(user.academicLevel ? [user.academicLevel] : []),
    ...(user.learningStyle ? [user.learningStyle] : []),
  ];
}

/**
 * Calculates cosine similarity between two string arrays
 */
export function cosineSimilarity(vecA: string[], vecB: string[]): number {
  const allTokens = Array.from(new Set([...vecA, ...vecB]));

  const a = allTokens.map((token) => (vecA.includes(token) ? 1 : 0));
  const b = allTokens.map((token) => (vecB.includes(token) ? 1 : 0));

  // Explicitly cast reduce initial values to number
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0 as number);
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0 as number));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0 as number));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Get top N matches for a user based on cosine similarity
 */
export function getTopMatches(
  currentUser: IUser,
  others: IUser[],
  topN: number = 3,
  minScore: number = 0.2
): { user: IUser; score: number }[] {
  const currentVector = userToVector(currentUser);

  return others
    .map((user) => {
      const compareVector = userToVector(user);
      const score = cosineSimilarity(currentVector, compareVector);
      return { user, score };
    })
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
