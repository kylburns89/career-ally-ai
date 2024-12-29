"use client";

import Image from "next/image";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { type Template } from "../../types/resume";

interface ResumeTemplatesProps {
  onSelect: (templateId: Template) => void;
}

const templates: Array<{
  id: Template;
  name: string;
  description: string;
  preview: string;
  status?: string;
}> = [
  {
    id: "professional" as Template,
    name: "Professional",
    description: "A clean and modern template suitable for most industries",
    preview: "/templates/professional.png",
  },
  {
    id: "minimal" as Template,
    name: "Minimal",
    description: "Clean and concise design that focuses on essential information",
    preview: "/templates/minimal.png",
  },
  {
    id: "technical" as Template,
    name: "Technical",
    description: "Optimized for software developers and IT professionals",
    preview: "/templates/technical.png", // Using professional as placeholder
  },
  {
    id: "executive" as Template,
    name: "Executive",
    description: "Sophisticated design for senior professionals and executives",
    preview: "/templates/professional.png", // Using professional as placeholder
    status: "coming soon"
  },
  {
    id: "creative" as Template,
    name: "Creative",
    description: "Modern and unique design for creative professionals",
    preview: "/templates/professional.png", // Using professional as placeholder
    status: "coming soon"
  },
  {
    id: "academic" as Template,
    name: "Academic",
    description: "Formal layout ideal for academic and research positions",
    preview: "/templates/professional.png", // Using professional as placeholder
    status: "coming soon"
  }
];

export default function ResumeTemplates({ onSelect }: ResumeTemplatesProps) {
  const { toast } = useToast();

  const handleTemplateSelect = (templateId: Template, status?: string) => {
    if (status === "coming soon") {
      toast({
        title: "Coming Soon",
        description: "This template will be available soon. Please check back later.",
        duration: 3000,
      });
      return;
    }

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
          <div className="relative w-full h-48">
            <Image
              src={template.preview}
              alt={template.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {template.status && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                {template.status}
              </div>
            )}
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
            <Button
              onClick={() => handleTemplateSelect(template.id, template.status)}
              variant="outline"
              className="w-full"
            >
              {template.status ? "Coming Soon" : "Use Template"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
