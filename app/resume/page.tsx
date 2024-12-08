"use client";

import { useState } from "react";
import type { ResumeContent, ResumeAnalysis } from "@/types/resume";
import { useResumes } from "@/hooks/use-resumes";
import { PageContainer } from "@/components/page-container";
import { LoadingPage } from "@/components/loading";
import { ResumeBuilder } from "@/components/resume/resume-builder";
import ResumeAnalyzer from "@/components/resume/resume-analyzer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ResumePage() {
  const { resumes, isLoading, refreshResumes } = useResumes();
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("builder");

  if (isLoading) {
    return <LoadingPage />;
  }

  const currentResume = resumes?.find(r => r.id === selectedResume);

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <Button
            variant="outline"
            onClick={() => setSelectedResume(null)}
            disabled={!selectedResume}
          >
            Create New Resume
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
          {/* Resume List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Resumes</h2>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2 pr-4">
                {resumes?.map((resume) => (
                  <Card
                    key={resume.id}
                    className={`p-4 cursor-pointer transition-all hover:border-primary ${
                      selectedResume === resume.id
                        ? "border-primary ring-2 ring-primary ring-opacity-50"
                        : ""
                    }`}
                    onClick={() => setSelectedResume(resume.id)}
                  >
                    <div className="font-medium">{resume.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(resume.updated_at).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
                {resumes?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No resumes yet. Create your first resume!
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Resume Builder/Analyzer */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="analyzer" disabled={!currentResume}>
                  Analyzer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="builder">
                <ResumeBuilder
                  activeResume={selectedResume ? JSON.stringify(currentResume) : null}
                  setActiveResume={setSelectedResume}
                  selectedTemplate={currentResume?.content.template || null}
                  onSave={refreshResumes}
                />
              </TabsContent>

              <TabsContent value="analyzer">
                {currentResume ? (
                  <ResumeAnalyzer
                    resumeContent={currentResume.content}
                    resumeId={currentResume.id}
                    existingAnalysis={null}
                  />
                ) : (
                  <Card className="p-6">
                    <p className="text-center text-muted-foreground">
                      Please select a resume to analyze
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
