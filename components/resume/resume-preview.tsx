import { useState } from "react";
import type { ResumeFormData } from "../../types/resume";
import { Minus, Plus } from "lucide-react";

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
function ResumeSection({ type, data }: { type: string; data: ResumeFormData }) {
  switch (type) {
    case 'summary':
      return data.summary ? (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-3">Summary</h2>
          <p className="text-gray-700">{data.summary}</p>
        </div>
      ) : null;

    case 'experience':
      return data.experience.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-3">Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{exp.title}</h3>
                  <div className="text-gray-600">{exp.company}</div>
                </div>
                <div className="text-gray-600">{exp.duration}</div>
              </div>
              <ul className="list-disc ml-4 mt-2 text-gray-700 space-y-1" 
                  dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }}>
              </ul>
            </div>
          ))}
        </div>
      ) : null;

    case 'education':
      return data.education.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-3">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                  <div className="text-gray-600">{edu.school}</div>
                </div>
                <div className="text-gray-600">{edu.year}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null;

    case 'skills':
      return data.skills.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null;

    case 'projects':
      return data.projects && data.projects.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-3">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{project.name}</h3>
                  <div className="text-gray-600">{formatTechnologies(project.technologies)}</div>
                </div>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Project
                  </a>
                )}
              </div>
              <ul className="list-disc ml-4 mt-2 text-gray-700 space-y-1"
                  dangerouslySetInnerHTML={{ __html: formatDescription(project.description) }}>
              </ul>
            </div>
          ))}
        </div>
      ) : null;

    case 'certifications':
      return data.certifications && data.certifications.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-3">Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{cert.name}</h3>
                  <div className="text-gray-600">{cert.issuer}</div>
                </div>
                <div className="text-gray-600">{cert.date}</div>
              </div>
              {cert.url && (
                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
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

export default function ResumePreview({ data }: { data: ResumeFormData }) {
  const [zoom, setZoom] = useState(100);
  
  if (!data || !data.sections) return null;

  return (
    <div className="space-y-4">
      {/* Zoom Controls */}
      <div className="flex items-center justify-end gap-2 pb-2 border-b">
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
        <div className="p-6">
          <div className="text-center mb-6">
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
            <ResumeSection key={sectionType} type={sectionType} data={data} />
          ))}
        </div>
      </div>
    </div>
  );
}
