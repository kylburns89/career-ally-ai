"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ResumeAnalyzer({ resumeContent }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeResume = async () => {
    if (!resumeContent) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resume: resumeContent }),
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error analyzing resume:", error);
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
      <Button
        onClick={analyzeResume}
        disabled={loading}
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Analyze Resume
      </Button>

      {analysis && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Strengths</h3>
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