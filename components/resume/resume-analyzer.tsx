"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";
import type { ResumeAnalysis } from "@/types/database";

interface ResumeAnalyzerProps {
  resumeContent: any;
  resumeId: string | null;
  existingAnalysis: ResumeAnalysis | null;
  onAnalysisComplete?: (analysis: ResumeAnalysis) => void;
}

export default function ResumeAnalyzer({
  resumeContent,
  resumeId,
  existingAnalysis,
  onAnalysisComplete,
}: ResumeAnalyzerProps) {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(existingAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const analyzeResume = async () => {
    if (!resumeContent || !resumeId) {
      toast({
        title: "Error",
        description: "No resume selected for analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    const simulateProgress = () => {
      setProgress((prev) => (prev >= 85 ? 85 : prev + 5));
    };
    const progressInterval = setInterval(simulateProgress, 500);

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: resumeContent,
          resumeId,
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze resume");

      // Clear interval before processing response
      clearInterval(progressInterval);
      setProgress(90);

      const data = await response.json();
      
      // Add a small delay before showing completion
      setTimeout(() => {
        setProgress(100);
        setAnalysis(data.analysis);
        onAnalysisComplete?.(data.analysis);

        toast({
          title: "Analysis Complete",
          description: "Your resume has been analyzed successfully.",
        });
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: "Error",
        description: "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Only clear analyzing state after the delay
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 500);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const exportReport = async () => {
    if (!analysis) return;

    try {
      const response = await fetch("/api/analyze-resume/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume-analysis-report.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Analysis report exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export analysis report.",
        variant: "destructive",
      });
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
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={analyzeResume}
            disabled={isAnalyzing}
            className="w-[200px]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                {analysis ? "Reanalyze Resume" : "Analyze Resume"}
              </>
            )}
          </Button>
          {analysis && (
            <Button variant="outline" onClick={exportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          )}
        </div>

        {isAnalyzing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              Analyzing your resume... {progress}%
            </p>
          </div>
        )}

        {analysis && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ats">ATS Compatibility</TabsTrigger>
              <TabsTrigger value="sections">Section Analysis</TabsTrigger>
              <TabsTrigger value="industry">Industry Comparison</TabsTrigger>
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
              <TabsTrigger value="action">Action Items</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Overall Score</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}/100
                    </span>
                    {getScoreIcon(analysis.score)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">ATS Compatibility</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={analysis.atsCompatibility.score} className="flex-1" />
                      <span className={getScoreColor(analysis.atsCompatibility.score)}>
                        {analysis.atsCompatibility.score}%
                      </span>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Content Quality</h4>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Object.values(analysis.sections).reduce((acc, section) => acc + section.score, 0) / 
                          Object.values(analysis.sections).length} 
                        className="flex-1" 
                      />
                      <span className={getScoreColor(
                        Object.values(analysis.sections).reduce((acc, section) => acc + section.score, 0) / 
                        Object.values(analysis.sections).length
                      )}>
                        {Math.round(
                          Object.values(analysis.sections).reduce((acc, section) => acc + section.score, 0) / 
                          Object.values(analysis.sections).length
                        )}%
                      </span>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Industry Alignment</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={analysis.industryComparison.score} className="flex-1" />
                      <span className={getScoreColor(analysis.industryComparison.score)}>
                        {analysis.industryComparison.score}%
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ats">
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">ATS Compatibility Analysis</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Keyword Analysis</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Present Keywords</h5>
                          <div className="flex flex-wrap gap-2">
                            {analysis.atsCompatibility.keywords.present.map((keyword, i) => (
                              <Badge key={i} variant="secondary">{keyword}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2">Missing Keywords</h5>
                          <div className="flex flex-wrap gap-2">
                            {analysis.atsCompatibility.keywords.missing.map((keyword, i) => (
                              <Badge key={i} variant="destructive">{keyword}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Formatting Issues</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {analysis.atsCompatibility.formatting.issues.map((issue, i) => (
                          <li key={i} className="text-red-500">{issue}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {analysis.atsCompatibility.formatting.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-blue-500">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sections">
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(analysis.sections).map(([section, data]) => (
                    <AccordionItem key={section} value={section}>
                      <AccordionTrigger className="flex justify-between">
                        <div className="flex items-center gap-4">
                          <span>{section}</span>
                          <Badge variant={
                            data.impact === "high" ? "destructive" :
                            data.impact === "medium" ? "secondary" : "default"
                          }>
                            {data.impact} impact
                          </Badge>
                        </div>
                        <span className={getScoreColor(data.score)}>
                          {data.score}/100
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Feedback</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {data.feedback.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Suggestions</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {data.suggestions.map((item, i) => (
                              <li key={i} className="text-blue-500">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="industry">
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Industry Comparison</h3>
                  <span className={`text-xl font-bold ${getScoreColor(analysis.industryComparison.score)}`}>
                    {analysis.industryComparison.score}/100
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Industry Strengths</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.industryComparison.strengths.map((strength, i) => (
                        <li key={i} className="text-green-500">{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Industry Gaps</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.industryComparison.gaps.map((gap, i) => (
                        <li key={i} className="text-red-500">{gap}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.industryComparison.recommendations.map((rec, i) => (
                        <li key={i} className="text-blue-500">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="improvements">
              <Card className="p-6 space-y-6">
                <h3 className="text-lg font-semibold">Detailed Improvements</h3>
                <div className="space-y-8">
                  {(analysis.improvements || []).map((improvement, i) => (
                    <div key={i} className="space-y-4 pb-6 border-b last:border-0">
                      <h4 className="font-medium text-lg">{improvement.section}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h5 className="font-medium mb-2 text-red-500">Original</h5>
                          <p>{improvement.original}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h5 className="font-medium mb-2 text-green-500">Improved</h5>
                          <p>{improvement.improved}</p>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Why this improves your resume:</h5>
                        <p className="text-muted-foreground">{improvement.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="action">
              <Card className="p-6 space-y-6">
                <h3 className="text-lg font-semibold">Action Items</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Badge variant="destructive">High Priority</Badge>
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.actionItems.high.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Medium Priority</Badge>
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.actionItems.medium.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Badge variant="default">Low Priority</Badge>
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.actionItems.low.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
}
