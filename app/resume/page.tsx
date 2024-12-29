"use client";

import { useState, useEffect, Fragment } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import type { SavedResume, ResumeAnalysis } from "../../types/resume"
import { useResumes } from "../../hooks/use-resumes"
import { PageContainer } from "../../components/page-container"
import { LoadingPage } from "../../components/loading"
import { ResumeBuilder } from "../../components/resume/resume-builder"
import { ResumeList } from "../../components/resume/resume-list"
import ResumeAnalyzer from "../../components/resume/resume-analyzer"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useToast } from "../../components/ui/use-toast"

export default function ResumePage(): JSX.Element {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { resumes, isLoading, refreshResumes, deleteResume, updateResume, createResume } = useResumes();
  const [selectedResume, setSelectedResume] = useState<SavedResume | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("builder");
  const [existingAnalysis, setExistingAnalysis] = useState<ResumeAnalysis | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/resume");
    }
  }, [status, router]);

  // Fetch existing analysis when a resume is selected
  useEffect(() => {
    async function fetchAnalysis() {
      if (!selectedResume?.id) {
        setExistingAnalysis(null);
        return;
      }

      try {
        const response = await fetch(`/api/analyze-resume?resumeId=${selectedResume.id}`);
        if (!response.ok) return;

        const data = await response.json();
        if (data.analysis) {
          setExistingAnalysis(data.analysis);
        } else {
          setExistingAnalysis(null);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        setExistingAnalysis(null);
      }
    }

    fetchAnalysis();
  }, [selectedResume?.id]);

  const handleCreateResume = async () => {
    try {
      const defaultTemplate = "professional";
      const newResume = await createResume({
        title: `Resume ${new Date().toLocaleDateString()}`,
        content: {
          personalInfo: {
            fullName: "",
            email: "",
            phone: "",
            location: "",
          },
          summary: "",
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          template: defaultTemplate,
          sections: [
            "summary",
            "experience",
            "education",
            "skills",
            "projects",
            "certifications",
          ],
        },
        template: defaultTemplate,
      });

      setSelectedResume(newResume);
      setActiveTab("builder");
      await refreshResumes();
    } catch (error) {
      console.error('Error creating resume:', error);
      toast({
        title: "Error",
        description: "Failed to create new resume",
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || isLoading) {
    return <LoadingPage />;
  }

  if (status === "unauthenticated") {
    return <Fragment />;
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <Button onClick={handleCreateResume} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Resume
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Resume List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Resumes</h2>
            <ResumeList
              resumes={resumes}
              activeResume={selectedResume}
              onSelect={setSelectedResume}
              onDelete={deleteResume}
              onRename={async (id, name) => {
                if (!selectedResume?.content) return;
                await updateResume(id, name, selectedResume.content);
                await refreshResumes();
              }}
            />
          </Card>

          {/* Resume Builder/Analyzer */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="analyzer" disabled={!selectedResume?.id}>
                  Analyzer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="builder">
                <ResumeBuilder
                  activeResume={selectedResume}
                  setActiveResume={setSelectedResume}
                  selectedTemplate={selectedResume?.content?.template}
                  onSave={refreshResumes}
                />
              </TabsContent>

              <TabsContent value="analyzer">
                {selectedResume?.id ? (
                  <ResumeAnalyzer
                    resumeContent={selectedResume.content}
                    resumeId={selectedResume.id}
                    existingAnalysis={existingAnalysis}
                    onAnalysisComplete={(analysis) => setExistingAnalysis(analysis)}
                  />
                ) : (
                  <Card className="p-6">
                    <p className="text-center text-muted-foreground">
                      Save your resume first to analyze it
                    </p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
