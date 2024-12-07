"use client";

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
  template: string | null;
}

// Helper function to convert description text into bullet points
function formatDescription(description: string): string {
  // Split by newlines and handle both • and - as bullet points
  const lines = description.split('\n').map(line => {
    line = line.trim();
    // If line starts with • or -, keep it as is
    if (line.startsWith('•') || line.startsWith('-')) {
      return `<li>${line.substring(1).trim()}</li>`;
    }
    // If line is not empty and doesn't start with a bullet, add one
    else if (line) {
      return `<li>${line}</li>`;
    }
    return '';
  });
  
  return lines.filter(line => line).join('');
}

const ProfessionalTemplate = ({ data }: { data: ResumeData }) => (
  <div className="max-w-[800px] mx-auto p-8 bg-white shadow-lg">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{data.personalInfo.fullName}</h1>
      <div className="text-gray-600 space-x-4">
        <span>{data.personalInfo.email}</span>
        <span>•</span>
        <span>{data.personalInfo.phone}</span>
        <span>•</span>
        <span>{data.personalInfo.location}</span>
      </div>
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-4">Experience</h2>
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

    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-4">Education</h2>
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

    <div>
      <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-4">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {data.skills.map((skill, index) => (
          <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
            {skill}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const CreativeTemplate = ({ data }: { data: ResumeData }) => (
  <div className="max-w-[800px] mx-auto p-8 bg-white shadow-lg">
    <div className="bg-purple-600 text-white p-8 -mx-8 -mt-8 mb-8">
      <h1 className="text-4xl font-bold mb-4">{data.personalInfo.fullName}</h1>
      <div className="flex flex-wrap gap-4 text-purple-100">
        <span>{data.personalInfo.email}</span>
        <span>{data.personalInfo.phone}</span>
        <span>{data.personalInfo.location}</span>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2">
        <h2 className="text-2xl font-bold text-purple-600 mb-6">Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-6">
            <h3 className="font-bold text-lg">{exp.title}</h3>
            <div className="text-purple-600 font-medium">{exp.company}</div>
            <div className="text-gray-600 text-sm mb-2">{exp.duration}</div>
            <ul className="list-disc ml-4 text-gray-700 space-y-1"
                dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }}>
            </ul>
          </div>
        ))}

        <h2 className="text-2xl font-bold text-purple-600 mt-8 mb-6">Education</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-4">
            <h3 className="font-bold text-lg">{edu.degree}</h3>
            <div className="text-purple-600">{edu.school}</div>
            <div className="text-gray-600 text-sm">{edu.year}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-purple-600 mb-6">Skills</h2>
        <div className="flex flex-col gap-2">
          {data.skills.map((skill, index) => (
            <span key={index} className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-center">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TechnicalTemplate = ({ data }: { data: ResumeData }) => (
  <div className="max-w-[800px] mx-auto p-8 bg-white shadow-lg font-mono">
    <div className="border-l-4 border-blue-500 pl-4 mb-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{data.personalInfo.fullName}</h1>
      <div className="text-sm text-gray-600 space-y-1">
        <div>📧 {data.personalInfo.email}</div>
        <div>📱 {data.personalInfo.phone}</div>
        <div>📍 {data.personalInfo.location}</div>
      </div>
    </div>

    <div className="mb-8">
      <h2 className="text-lg font-bold text-blue-500 mb-4">{'<Experience />'}</h2>
      {data.experience.map((exp, index) => (
        <div key={index} className="mb-6 border-l-2 border-gray-200 pl-4">
          <div className="font-bold">{exp.title}</div>
          <div className="text-blue-500">{exp.company}</div>
          <div className="text-sm text-gray-600 mb-2">{exp.duration}</div>
          <ul className="list-disc ml-4 text-gray-700 space-y-1"
              dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }}>
          </ul>
        </div>
      ))}
    </div>

    <div className="mb-8">
      <h2 className="text-lg font-bold text-blue-500 mb-4">{'<Education />'}</h2>
      {data.education.map((edu, index) => (
        <div key={index} className="mb-4 border-l-2 border-gray-200 pl-4">
          <div className="font-bold">{edu.degree}</div>
          <div className="text-blue-500">{edu.school}</div>
          <div className="text-sm text-gray-600">{edu.year}</div>
        </div>
      ))}
    </div>

    <div>
      <h2 className="text-lg font-bold text-blue-500 mb-4">{'<Skills />'}</h2>
      <div className="flex flex-wrap gap-2">
        {data.skills.map((skill, index) => (
          <span key={index} className="bg-gray-100 border border-gray-300 text-gray-800 px-3 py-1 rounded font-medium">
            {skill}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const ModernTemplate = ({ data }: { data: ResumeData }) => (
  <div className="max-w-[800px] mx-auto p-8 bg-white shadow-lg">
    <div className="border-b-4 border-emerald-500 pb-6 mb-8">
      <h1 className="text-4xl font-light text-gray-800 mb-4">{data.personalInfo.fullName}</h1>
      <div className="flex flex-wrap gap-4 text-emerald-600">
        <span>{data.personalInfo.email}</span>
        <span>{data.personalInfo.phone}</span>
        <span>{data.personalInfo.location}</span>
      </div>
    </div>

    <div className="grid gap-8">
      <div>
        <h2 className="text-2xl font-light text-emerald-600 mb-6">Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="text-xl font-medium">{exp.title}</h3>
              <span className="text-gray-600">{exp.duration}</span>
            </div>
            <div className="text-emerald-600 mb-2">{exp.company}</div>
            <ul className="list-disc ml-4 text-gray-700 space-y-1 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }}>
            </ul>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-light text-emerald-600 mb-6">Education</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-xl font-medium">{edu.degree}</h3>
              <span className="text-gray-600">{edu.year}</span>
            </div>
            <div className="text-emerald-600">{edu.school}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-light text-emerald-600 mb-6">Skills</h2>
        <div className="flex flex-wrap gap-3">
          {data.skills.map((skill, index) => (
            <span key={index} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-md">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ExecutiveTemplate = ({ data }: { data: ResumeData }) => (
  <div className="max-w-[800px] mx-auto p-8 bg-white shadow-lg">
    <div className="text-center border-double border-b-4 border-gray-800 pb-8 mb-8">
      <h1 className="text-4xl font-serif text-gray-900 mb-4">{data.personalInfo.fullName}</h1>
      <div className="flex justify-center gap-6 text-gray-700">
        <span>{data.personalInfo.email}</span>
        <span>{data.personalInfo.phone}</span>
        <span>{data.personalInfo.location}</span>
      </div>
    </div>

    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-serif text-gray-900 mb-6 text-center">Professional Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-8">
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="text-xl font-medium">{exp.title}</h3>
              <span className="text-gray-600 font-serif">{exp.duration}</span>
            </div>
            <div className="text-gray-800 font-serif mb-2">{exp.company}</div>
            <ul className="list-disc ml-4 text-gray-700 space-y-1 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }}>
            </ul>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-serif text-gray-900 mb-6 text-center">Education</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-4 text-center">
            <h3 className="text-xl font-medium">{edu.degree}</h3>
            <div className="text-gray-800 font-serif">{edu.school}</div>
            <div className="text-gray-600">{edu.year}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-serif text-gray-900 mb-6 text-center">Areas of Expertise</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {data.skills.map((skill, index) => (
            <span key={index} className="bg-gray-100 text-gray-800 px-6 py-2 font-serif">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MinimalTemplate = ({ data }: { data: ResumeData }) => (
  <div className="max-w-[800px] mx-auto p-8 bg-white shadow-lg">
    <div className="mb-12">
      <h1 className="text-3xl font-light text-gray-900 mb-4">{data.personalInfo.fullName}</h1>
      <div className="text-gray-600 space-y-1 text-sm">
        <div>{data.personalInfo.email}</div>
        <div>{data.personalInfo.phone}</div>
        <div>{data.personalInfo.location}</div>
      </div>
    </div>

    <div className="space-y-12">
      <div>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-6">Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-8">
            <div className="grid grid-cols-[1fr,auto] gap-4 mb-2">
              <h3 className="font-medium">{exp.title}</h3>
              <span className="text-gray-500 text-sm">{exp.duration}</span>
            </div>
            <div className="text-gray-600 mb-2 text-sm">{exp.company}</div>
            <ul className="list-disc ml-4 text-gray-700 space-y-1 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }}>
            </ul>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-6">Education</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-4">
            <div className="grid grid-cols-[1fr,auto] gap-4">
              <h3 className="font-medium">{edu.degree}</h3>
              <span className="text-gray-500 text-sm">{edu.year}</span>
            </div>
            <div className="text-gray-600 text-sm">{edu.school}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-6">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <span key={index} className="text-sm text-gray-700">
              {skill}{index < data.skills.length - 1 ? " •" : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function ResumePreview({ data }: { data: ResumeData }) {
  if (!data) return null;

  switch (data.template) {
    case 'professional':
      return <ProfessionalTemplate data={data} />;
    case 'creative':
      return <CreativeTemplate data={data} />;
    case 'technical':
      return <TechnicalTemplate data={data} />;
    case 'modern':
      return <ModernTemplate data={data} />;
    case 'executive':
      return <ExecutiveTemplate data={data} />;
    case 'minimal':
      return <MinimalTemplate data={data} />;
    default:
      return <ProfessionalTemplate data={data} />;
  }
}
