// pages/learn.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import QuizPlayer from "../components/QuizPlayer";
import TutorialViewer from "../components/TutorialViewer";
import { Section, Card, Button, Badge, Grid, LoadingSpinner, EmptyState } from "../components/ui";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LearnPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<any[]>([]);
  const [completedTutorials, setCompletedTutorials] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [activeTutorial, setActiveTutorial] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'tutorials'>('quizzes');

  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      setLoading(true);
      try {
        toast.info("Loading learning content...", { autoClose: 1500 });
        const [quizRes, tutorialRes, userRes] = await Promise.all([
          axios.get("/api/quizzes"),
          axios.get("/api/tutorials"),
          axios.get("/api/users/me", { params: { userId } }),
        ]);

        setQuizzes(quizRes.data);
        setTutorials(tutorialRes.data);
        setCompletedQuizzes(userRes.data.completedQuizzes || []);
        setCompletedTutorials(userRes.data.completedTutorials || []);
        toast.success("Learning content loaded ✅", { autoClose: 2000 });
      } catch (err) {
        console.error("Load error:", err);
        toast.error("Failed to load learning content ❌", { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center">
        <Card variant="elevated" className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-gray-300 mb-6">Please sign in to access learning content</p>
          <Button onClick={() => window.location.href = '/auth/signin'}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      <Section title="Learning Center" subtitle="Master new concepts with interactive tutorials and quizzes">
        {/* Active Content */}
        {activeQuiz && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Active Quiz: {activeQuiz.title}</h3>
              <Button variant="outline" size="sm" onClick={() => setActiveQuiz(null)}>
                Close Quiz
              </Button>
            </div>
            <QuizPlayer questions={activeQuiz.questions} quizId={activeQuiz._id} />
          </Card>
        )}

        {activeTutorial && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Active Tutorial: {activeTutorial.title}</h3>
              <Button variant="outline" size="sm" onClick={() => setActiveTutorial(null)}>
                Close Tutorial
              </Button>
            </div>
            <TutorialViewer tutorial={activeTutorial} />
          </Card>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 rounded-lg p-1">
          <Button
            variant={activeTab === 'quizzes' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('quizzes')}
            className="flex-1"
          >
            📝 Quizzes ({quizzes.length})
          </Button>
          <Button
            variant={activeTab === 'tutorials' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('tutorials')}
            className="flex-1"
          >
            🎥 Tutorials ({tutorials.length})
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Available Quizzes</h3>
                  {quizzes.length > 0 ? (
                    <Grid cols={3} gap="lg">
                      {quizzes.map((quiz) => (
                        <Card key={quiz._id} variant="elevated" className="hover:scale-105 transition-transform">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">{quiz.title}</h4>
                              <Badge variant="info" className="mb-2">
                                {quiz.questions.length} questions
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">
                                Estimated time: {Math.ceil(quiz.questions.length * 2)} min
                              </div>
                            </div>
                          </div>
                          
                          {quiz.description && (
                            <p className="text-gray-300 mb-4 text-sm">{quiz.description}</p>
                          )}
                          
                          <Button
                            onClick={() => setActiveQuiz(quiz)}
                            className="w-full"
                          >
                            Start Quiz
                          </Button>
                        </Card>
                      ))}
                    </Grid>
                  ) : (
                    <EmptyState
                      title="No quizzes available"
                      description="Check back later for new quizzes"
                      icon={
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    />
                  )}
                </div>

                {completedQuizzes.length > 0 && (
                  <Card>
                    <h3 className="text-xl font-semibold text-white mb-6">Completed Quizzes</h3>
                    <Grid cols={2} gap="md">
                      {completedQuizzes.map((quiz, i) => (
                        <Card key={i} variant="outlined">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">Quiz #{quiz.quizId}</h4>
                            <Badge variant="success">
                              {quiz.score}/10
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300">
                            Completed: {new Date(quiz.date).toLocaleDateString()}
                          </p>
                        </Card>
                      ))}
                    </Grid>
                  </Card>
                )}
              </div>
            )}

            {/* Tutorials Tab */}
            {activeTab === 'tutorials' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Available Tutorials</h3>
                  {tutorials.length > 0 ? (
                    <Grid cols={3} gap="lg">
                      {tutorials.map((tutorial) => (
                        <Card key={tutorial._id} variant="elevated" className="hover:scale-105 transition-transform">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">{tutorial.title}</h4>
                              <Badge variant="info" className="mb-2">
                                {tutorial.topic}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">
                                Duration: {tutorial.duration || 'N/A'}
                              </div>
                            </div>
                          </div>
                          
                          {tutorial.description && (
                            <p className="text-gray-300 mb-4 text-sm">{tutorial.description}</p>
                          )}
                          
                          <Button
                            onClick={() => setActiveTutorial(tutorial)}
                            className="w-full"
                          >
                            View Tutorial
                          </Button>
                        </Card>
                      ))}
                    </Grid>
                  ) : (
                    <EmptyState
                      title="No tutorials available"
                      description="Check back later for new tutorials"
                      icon={
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      }
                    />
                  )}
                </div>

                {completedTutorials.length > 0 && (
                  <Card>
                    <h3 className="text-xl font-semibold text-white mb-6">Completed Tutorials</h3>
                    <Grid cols={2} gap="md">
                      {completedTutorials.map((tutorial, i) => (
                        <Card key={i} variant="outlined">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">Tutorial #{tutorial.tutorialId}</h4>
                            <Badge variant="success">Completed</Badge>
                          </div>
                          <p className="text-sm text-gray-300">
                            Completed: {new Date(tutorial.completedAt).toLocaleDateString()}
                          </p>
                        </Card>
                      ))}
                    </Grid>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </Section>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
