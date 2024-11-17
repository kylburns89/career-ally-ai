"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import type { ResumeContent, ResumeAnalysis } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";

interface ResumeAnalyzerProps {
  resumeContent: ResumeContent | null;
  resumeId: string | null;
  existingAnalysis: ResumeAnalysis | null;
  onAnalysisComplete?: (analysis: ResumeAnalysis) => void;
}

export default function ResumeAnalyzer({ 
  resumeContent, 
  resumeId,
  existingAnalysis,
  onAnalysisComplete 
}: ResumeAnalyzerProps) {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(existingAnalysis);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Update analysis when existingAnalysis changes
  useEffect(() => {
    setAnalysis(existingAnalysis);
  }, [existingAnalysis]);

  const analyzeResume = async () => {
    if (!resumeContent || !resumeId) {
      toast({
        title: "Error",
        description: "No resume selected for analysis.",
        variant: "destructive",
      });
      return;
    }

    // Validate resume content structure
    if (!resumeContent.personalInfo || !resumeContent.experience || 
        !resumeContent.education || !resumeContent.skills) {
      toast({
        title: "Error",
        description: "Invalid resume structure. Please ensure all required sections are filled out.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          resume: resumeContent,
          resumeId 
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.details || data.error || "Failed to analyze resume");
      }

      const newAnalysis = data.analysis as ResumeAnalysis;
      setAnalysis(newAnalysis);
      onAnalysisComplete?.(newAnalysis);

      toast({
        title: "Success",
        description: "Resume analysis completed successfully",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze resume",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!resumeContent) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Please create or select a resume to analyze
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          onClick={analyzeResume}
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!loading && analysis && <RefreshCw className="mr-2 h-4 w-4" />}
          {analysis ? 'Regenerate Analysis' : 'Analyze Resume'}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Strengths</h3>
              {analysis.generated_at && (
                <span className="text-xs text-muted-foreground">
                  Generated: {new Date(analysis.generated_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Improvement Suggestions</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
