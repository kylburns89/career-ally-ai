'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Download, Copy, Trash2 } from "lucide-react";

// Rest of the file remains exactly the same
interface SavedLetter {
  id: string;
  title: string;
  content: string;
  template: string;
  createdAt: Date;
}

const TEMPLATES = [
  {
    id: "professional",
    name: "Professional",
    description: "Traditional format suitable for corporate roles",
    example: `Dear [Hiring Manager],

I am writing to express my strong interest in the [Position] role at [Company]. With my background in [relevant experience], I am confident in my ability to contribute effectively to your team.

[Body paragraphs...]

Thank you for considering my application. I look forward to discussing how I can contribute to [Company]'s continued success.

Best regards,
[Your Name]`,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Modern style for creative industries",
    example: `Hi [Company] team!

I was thrilled to discover the [Position] opening at [Company]. As a passionate [profession] with [X] years of experience, I'm excited about the possibility of bringing my creative vision to your innovative team.

[Body paragraphs...]

I'd love to discuss how my unique perspective and skills could contribute to [Company]'s creative endeavors.

Best,
[Your Name]`,
  },
  {
    id: "technical",
    name: "Technical",
    description: "Focused on technical roles and achievements",
    example: `Dear [Hiring Manager],

I am writing to apply for the [Position] position at [Company]. As a [technical role] with [X] years of experience in [technologies/skills], I am excited about the opportunity to contribute to your engineering team.

[Body paragraphs...]

I look forward to discussing how my technical expertise aligns with [Company]'s goals.

Best regards,
[Your Name]`,
  },
] as const;

const INDUSTRY_PROMPTS = {
  technology: [
    "Highlight specific technical projects or contributions",
    "Mention relevant programming languages and tools",
    "Describe scalability challenges you've solved",
  ],
  finance: [
    "Emphasize quantitative analysis skills",
    "Mention regulatory compliance experience",
    "Highlight risk management expertise",
  ],
  healthcare: [
    "Focus on patient care experience",
    "Mention relevant certifications",
    "Highlight experience with healthcare systems",
  ],
} as const;

export function CoverLetterGenerator(): JSX.Element {
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    resumeContent: "",
    industry: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [letterTitle, setLetterTitle] = useState("");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const { toast } = useToast();

  const characterLimit = 4000;
  const wordCount = generatedLetter.trim().split(/\s+/).length;

  useEffect(() => {
    const saved = localStorage.getItem("savedCoverLetters");
    if (saved) {
      setSavedLetters(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (autoSaveEnabled && generatedLetter) {
      const timeoutId = setTimeout(() => {
        handleSave(true);
      }, 30000);
      return () => clearTimeout(timeoutId);
    }
  }, [generatedLetter, autoSaveEnabled]);

  const handleDelete = (letterId: string) => {
    const updatedLetters = savedLetters.filter(letter => letter.id !== letterId);
    setSavedLetters(updatedLetters);
    localStorage.setItem("savedCoverLetters", JSON.stringify(updatedLetters));
    
    toast({
      title: "Deleted",
      description: "Cover letter has been deleted.",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateLetter = async () => {
    if (!formData.jobDescription || !formData.resumeContent) {
      toast({
        title: "Missing Information",
        description: "Please provide both job description and resume content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedLetter("");
    
    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          template: selectedTemplate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      if (!data.coverLetter) {
        throw new Error("No cover letter content received");
      }

      setGeneratedLetter(data.coverLetter);
      setLetterTitle(`${formData.companyName} - ${formData.jobTitle}`);
      
      toast({
        title: "Success!",
        description: "Your cover letter has been generated.",
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = (isAutoSave = false) => {
    if (!generatedLetter || !letterTitle) return;

    const newLetter: SavedLetter = {
      id: Date.now().toString(),
      title: letterTitle,
      content: generatedLetter,
      template: selectedTemplate,
      createdAt: new Date(),
    };

    const updatedLetters = [...savedLetters, newLetter];
    setSavedLetters(updatedLetters);
    localStorage.setItem("savedCoverLetters", JSON.stringify(updatedLetters));

    if (!isAutoSave) {
      toast({
        title: "Saved!",
        description: "Your cover letter has been saved.",
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/cover-letter/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: generatedLetter,
          format: "pdf",
          title: letterTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to export cover letter");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${letterTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Exported!",
        description: "Cover letter exported as PDF",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export cover letter. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="saved">Saved Letters</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <form className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Template Style</label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATES.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {template.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Job Title</label>
                    <Input
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <Input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g. Tech Corp Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <Select 
                      value={formData.industry} 
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, industry: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(INDUSTRY_PROMPTS).map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry.charAt(0).toUpperCase() + industry.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Job Description</label>
                    <Textarea
                      name="jobDescription"
                      value={formData.jobDescription}
                      onChange={handleInputChange}
                      placeholder="Paste the job description here..."
                      className="min-h-[200px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Your Resume</label>
                    <Textarea
                      name="resumeContent"
                      value={formData.resumeContent}
                      onChange={handleInputChange}
                      placeholder="Paste your resume content here..."
                      className="min-h-[200px]"
                    />
                  </div>

                  {formData.industry && (
                    <Card className="p-4 bg-muted">
                      <h4 className="font-medium mb-2">Industry-Specific Tips:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {INDUSTRY_PROMPTS[formData.industry as keyof typeof INDUSTRY_PROMPTS].map((tip, index) => (
                          <li key={index} className="text-sm">{tip}</li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  <Button
                    type="button"
                    onClick={generateLetter}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Cover Letter"
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Generated Cover Letter</h3>
                  <div className="text-sm text-muted-foreground">
                    {wordCount} words | {generatedLetter.length}/{characterLimit} characters
                  </div>
                </div>

                {generatedLetter && (
                  <div className="space-y-4">
                    <Input
                      value={letterTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLetterTitle(e.target.value)}
                      placeholder="Enter a title for your cover letter"
                      className="mb-4"
                    />
                    
                    <Textarea
                      value={generatedLetter}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGeneratedLetter(e.target.value)}
                      className="min-h-[500px]"
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => handleSave()} disabled={!generatedLetter}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={!generatedLetter}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export as PDF
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLetter);
                          toast({
                            title: "Copied!",
                            description: "Cover letter copied to clipboard.",
                          });
                        }}
                        disabled={!generatedLetter}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Saved Cover Letters</h3>
            <div className="space-y-4">
              {savedLetters.map((letter) => (
                <Card key={letter.id} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{letter.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(letter.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Template: {TEMPLATES.find(t => t.id === letter.template)?.name}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGeneratedLetter(letter.content);
                        setLetterTitle(letter.title);
                        setSelectedTemplate(letter.template);
                        setActiveTab("write");
                      }}
                    >
                      Load
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExport}
                    >
                      Export as PDF
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(letter.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {savedLetters.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No saved cover letters yet
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
