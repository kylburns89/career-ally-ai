"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ResumePreview from "@/components/resume/resume-preview";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ResumeContent } from "@/types/resume";

// Interface matching the ResumePreview component's expectations
interface PreviewResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
  template: string | null;
}

export default function ResumePreviewPage() {
  const [resumeData, setResumeData] = useState<ResumeContent | null>(null);
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
      a.download = `${resumeData?.personalInfo.name.replace(/\s+/g, '-').toLowerCase()}-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting resume as PDF:", error);
    }
  };

  // Transform resumeData to match PreviewResumeData format
  const transformedData = resumeData ? {
    personalInfo: {
      fullName: resumeData.personalInfo.name,
      email: resumeData.personalInfo.email,
      phone: resumeData.personalInfo.phone || "",
      location: resumeData.personalInfo.location || "",
      linkedin: resumeData.personalInfo.linkedin,
      website: resumeData.personalInfo.website,
    },
    experience: resumeData.experience.map((exp: { title: string; company: string; startDate: string; endDate?: string; description: string[] }) => ({
      title: exp.title,
      company: exp.company,
      duration: `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}`,
      description: exp.description.join('\n'),
    })),
    education: resumeData.education.map((edu: { degree: string; school: string; graduationDate: string }) => ({
      degree: edu.degree,
      school: edu.school,
      year: edu.graduationDate,
    })),
    skills: resumeData.skills,
    template: resumeData.template || "professional", // Use template from data or fallback
  } as PreviewResumeData : null;

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!resumeData || !transformedData) {
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
            {resumeData.personalInfo.name}&apos;s Resume
          </h2>
        </div>
        <div className="border rounded-lg overflow-hidden bg-white">
          <ResumePreview data={transformedData} />
        </div>
      </Card>
    </div>
  );
}
