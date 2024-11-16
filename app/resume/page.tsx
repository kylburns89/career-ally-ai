"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeBuilder from "@/components/resume/resume-builder";
import ResumeAnalyzer from "@/components/resume/resume-analyzer";
import ResumeTemplates from "@/components/resume/resume-templates";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ResumePage() {
  const [activeResume, setActiveResume] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Resume Builder & Analyzer</h1>
        <p className="text-muted-foreground">
          Create, edit, and analyze your resume with AI-powered insights
        </p>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analyzer">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <ResumeBuilder activeResume={activeResume} setActiveResume={setActiveResume} />
        </TabsContent>

        <TabsContent value="templates">
          <ResumeTemplates onSelect={setActiveResume} />
        </TabsContent>

        <TabsContent value="analyzer">
          <ResumeAnalyzer resumeContent={activeResume} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
