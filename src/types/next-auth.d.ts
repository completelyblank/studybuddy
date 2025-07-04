import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  }

  
}

export interface ITimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IStudyGroup {
  _id: Types.ObjectId | string;
  title: string;
  description?: string;
  members: Types.ObjectId[] | string[];
}

export interface IUser {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  avatar?: string;
  academicLevel?: string;
  subjects?: string[];
  preferredStudyTimes?: ITimeSlot[];
  learningStyle?: string;
  studyGoals?: string;
  joinedGroups?: IStudyGroup[];
}
