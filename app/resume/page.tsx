"use client";

import { useState } from "react";
import type { SavedResume } from "../../types/resume";
import { useResumes } from "../../hooks/use-resumes";
import { PageContainer } from "../../components/page-container";
import { LoadingPage } from "../../components/loading";
import { ResumeBuilder } from "../../components/resume/resume-builder";
import ResumeAnalyzer from "../../components/resume/resume-analyzer";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ScrollArea } from "../../components/ui/scroll-area";

export default function ResumePage() {
  const { resumes, isLoading, refreshResumes } = useResumes();
  const [selectedResume, setSelectedResume] = useState<SavedResume | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("builder");

  const handleResumeSelect = (resume: SavedResume) => {
    setSelectedResume(resume);
  };

  const handleNewResume = () => {
    setSelectedResume(undefined);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <Button
            variant="outline"
            onClick={handleNewResume}
            disabled={!selectedResume}
          >
            Create New Resume
          </Button>
        </div>

        {/* Resume Builder/Analyzer */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="analyzer" disabled={!selectedResume}>
                Analyzer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder">
              <ResumeBuilder
                activeResume={selectedResume}
                setActiveResume={setSelectedResume}
                selectedTemplate={selectedResume?.content.template}
                onSave={refreshResumes}
              />
            </TabsContent>

            <TabsContent value="analyzer">
              {selectedResume ? (
                <ResumeAnalyzer
                  resumeContent={selectedResume.content}
                  resumeId={selectedResume.id || null}
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
    </PageContainer>
  );
}
