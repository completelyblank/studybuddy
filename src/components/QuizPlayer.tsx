import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

interface QuizPlayerProps {
    questions: QuizQuestion[];
    quizId: string;
}

export default function QuizPlayer({ questions, quizId }: QuizPlayerProps) {
    const { data: session } = useSession();
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [complete, setComplete] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

    // Timer logic
    useEffect(() => {
        if (answered || complete) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAnswer(-1); // treat as wrong or timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [current, answered, complete]);

    function handleAnswer(index: number) {
        if (answered) return;

        setAnswered(true);

        if (index === questions[current].correctAnswerIndex) {
            setScore((prev) => prev + 1);
        }

        setTimeout(() => {
            if (current + 1 < questions.length) {
                setCurrent(current + 1);
                setAnswered(false);
                setTimeLeft(30); // reset timer
            } else {
                setComplete(true);
                saveScore();
            }
        }, 1000);
    }

    async function saveScore() {
        try {
            await axios.post("/api/users/quiz-score", {
                userId: session?.user?.id,
                quizId,
                score,
            });
        } catch (err) {
            console.error("Failed to save score", err);
        }
    }

    if (complete) {
        return (
            <div className="text-center text-green-400 bg-gray-900 p-6 rounded-lg">
                <h2 className="text-2xl font-bold">Quiz Completed</h2>
                <p className="mt-2">
                    You scored <span className="font-semibold">{score}</span> out of{" "}
                    <span className="font-semibold">{questions.length}</span>
                </p>
            </div>
        );
    }

    const currentQuestion = questions[current];

    return (
        <div className="bg-gray-800 p-6 rounded-lg space-y-4 text-white">
            <div className="flex justify-between items-center">
                <p>
                    <strong>Question {current + 1}</strong> / {questions.length}
                </p>
                <p className="text-yellow-300">⏳ {timeLeft}s</p>
            </div>

            <div>
                <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                <ul className="space-y-2 mt-4">
                    {currentQuestion.options.map((opt, i) => {
                        const isCorrect = i === currentQuestion.correctAnswerIndex;
                        const isUserChoice = answered && i === currentQuestion.correctAnswerIndex;

                        return (
                            <li
                                key={i}
                                className={`p-3 rounded cursor-pointer transition ${answered
                                        ? isCorrect
                                            ? "bg-green-600"
                                            : "bg-red-600"
                                        : "bg-gray-700 hover:bg-gray-600"
                                    }`}
                                onClick={() => handleAnswer(i)}
                            >
                                {opt}
                            </li>
                        );
                    })}

                </ul>
            </div>

            <progress
                value={current + (answered ? 1 : 0)}
                max={questions.length}
                className="w-full h-2 mt-4"
            />
        </div>
    );
}
