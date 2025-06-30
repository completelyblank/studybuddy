import type { NextApiRequest, NextApiResponse } from 'next';

const tutorials = [
  {
    _id: "tut1",
    title: "Introduction to Algebra",
    content: "Algebra is the branch of mathematics dealing with symbols...",
    videoUrl: "https://www.youtube.com/embed/HEfHFsfGXjs", // Example video
  },
  {
    _id: "tut2",
    title: "Photosynthesis Explained",
    content: "Photosynthesis is a process used by plants to convert light energy...",
    videoUrl: "https://www.youtube.com/embed/d1YBv2mWll0",
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(tutorials);
}
