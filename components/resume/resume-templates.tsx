"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const templates = [
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
];

export default function ResumeTemplates({ onSelect }) {
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
              onClick={() => onSelect(template.id)}
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