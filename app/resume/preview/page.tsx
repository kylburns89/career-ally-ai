"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ResumePreview from "@/components/resume/resume-preview";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ResumeData } from "@/types/database";

export default function ResumePreviewPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  useEffect(() => {
    const fetchResume = async () => {
      if (!resumeId) return;
      
      try {
        const response = await fetch(`/api/resumes/${resumeId}`);
        if (!response.ok) throw new Error("Failed to fetch resume");
        
        const data = await response.json();
        setResumeData(data.content);
      } catch (error) {
        console.error("Error fetching resume:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  const handleExport = async () => {
    if (!resumeId) return;

    try {
      const response = await fetch(`/api/resumes/export/pdf/${resumeId}`);
      if (!response.ok) throw new Error("Failed to export resume as PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting resume as PDF:", error);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="container py-8">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Resume not found</p>
          <Link href="/resume" className="mt-4 inline-block">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resume Builder
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/resume">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resume Builder
          </Button>
        </Link>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </Button>
      </div>

      <Card className="p-8">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold">
            {resumeData.template?.charAt(0).toUpperCase() + resumeData.template?.slice(1)} Template
          </h2>
        </div>
        <div className="border rounded-lg overflow-hidden bg-white">
          <ResumePreview data={resumeData} />
        </div>
      </Card>
    </div>
  );
}
