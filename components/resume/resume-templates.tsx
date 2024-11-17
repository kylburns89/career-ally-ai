"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
}

interface ResumeTemplatesProps {
  onSelect: (templateId: string) => void;
}

const templates: Template[] = [
  {
    id: "professional",
    name: "Professional",
    description: "A clean and modern template suitable for most industries",
    preview: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=300&h=400&fit=crop",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Perfect for design and creative industry professionals",
    preview: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=300&h=400&fit=crop",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Optimized for software developers and IT professionals",
    preview: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&h=400&fit=crop",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Elegant design for senior management and executives",
    preview: "https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=300&h=400&fit=crop",
  },
  {
    id: "academic",
    name: "Academic",
    description: "Structured format for academic and research positions",
    preview: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?q=80&w=300&h=400&fit=crop",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and concise design that focuses on essential information",
    preview: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=300&h=400&fit=crop",
  },
];

export default function ResumeTemplates({ onSelect }: ResumeTemplatesProps) {
  const { toast } = useToast();

  const handleTemplateSelect = (templateId: string) => {
    // Call the provided onSelect function
    onSelect(templateId);

    // Show success toast
    toast({
      title: "Template Selected",
      description: "You can now customize your resume in the builder tab.",
      duration: 3000,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="overflow-hidden">
          <img
            src={template.preview}
            alt={template.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4 space-y-2">
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
            <Button
              onClick={() => handleTemplateSelect(template.id)}
              variant="outline"
              className="w-full"
            >
              Use Template
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
