import type { NextApiRequest, NextApiResponse } from 'next';

const quizzes = [
  {
    _id: "quiz1",
    title: "Math Basics Quiz",
    questions: [
      {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "22"],
        correctAnswerIndex: 1,
      },
      {
        question: "What is 10 / 2?",
        options: ["2", "4", "5", "10"],
        correctAnswerIndex: 2,
      },
    ],
  },
  {
    _id: "quiz2",
    title: "Physics Quiz",
    questions: [
      {
        question: "What is the unit of force?",
        options: ["Watt", "Joule", "Newton", "Pascal"],
        correctAnswerIndex: 2,
      },
    ],
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(quizzes);
}
