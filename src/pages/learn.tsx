// pages/learn.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import QuizPlayer from "../components/QuizPlayer";
import TutorialViewer from "../components/TutorialViewer";
import Navbar from "../components/Navbar";

export default function LearnPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [tutorials, setTutorials] = useState<any[]>([]);
    const [completedQuizzes, setCompletedQuizzes] = useState<any[]>([]);
    const [completedTutorials, setCompletedTutorials] = useState<any[]>([]);
    const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
    const [activeTutorial, setActiveTutorial] = useState<any | null>(null);

    useEffect(() => {
        if (!userId) return;

        async function loadData() {
            const [quizRes, tutorialRes, userRes] = await Promise.all([
                axios.get("/api/quizzes"),
                axios.get("/api/tutorials"),
                axios.get("/api/users/me", { params: { userId } }),
            ]);

            setQuizzes(quizRes.data);
            setTutorials(tutorialRes.data);
            setCompletedQuizzes(userRes.data.completedQuizzes || []);
            setCompletedTutorials(userRes.data.completedTutorials || []);
        }

        loadData();
    }, [userId]);


    if (!session) return <p className="text-white p-6">Login required</p>;

    return (
        <div className="min-h-screen p-6 bg-black text-white space-y-8">
            <Navbar />
            <h1 className="text-3xl font-bold">Learn: Tutorials & Quizzes</h1>

            {/* ✅ Active Content */}
            {activeQuiz && (
                <div className="bg-gray-900 p-4 rounded">
                    <QuizPlayer questions={activeQuiz.questions} quizId={activeQuiz._id} />
                </div>
            )}

            {activeTutorial && (
                <div className="bg-gray-900 p-4 rounded">
                    <TutorialViewer tutorial={activeTutorial} />


                </div>
            )}

            {/* 📝 Quizzes */}
            <section>
                <h2 className="text-2xl font-semibold mb-2">Available Quizzes</h2>
                <ul className="grid md:grid-cols-3 gap-4">
                    {quizzes.map((quiz) => (
                        <li key={quiz._id} className="bg-gray-800 p-4 rounded">
                            <p className="font-bold">{quiz.title}</p>
                            <p className="text-sm">{quiz.questions.length} questions</p>
                            <button
                                onClick={() => setActiveQuiz(quiz)}
                                className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                            >
                                Start Quiz
                            </button>
                        </li>
                    ))}
                </ul>

                {completedQuizzes.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-medium">Completed Quizzes</h3>
                        <ul className="mt-2 space-y-2">
                            {completedQuizzes.map((q, i) => (
                                <li key={i} className="bg-gray-700 p-3 rounded">
                                    Quiz ID: {q.quizId} — Score: {q.score}/10 — {new Date(q.date).toLocaleDateString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {/* 🎥 Tutorials */}
            <section>
                <h2 className="text-2xl font-semibold mb-2">Tutorials</h2>
                <ul className="grid md:grid-cols-3 gap-4">
                    {tutorials.map((tut) => (
                        <li key={tut._id} className="bg-gray-800 p-4 rounded">
                            <p className="font-bold">{tut.title}</p>
                            <p className="text-sm text-gray-300">{tut.topic}</p>
                            <button
                                onClick={() => setActiveTutorial(tut)}
                                className="mt-2 px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded"
                            >
                                View Tutorial
                            </button>
                        </li>
                    ))}
                </ul>

                {completedTutorials.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-medium">Completed Tutorials</h3>
                        <ul className="mt-2 space-y-2">
                            {completedTutorials.map((t, i) => (
                                <li key={i} className="bg-gray-700 p-3 rounded">
                                    Tutorial ID: {t.tutorialId} — {new Date(t.completedAt).toLocaleDateString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        </div>
    );
}
