interface TemplateStyle {
  container: string;
  header: string;
  section: {
    container: string;
    title: string;
    content: string;
  };
  skills: {
    container: string;
    item: string;
  };
  experience: {
    item: string;
    title: string;
    company: string;
    duration: string;
    description: string;
  };
  education: {
    item: string;
    degree: string;
    school: string;
    year: string;
  };
  projects: {
    item: string;
    title: string;
    technologies: string;
    link: string;
    description: string;
  };
  certifications: {
    item: string;
    title: string;
    issuer: string;
    date: string;
    link: string;
  };
}

const baseStyles: TemplateStyle = {
  container: "p-6",
  header: "text-center mb-6",
  section: {
    container: "mb-6",
    title: "text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-3",
    content: "text-gray-700"
  },
  skills: {
    container: "flex flex-wrap gap-2",
    item: "bg-gray-100 text-gray-800 px-3 py-1 rounded-full"
  },
  experience: {
    item: "mb-4",
    title: "font-semibold text-gray-800",
    company: "text-gray-600",
    duration: "text-gray-600",
    description: "list-disc ml-4 mt-2 text-gray-700 space-y-1"
  },
  education: {
    item: "mb-4",
    degree: "font-semibold text-gray-800",
    school: "text-gray-600",
    year: "text-gray-600"
  },
  projects: {
    item: "mb-4",
    title: "font-semibold text-gray-800",
    technologies: "text-gray-600",
    link: "text-blue-600 hover:underline",
    description: "list-disc ml-4 mt-2 text-gray-700 space-y-1"
  },
  certifications: {
    item: "mb-4",
    title: "font-semibold text-gray-800",
    issuer: "text-gray-600",
    date: "text-gray-600",
    link: "text-blue-600 hover:underline text-sm"
  }
};

export const templateStyles: { [key: string]: TemplateStyle } = {
  professional: {
    ...baseStyles,
    container: "p-8 max-w-4xl mx-auto",
    header: "text-center mb-8",
    section: {
      ...baseStyles.section,
      title: "text-xl font-bold text-gray-800 border-b-2 border-blue-500 mb-4 pb-1"
    },
    skills: {
      container: "flex flex-wrap gap-2",
      item: "bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium"
    }
  },
  minimal: {
    ...baseStyles,
    container: "p-6 max-w-3xl mx-auto",
    header: "mb-6",
    section: {
      ...baseStyles.section,
      title: "text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wider"
    },
    skills: {
      container: "flex flex-wrap gap-3",
      item: "text-gray-700 border border-gray-200 px-3 py-1 rounded text-sm"
    }
  },
  technical: {
    ...baseStyles,
    container: "p-8 max-w-4xl mx-auto",
    section: {
      ...baseStyles.section,
      title: "text-xl font-bold text-gray-800 border-b-2 border-emerald-500 mb-4 pb-1"
    },
    skills: {
      container: "grid grid-cols-2 gap-2",
      item: "bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-sm font-medium"
    },
    projects: {
      ...baseStyles.projects,
      technologies: "text-emerald-600 text-sm font-medium"
    }
  },
  executive: {
    ...baseStyles,
    container: "p-8 max-w-4xl mx-auto bg-gray-50",
    header: "text-center mb-8 border-b-4 border-gray-800 pb-4",
    section: {
      ...baseStyles.section,
      title: "text-xl font-bold text-gray-900 border-b-2 border-gray-800 mb-4 pb-2 uppercase"
    },
    skills: {
      container: "grid grid-cols-2 gap-3",
      item: "bg-gray-800 text-white px-3 py-1.5 rounded text-sm font-medium text-center"
    },
    experience: {
      ...baseStyles.experience,
      title: "font-bold text-gray-900 text-lg",
      company: "text-gray-700 font-medium",
      duration: "text-gray-600 italic"
    }
  },
  creative: {
    ...baseStyles,
    container: "p-8 max-w-4xl mx-auto",
    header: "text-center mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg",
    section: {
      ...baseStyles.section,
      title: "text-xl font-bold text-gray-800 border-b-2 border-purple-500 mb-4 pb-1"
    },
    skills: {
      container: "flex flex-wrap gap-2",
      item: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium"
    },
    projects: {
      ...baseStyles.projects,
      title: "font-bold text-purple-700",
      technologies: "text-pink-600 text-sm font-medium"
    }
  },
  academic: {
    ...baseStyles,
    container: "p-8 max-w-4xl mx-auto",
    header: "text-center mb-8 font-serif",
    section: {
      ...baseStyles.section,
      title: "text-xl font-bold text-gray-900 border-b-2 border-red-800 mb-4 pb-1 font-serif"
    },
    skills: {
      container: "flex flex-wrap gap-3",
      item: "bg-red-50 text-red-800 px-3 py-1 rounded text-sm font-serif"
    },
    experience: {
      ...baseStyles.experience,
      title: "font-bold text-gray-900 font-serif",
      company: "text-gray-700 italic",
      description: "list-disc ml-4 mt-2 text-gray-700 space-y-1 font-serif"
    },
    education: {
      ...baseStyles.education,
      degree: "font-bold text-gray-900 font-serif text-lg",
      school: "text-gray-700 italic",
      year: "text-gray-600"
    }
  }
};

export type { TemplateStyle };