"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeBuilder } from "@/components/resume/resume-builder";
import ResumeAnalyzer from "@/components/resume/resume-analyzer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/protected-route";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Resume, ResumeData, ResumeContent, ResumeAnalysis } from "@/types/database";

export default function ResumePage() {
  const [activeResume, setActiveResume] = useState<string | null>(null);
  const [activeResumeContent, setActiveResumeContent] = useState<ResumeContent | null>(null);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<ResumeAnalysis | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const fetchResumes = useCallback(async () => {
    try {
      // Check auth session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to get session");
      }

      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetch("/api/resumes");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch resumes");
      }
      const data = await response.json();
      console.log("Fetched resumes:", data);
      setResumes(data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load your resumes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Update active resume states whenever activeResume changes
  useEffect(() => {
    if (activeResume) {
      try {
        const parsedResume = JSON.parse(activeResume) as Resume;
        setActiveResumeContent(parsedResume.content);
        setActiveResumeId(parsedResume.id);
        setActiveAnalysis(parsedResume.analysis);
      } catch (error) {
        console.error("Error parsing resume:", error);
        setActiveResumeContent(null);
        setActiveResumeId(null);
        setActiveAnalysis(null);
      }
    } else {
      setActiveResumeContent(null);
      setActiveResumeId(null);
      setActiveAnalysis(null);
    }
  }, [activeResume]);

  const handleResumeSelect = (resume: Resume) => {
    const content = resume.content as ResumeData;
    setActiveResume(JSON.stringify(resume));
    setSelectedTemplate(content.template);
    // Switch to builder tab
    const tabsList = document.querySelector('[role="tablist"]');
    const builderTab = tabsList?.querySelector('[value="builder"]') as HTMLButtonElement;
    if (builderTab) {
      builderTab.click();
    }
  };

  const handleNewResume = () => {
    setActiveResume(null);
    setActiveResumeContent(null);
    setActiveResumeId(null);
    setActiveAnalysis(null);
    setSelectedTemplate(null);
    // Switch to builder tab
    const tabsList = document.querySelector('[role="tablist"]');
    const builderTab = tabsList?.querySelector('[value="builder"]') as HTMLButtonElement;
    if (builderTab) {
      builderTab.click();
    }
  };

  const handleAnalysisComplete = (analysis: ResumeAnalysis) => {
    setActiveAnalysis(analysis);
    // Update the active resume with the new analysis
    if (activeResume) {
      try {
        const parsedResume = JSON.parse(activeResume) as Resume;
        const updatedResume = {
          ...parsedResume,
          analysis
        };
        setActiveResume(JSON.stringify(updatedResume));
      } catch (error) {
        console.error("Error updating resume with new analysis:", error);
      }
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete resume");
      }

      toast({
        title: "Success",
        description: "Resume deleted successfully",
      });

      await fetchResumes();
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete resume",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Resume Builder & Analyzer</h1>
            <p className="text-muted-foreground">
              Create, edit, and analyze your resume with AI-powered insights
            </p>
          </div>
          <Button onClick={handleNewResume}>Create New Resume</Button>
        </div>

        {loading ? (
          <Card className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </Card>
        ) : resumes.length > 0 ? (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Your Resumes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume) => (
                <Card
                  key={resume.id}
                  className="p-4 hover:bg-accent cursor-pointer"
                  onClick={() => handleResumeSelect(resume)}
                >
                  <div>
                    <h3 className="font-medium">{resume.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDeleteResume(resume.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ) : null}

        <Tabs defaultValue="builder" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="analyzer">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <ResumeBuilder 
              activeResume={activeResume} 
              setActiveResume={setActiveResume} 
              selectedTemplate={selectedTemplate}
              onSave={fetchResumes}
            />
          </TabsContent>

          <TabsContent value="analyzer">
            <Card className="p-6">
              <ResumeAnalyzer 
                resumeContent={activeResumeContent}
                resumeId={activeResumeId}
                existingAnalysis={activeAnalysis}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
