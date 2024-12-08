"use client";

import { useState } from "react";
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
import { CoverLetterPreview } from "./cover-letter-preview";
import { useCoverLetters } from "@/hooks/use-cover-letters";

interface FormData {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumeContent: string;
  industry: string;
}

type TemplateType = "professional" | "creative" | "technical";

interface Template {
  id: TemplateType;
  name: string;
  description: string;
  example: string;
}

const TEMPLATES: Template[] = [
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
];

type IndustryType = "technology" | "finance" | "healthcare";

interface IndustryPrompts {
  [key: string]: string[];
}

const INDUSTRY_PROMPTS: IndustryPrompts = {
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
};

export function CoverLetterGenerator(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    resumeContent: "",
    industry: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("professional");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [letterTitle, setLetterTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { coverLetters, saveCoverLetter, deleteCoverLetter } = useCoverLetters();

  const characterLimit = 4000;
  const wordCount = generatedLetter.trim().split(/\s+/).length;

  const handleSave = async () => {
    if (!generatedLetter || !letterTitle) return;

    const result = await saveCoverLetter(
      letterTitle,
      generatedLetter,
      formData.jobTitle,
      formData.companyName
    );

    if (result) {
      toast({
        title: "Saved!",
        description: "Your cover letter has been saved.",
      });
    }
  };

  const handleDelete = async (letterId: string) => {
    const success = await deleteCoverLetter(letterId);
    
    if (success) {
      toast({
        title: "Deleted",
        description: "Cover letter has been deleted.",
      });
    }
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

  const handleExport = async (content: string, title: string) => {
    try {
      const response = await fetch("/api/cover-letter/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          format: "pdf",
          title,
          template: selectedTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to export cover letter");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
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
            {/* Left panel with form */}
            <Card className="p-6">
              <form className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Template Style</label>
                    <Select 
                      value={selectedTemplate} 
                      onValueChange={(value: string) => setSelectedTemplate(value as TemplateType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATES.map((template: Template) => (
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
                    <p className="text-sm text-muted-foreground mt-1">
                      Include the full job description to help generate a more targeted cover letter.
                    </p>
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
                    <p className="text-sm text-muted-foreground mt-1">
                      Include your resume content to highlight relevant experience and skills.
                    </p>
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

            {/* Right panel with preview */}
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
                    
                    {/* Template preview */}
                    <div className="border rounded-lg overflow-hidden">
                      <CoverLetterPreview 
                        content={generatedLetter}
                        template={selectedTemplate}
                      />
                    </div>

                    {/* Edit mode toggle */}
                    <div className="flex justify-end mb-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? "Show Preview" : "Edit Content"}
                      </Button>
                    </div>

                    {/* Show textarea in edit mode */}
                    {isEditing && (
                      <Textarea
                        value={generatedLetter}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGeneratedLetter(e.target.value)}
                        className="min-h-[500px]"
                      />
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleSave} disabled={!generatedLetter}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleExport(generatedLetter, letterTitle)}
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
              {coverLetters.map((letter) => (
                <Card key={letter.id} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{letter.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(letter.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {letter.job_title && letter.company && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {letter.job_title} at {letter.company}
                    </p>
                  )}
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <CoverLetterPreview 
                      content={letter.content}
                      template="professional"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGeneratedLetter(letter.content);
                        setLetterTitle(letter.name);
                        setActiveTab("write");
                      }}
                    >
                      Load
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport(letter.content, letter.name)}
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
              {coverLetters.length === 0 && (
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
