import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Hero, Button, Card, Badge, Grid, EmptyState, LoadingSpinner, Section } from "../components/ui";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    setLoading(true);
    fetch(`/api/resources/matchmaking?userId=${userId}`)
      .then((res) => res.json())
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      signIn();
    }
  };

  const features = [
    {
      icon: "👥",
      title: "Study Groups",
      description: "Join or create study groups with like-minded students"
    },
    {
      icon: "💬",
      title: "Real-time Chat",
      description: "Communicate with study partners in real-time"
    },
    {
      icon: "📚",
      title: "Learning Resources",
      description: "Access curated educational content and materials"
    },
    {
      icon: "🎯",
      title: "Smart Matching",
      description: "Find study partners based on your preferences"
    },
    {
      icon: "📝",
      title: "Collaborative Whiteboard",
      description: "Work together on problems and concepts"
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Monitor your learning progress and achievements"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      {/* Hero Section */}
      <Hero
        title="StudyBuddy"
        subtitle="Connect, collaborate, and excel together with your perfect study partners"
        className="pt-8"
      >
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src="/logo.png" alt="Logo" className="h-16 w-16 rounded-xl shadow-lg" />
          <div className="text-left">
            <h1 className="text-5xl lg:text-7xl font-bold text-teal-300 drop-shadow-lg">
              StudyBuddy
            </h1>
            <p className="text-lg text-gray-300">Your AI-powered study companion</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleGetStarted}>
            {session ? 'Go to Dashboard' : 'Get Started'}
          </Button>
          {session && (
            <Button variant="outline" size="lg" onClick={() => signOut()}>
              Sign Out
            </Button>
          )}
        </div>
      </Hero>

      {/* Features Section */}
      <Section title="Why Choose StudyBuddy?" subtitle="Everything you need for successful collaborative learning">
        <Grid cols={3} gap="lg">
          {features.map((feature, index) => (
            <Card key={index} variant="elevated" className="text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Welcome Section for Logged In Users */}
      {session && (
        <Section title="Welcome Back!" subtitle={`Hello, ${session.user?.name} 👋`}>
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={session.user?.image || "/default.jpeg"} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-teal-400"
                />
                <div>
                  <h3 className="text-2xl font-bold text-white">{session.user?.name}</h3>
                  <p className="text-gray-300">{session.user?.email}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  View Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => router.push('/discover')}
                  className="w-full"
                >
                  Discover Resources
                </Button>
              </div>
            </Card>

            {/* Top Matches Section */}
            <Card>
              <h3 className="text-2xl font-bold text-white mb-6">Your Top Study Matches</h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : matches.length > 0 ? (
                <Grid cols={2} gap="md">
                  {matches.slice(0, 4).map((m: any) => (
                    <Card key={m.userId} variant="outlined" className="hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-teal-200">{m.name}</h4>
                        <Badge variant="success">
                          {(m.score * 100).toFixed(0)}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 mb-4">{m.email}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push('/dashboard')}
                      >
                        View Profile
                      </Button>
                    </Card>
                  ))}
                </Grid>
              ) : (
                <EmptyState
                  title="No matches yet"
                  description="Complete your profile to find study partners"
                  icon={
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                  action={
                    <Button onClick={() => router.push('/dashboard')}>
                      Complete Profile
                    </Button>
                  }
                />
              )}
            </Card>
          </div>
        </Section>
      )}

      {/* Call to Action for Non-logged Users */}
      {!session && (
        <Section className="bg-gradient-to-r from-teal-600/20 to-blue-600/20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Study Experience?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already learning smarter with StudyBuddy
            </p>
            <Button size="lg" onClick={() => signIn()}>
              Start Learning Today
            </Button>
          </div>
        </Section>
      )}
    </div>
  );
}
