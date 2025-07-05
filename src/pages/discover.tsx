import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Input, Badge, LoadingSpinner, EmptyState, Section, Grid } from "../components/ui";

type GroupFeedback = {
  user: string;
  rating: number;
  comments?: string;
  ratedAt: string;
};

type Group = {
  _id: string;
  title: string;
  description: string;
  subject: string;
  academicLevel: string;
  meetingTime?: string;
  groupType?: string;
  averageRating?: number;
  feedbackComments?: GroupFeedback[];
};

type Resource = {
  _id: string;
  title: string;
  contentUrl: string;
  type: 'Video' | 'Article' | 'Quiz';
  subjectTags: string[];
  difficultyLevel?: string;
  description?: string;
  ratings: any[];
  averageRating: number;
};

type Filters = {
  subject: string;
  academicLevel: string;
  time: string;
};

export default function DiscoverPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    subject: "",
    academicLevel: "",
    time: "",
  });
  const [minRating, setMinRating] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'resources' | 'groups'>('resources');

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create query parameters for filtering
      const queryParams = new URLSearchParams();
      if (filters.subject.trim()) queryParams.append('subject', filters.subject.trim());
      if (filters.academicLevel.trim()) queryParams.append('academicLevel', filters.academicLevel.trim());
      if (filters.time.trim()) queryParams.append('time', filters.time.trim());

      const [groupRes, resourceRes] = await Promise.all([
        axios.get<Group[]>(`/api/groups/list?${queryParams.toString()}`),
        axios.get<Resource[]>(`/api/discover/resources?${queryParams.toString()}`),
      ]);

      setGroups(groupRes.data || []);
      setResources(resourceRes.data || []);
    } catch (err: any) {
      console.error("Fetch error", err);
      setError(err.response?.data?.message || "Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(
    (r) => !minRating || (r.averageRating && r.averageRating >= minRating)
  );

  const filteredGroups = groups.filter(
    (g) => !minRating || (g.averageRating && g.averageRating >= minRating)
  );

  const clearFilters = () => {
    setFilters({ subject: "", academicLevel: "", time: "" });
    setMinRating(0);
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      <Section title="Discover Study Resources" subtitle="Find the perfect learning materials and study groups">
        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-500 bg-red-500/10">
            <div className="flex items-center gap-3">
              <div className="text-red-400">⚠️</div>
              <div>
                <h4 className="text-red-400 font-semibold">Error</h4>
                <p className="text-red-300">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Filters</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              disabled={!filters.subject && !filters.academicLevel && !filters.time && minRating === 0}
            >
              Clear All
            </Button>
          </div>
          <Grid cols={4} gap="md">
            <Input
              label="Subject"
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              placeholder="e.g., Mathematics, Physics"
            />
            <Input
              label="Academic Level"
              value={filters.academicLevel}
              onChange={(e) => handleFilterChange('academicLevel', e.target.value)}
              placeholder="e.g., Beginner, Advanced"
            />
            <Input
              label="Time"
              value={filters.time}
              onChange={(e) => handleFilterChange('time', e.target.value)}
              placeholder="e.g., 2024-01-01"
            />
            <div>
              <label className="block text-sm font-medium text-teal-200 mb-2">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              >
                <option value={0}>All Ratings</option>
                <option value={3}>3+ stars</option>
                <option value={4}>4+ stars</option>
                <option value={4.5}>4.5+ stars</option>
              </select>
            </div>
          </Grid>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 rounded-lg p-1">
          <Button
            variant={activeTab === 'resources' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('resources')}
            className="flex-1"
          >
            📚 Resources ({filteredResources.length})
          </Button>
          <Button
            variant={activeTab === 'groups' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('groups')}
            className="flex-1"
          >
            👥 Study Groups ({filteredGroups.length})
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div>
                {filteredResources.length > 0 ? (
                  <Grid cols={2} gap="lg">
                    {filteredResources.map((resource) => (
                      <Card key={resource._id} variant="elevated" className="hover:scale-105 transition-transform">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{resource.title}</h3>
                            <Badge variant="info" className="mb-2">
                              {resource.type}
                            </Badge>
                          </div>
                          {resource.averageRating && resource.averageRating > 0 ? (
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-400">★</span>
                                <span className="text-white font-semibold">
                                  {resource.averageRating.toFixed(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                {resource.ratings?.length || 0} reviews
                              </p>
                            </div>
                          ) : (
                            <div className="text-right">
                              <p className="text-sm text-gray-400">No ratings yet</p>
                            </div>
                          )}
                        </div>
                        
                        {resource.description && (
                          <p className="text-gray-300 mb-4 line-clamp-2">{resource.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resource.subjectTags?.map((tag, index) => (
                            <Badge key={index} variant="default" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          {resource.difficultyLevel && (
                            <Badge variant="warning" size="sm">
                              {resource.difficultyLevel}
                            </Badge>
                          )}
                          <Button variant="outline" size="sm">
                            View Resource
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </Grid>
                ) : (
                  <EmptyState
                    title="No resources found"
                    description="Try adjusting your filters to find more resources"
                    icon={
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    }
                    action={
                      <Button onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    }
                  />
                )}
              </div>
            )}

            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div>
                {filteredGroups.length > 0 ? (
                  <Grid cols={2} gap="lg">
                    {filteredGroups.map((group) => (
                      <Card key={group._id} variant="elevated" className="hover:scale-105 transition-transform">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{group.title}</h3>
                            <Badge variant="success" className="mb-2">
                              {group.subject}
                            </Badge>
                          </div>
                          {group.averageRating && group.averageRating > 0 ? (
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-400">★</span>
                                <span className="text-white font-semibold">
                                  {group.averageRating.toFixed(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                {group.feedbackComments?.length || 0} reviews
                              </p>
                            </div>
                          ) : (
                            <div className="text-right">
                              <p className="text-sm text-gray-400">No ratings yet</p>
                            </div>
                          )}
                        </div>
                        
                        {group.description && (
                          <p className="text-gray-300 mb-4 line-clamp-2">{group.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {group.academicLevel && (
                            <Badge variant="default" size="sm">
                              {group.academicLevel}
                            </Badge>
                          )}
                          {group.meetingTime && (
                            <Badge variant="default" size="sm">
                              {group.meetingTime}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Badge variant="info" size="sm">
                            {group.groupType || 'Virtual'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Join Group
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </Grid>
                ) : (
                  <EmptyState
                    title="No study groups found"
                    description="Try adjusting your filters to find more groups"
                    icon={
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    }
                    action={
                      <Button onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
}
