import StudyGroup from "../models/StudyGroup";
import Resource from "../models/Resource";
import { IUser } from "../models/User";
import { contentSimilarity } from "./similarity";

/**
 * Recommend study groups based on user subjects and preferences.
 */
export async function recommendStudyGroups(user: IUser, limit = 5) {
  const allGroups = await StudyGroup.find();

  const userVector = [...(user.subjects || []), user.academicLevel || ""];

  const scored = allGroups.map((group) => {
    const groupVector = [group.subject, group.academicLevel || ""];
    const score = contentSimilarity(userVector, groupVector);
    return { group, score };
  });

  return scored
    .filter(({ score }) => score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ group }) => group);
}

/**
 * Recommend resources based on user interaction and tags.
 */
export async function recommendResources(user: IUser, limit = 5) {
  const allResources = await Resource.find();

  const userVector = [
    ...(user.subjects || []),
    ...(user.interactionHistory?.map((i) => i.resource.toString()) || []),
  ];

  const scored = allResources.map((res) => {
    const resVector = [...res.subjectTags];
    const score = contentSimilarity(userVector, resVector);
    return { res, score };
  });

  return scored
    .filter(({ score }) => score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ res }) => res);
}
