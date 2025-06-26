import { IUser } from "../models/User";

/**
 * Converts a user profile to a string-based vector of interests
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
 * Calculate cosine similarity between two string arrays (feature sets)
 */
export function cosineSimilarity(vecA: string[], vecB: string[]): number {
  const allTokens = Array.from(new Set([...vecA, ...vecB]));

  const a: number[] = allTokens.map((token) => vecA.includes(token) ? 1 : 0);
  const b: number[] = allTokens.map((token) => vecB.includes(token) ? 1 : 0);

  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));

  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

/**
 * Given a user and a list of other users, return the top matches
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
