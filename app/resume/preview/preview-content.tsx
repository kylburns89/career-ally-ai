"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ResumePreview from "@/components/resume/resume-preview";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ResumeContent, BaseExperience, BaseEducation, BaseProject, BaseCertification } from "@/types/resume";
import { useToast } from "@/components/ui/use-toast";

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
  summary: string;
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
  projects?: Array<{
    name: string;
    description: string;
    technologies: string | string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  template: string | null;
  sections: string[];
}

export function PreviewContent(): JSX.Element {
  const [resumeData, setResumeData] = useState<ResumeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");
  const { toast } = useToast();

  useEffect(() => {
    const fetchResume = async () => {
      if (!resumeId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/resumes/${resumeId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please log in to view this resume");
          }
          throw new Error("Failed to fetch resume");
        }
        
        const data = await response.json();
        setResumeData(data.content);
      } catch (error) {
        console.error("Error fetching resume:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch resume",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId, toast]);

  const handleExport = async () => {
    if (!resumeId) return;

    try {
      setExporting(true);
      const response = await fetch(`/api/resumes/export/pdf/${resumeId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to export this resume");
        }
        throw new Error("Failed to export resume as PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeData?.personalInfo?.fullName || 'resume'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Resume exported successfully",
      });
    } catch (error) {
      console.error("Error exporting resume as PDF:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export resume",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Transform resumeData to match PreviewResumeData format
  const transformedData = resumeData ? {
    personalInfo: {
      fullName: resumeData.personalInfo.fullName || resumeData.personalInfo.name || "",
      email: resumeData.personalInfo.email || "",
      phone: resumeData.personalInfo.phone || "",
      location: resumeData.personalInfo.location || "",
      linkedin: resumeData.personalInfo.linkedin,
      website: resumeData.personalInfo.website,
    },
    summary: resumeData.summary || "",
    experience: resumeData.experience.map((exp: BaseExperience) => ({
      title: exp.title,
      company: exp.company,
      duration: exp.duration || `${exp.startDate || ''}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}`,
      description: exp.description,
    })),
    education: resumeData.education.map((edu: BaseEducation) => ({
      degree: edu.degree,
      school: edu.school,
      year: edu.graduationDate || edu.year || '',
    })),
    skills: resumeData.skills,
    projects: resumeData.projects?.map((project: BaseProject) => ({
      name: project.name,
      description: project.description,
      technologies: project.technologies,
      url: project.url || project.link,
    })),
    certifications: resumeData.certifications?.map((cert: BaseCertification) => ({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      url: cert.url,
    })),
    template: resumeData.template || "professional",
    sections: resumeData.sections || [
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
    ],
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
        <Button onClick={handleExport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting..." : "Export as PDF"}
        </Button>
      </div>

      <Card className="p-8">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold">
            {transformedData.personalInfo.fullName}&apos;s Resume
          </h2>
        </div>
        <div className="border rounded-lg overflow-hidden bg-white">
          <ResumePreview data={transformedData} />
        </div>
      </Card>
    </div>
  );
}
