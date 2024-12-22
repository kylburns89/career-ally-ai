"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Building2, MapPin, Calendar, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useProfile } from "@/hooks/use-profile";

interface Job {
  job_id: string;
  employer_name: string;
  job_title: string;
  job_description: string;
  job_location: string;
  job_posted_at: string;
  job_apply_link: string;
  source: string;
  logo?: string;
}

interface Recommendation {
  title: string;
  description: string;
  estimatedSalary: string;
  requiredSkills: string[];
  matchScore: number;
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/jobs/recommendations', {
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("[JOBS_PAGE] Recommendations error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData?.error
        });
        throw new Error(
          errorData?.error || 
          `Failed to fetch recommendations: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      if (!data.recommendations) {
        throw new Error('Invalid response format');
      }

      setRecommendations(data.recommendations);
      setShowRecommendations(true);
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch job recommendations. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a job title, keyword, or company name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        ...(location && { location }),
        ...(experienceLevel && { experienceLevel }),
      });

      const response = await fetch(`/api/jobs?${params}`, {
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("[JOBS_PAGE] Search error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData?.error
        });
        throw new Error(
          errorData?.error || 
          `Failed to fetch jobs: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setJobs(data.data || []);

    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Find Your Next Opportunity</h1>
      
      {/* AI Recommendations Section */}
      {profile && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-semibold">AI Job Recommendations</h2>
            </div>
            <Button
              onClick={fetchRecommendations}
              disabled={loadingRecommendations}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {loadingRecommendations ? "Getting Recommendations..." : "Get AI Recommendations"}
            </Button>
          </div>
          
          {loadingRecommendations ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </CardContent>
            </Card>
          ) : showRecommendations && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">{rec.title}</CardTitle>
                        <CardDescription>
                          Match Score: {rec.matchScore}%
                        </CardDescription>
                      </div>
                      <span className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        AI Match
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground">
                        {rec.description}
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="text-sm">
                          <span className="font-medium">Estimated Salary:</span> {rec.estimatedSalary}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Required Skills:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {rec.requiredSkills.map((skill, i) => (
                              <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Input
          placeholder="Job title, keywords, or company"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full"
        />
        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Experience Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entry_level">Entry Level</SelectItem>
            <SelectItem value="mid_level">Mid Level</SelectItem>
            <SelectItem value="senior_level">Senior Level</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleSearch}
        className="w-full md:w-auto mb-8"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching...
          </span>
        ) : (
          "Search Jobs"
        )}
      </Button>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.job_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">{job.job_title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {job.employer_name}
                  </CardDescription>
                </div>
                {job.source === 'Example' ? (
                  <span className="text-sm text-muted-foreground">Example Position</span>
                ) : (
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {job.source}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {job.job_location}
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4" />
                  {job.job_posted_at}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.job_description}
                </p>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => window.open(job.job_apply_link, '_blank')}
                    className="flex items-center gap-2"
                  >
                    View Jobs <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {jobs.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Search for jobs to see available positions and job board recommendations
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
