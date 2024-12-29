"use client";

import { useState } from "react";
import type { ResumeFormData, Template } from "../../types/resume";
import { normalizeTemplate } from "../../types/resume";
import { Download, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { templateStyles, type TemplateStyle } from "./template-styles";

// Helper function to convert description text into bullet points
function formatDescription(description: unknown): string {
  if (typeof description !== 'string') {
    console.warn('Description is not a string:', description);
    return '';
  }
  
  const lines = description.split('\n').map(line => {
    line = line.trim();
    if (line.startsWith('•') || line.startsWith('-')) {
      return `<li>${line.substring(1).trim()}</li>`;
    }
    else if (line) {
      return `<li>${line}</li>`;
    }
    return '';
  });
  
  return lines.filter(line => line).join('');
}

// Helper function to format technologies
function formatTechnologies(technologies: string | string[]): string {
  if (Array.isArray(technologies)) {
    return technologies.join(', ');
  }
  return technologies;
}

// Component to render a section based on its type
function ResumeSection({ type, data, styles }: { type: string; data: ResumeFormData; styles: TemplateStyle }) {
  switch (type) {
    case 'summary':
      return data.summary ? (
        <div className={styles.section.container}>
          <h2 className={styles.section.title}>Summary</h2>
          <p className={styles.section.content}>{data.summary}</p>
        </div>
      ) : null;

    case 'experience':
      return data.experience.length > 0 ? (
        <div className={styles.section.container}>
          <h2 className={styles.section.title}>Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className={styles.experience.item}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={styles.experience.title}>{exp.title}</h3>
                  <div className={styles.experience.company}>{exp.company}</div>
                </div>
                <div className={styles.experience.duration}>{exp.duration}</div>
              </div>
              <ul className={styles.experience.description}
                  dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }}>
              </ul>
            </div>
          ))}
        </div>
      ) : null;

    case 'education':
      return data.education.length > 0 ? (
        <div className={styles.section.container}>
          <h2 className={styles.section.title}>Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className={styles.education.item}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={styles.education.degree}>{edu.degree}</h3>
                  <div className={styles.education.school}>{edu.school}</div>
                </div>
                <div className={styles.education.year}>{edu.year}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null;

    case 'skills':
      return data.skills.length > 0 ? (
        <div className={styles.section.container}>
          <h2 className={styles.section.title}>Skills</h2>
          <div className={styles.skills.container}>
            {data.skills.map((skill, index) => (
              <span key={index} className={styles.skills.item}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null;

    case 'projects':
      return data.projects && data.projects.length > 0 ? (
        <div className={styles.section.container}>
          <h2 className={styles.section.title}>Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className={styles.projects.item}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={styles.projects.title}>{project.name}</h3>
                  <div className={styles.projects.technologies}>{formatTechnologies(project.technologies)}</div>
                </div>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.projects.link}>
                    View Project
                  </a>
                )}
              </div>
              <ul className={styles.projects.description}
                  dangerouslySetInnerHTML={{ __html: formatDescription(project.description) }}>
              </ul>
            </div>
          ))}
        </div>
      ) : null;

    case 'certifications':
      return data.certifications && data.certifications.length > 0 ? (
        <div className={styles.section.container}>
          <h2 className={styles.section.title}>Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className={styles.certifications.item}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={styles.certifications.title}>{cert.name}</h3>
                  <div className={styles.certifications.issuer}>{cert.issuer}</div>
                </div>
                <div className={styles.certifications.date}>{cert.date}</div>
              </div>
              {cert.url && (
                <a href={cert.url} target="_blank" rel="noopener noreferrer" className={styles.certifications.link}>
                  View Certificate
                </a>
              )}
            </div>
          ))}
        </div>
      ) : null;

    default:
      return null;
  }
}

interface ResumePreviewProps {
  data: ResumeFormData;
  templateId?: Template;
  resumeId?: string;
}

export default function ResumePreview({ data, templateId, resumeId }: ResumePreviewProps) {
  const normalizedTemplateId = normalizeTemplate(templateId || data.template || "professional");
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const styles = templateStyles[normalizedTemplateId] || templateStyles.professional;
  const { toast } = useToast();
  
  if (!data || !data.sections) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      if (!resumeId) {
        throw new Error('Resume ID is required for export');
      }
      
      const response = await fetch(`/api/resumes/export/pdf/${resumeId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to export resume');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.personalInfo.fullName.replace(/\s+/g, '-').toLowerCase()}-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Exported!",
        description: "Resume exported as PDF",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          {isExporting ? (
            <>Exporting...</>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export as PDF
            </>
          )}
        </Button>
        <button
          onClick={() => setZoom(Math.max(50, zoom - 10))}
          className="p-1 rounded hover:bg-gray-100"
          title="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-sm text-gray-600">{zoom}%</span>
        <button
          onClick={() => setZoom(Math.min(150, zoom + 10))}
          className="p-1 rounded hover:bg-gray-100"
          title="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Preview Content */}
      <div 
        className="bg-white shadow-sm border rounded-lg overflow-hidden"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{data.personalInfo.fullName}</h1>
            <div className="text-gray-600 space-x-4">
              <span>{data.personalInfo.email}</span>
              <span>•</span>
              <span>{data.personalInfo.phone}</span>
              <span>•</span>
              <span>{data.personalInfo.location}</span>
            </div>
          </div>

          {/* Render sections in the exact order specified by data.sections */}
          {data.sections.map((sectionType) => (
            <ResumeSection key={sectionType} type={sectionType} data={data} styles={styles} />
          ))}
        </div>
      </div>
    </div>
  );
}
