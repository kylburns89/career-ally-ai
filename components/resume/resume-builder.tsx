"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Plus, Trash2, Download, Eye } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { ReactNode } from "react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/loading";

// Components
import ResumePreview from "./resume-preview";

// Types and Utils
import { resumeContentSchema } from "@/lib/validations";
import { ResumeData, SavedResume, Resume, dbToFormFormat, formToDbFormat } from "@/types/resume";

// Template previews
const TEMPLATES = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean and traditional layout suitable for most industries",
    preview: (
      <div className="aspect-video bg-background p-4 text-xs border rounded">
        <div className="border-b pb-2 mb-2 border-border">
          <div className="font-bold text-foreground">John Doe</div>
          <div className="text-muted-foreground">Professional Template</div>
        </div>
        <div className="space-y-1">
          <div className="bg-muted h-2 w-3/4"></div>
          <div className="bg-muted h-2 w-1/2"></div>
        </div>
      </div>
    ),
  },
  {
    id: "creative",
    name: "Creative",
    description: "Contemporary design with creative elements",
    preview: (
      <div className="aspect-video bg-purple-600 dark:bg-purple-900 p-4 text-xs text-white rounded">
        <div className="mb-2">
          <div className="font-bold">John Doe</div>
          <div className="text-purple-200">Creative Template</div>
        </div>
        <div className="space-y-1">
          <div className="bg-purple-500/50 h-2 w-3/4"></div>
          <div className="bg-purple-500/50 h-2 w-1/2"></div>
        </div>
      </div>
    ),
  },
  {
    id: "technical",
    name: "Technical",
    description: "Focused on technical skills and projects",
    preview: (
      <div className="aspect-video bg-background p-4 text-xs font-mono border rounded">
        <div className="border-l-2 border-blue-500 pl-2 mb-2">
          <div className="font-bold text-foreground">{'<John Doe />'}</div>
          <div className="text-blue-600 dark:text-blue-400">Technical Template</div>
        </div>
        <div className="space-y-1">
          <div className="bg-muted h-2 w-3/4"></div>
          <div className="bg-muted h-2 w-1/2"></div>
        </div>
      </div>
    ),
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean and minimalist design with a modern touch",
    preview: (
      <div className="aspect-video bg-background p-4 text-xs border rounded">
        <div className="border-b-2 border-emerald-500 pb-2 mb-2">
          <div className="font-light text-lg text-foreground">John Doe</div>
          <div className="text-emerald-600 dark:text-emerald-400">Modern Template</div>
        </div>
        <div className="space-y-1">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 h-2 w-3/4"></div>
          <div className="bg-emerald-100 dark:bg-emerald-900/50 h-2 w-1/2"></div>
        </div>
      </div>
    ),
  },
  {
    id: "executive",
    name: "Executive",
    description: "Professional layout for senior positions",
    preview: (
      <div className="aspect-video bg-background p-4 text-xs border rounded">
        <div className="text-center border-double border-b-4 border-foreground pb-2 mb-2">
          <div className="font-serif text-lg text-foreground">John Doe</div>
          <div className="text-muted-foreground">Executive Template</div>
        </div>
        <div className="space-y-1">
          <div className="bg-muted h-2 w-3/4 mx-auto"></div>
          <div className="bg-muted h-2 w-1/2 mx-auto"></div>
        </div>
      </div>
    ),
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant design focusing on content",
    preview: (
      <div className="aspect-video bg-background p-4 text-xs border rounded">
        <div className="mb-4">
          <div className="text-lg font-light text-foreground">John Doe</div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Minimal Template</div>
        </div>
        <div className="space-y-1">
          <div className="bg-muted h-2 w-3/4"></div>
          <div className="bg-muted h-2 w-1/2"></div>
        </div>
      </div>
    ),
  },
] as const;

interface ResumeBuilderProps {
  activeResume: string | null;
  setActiveResume: (resume: string) => void;
  selectedTemplate: string | null;
  onSave: () => Promise<void>;
}

export function ResumeBuilder({
  activeResume,
  setActiveResume,
  selectedTemplate: initialTemplate,
  onSave,
}: ResumeBuilderProps): ReactNode {
  const [sections, setSections] = useState<string[]>([
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
  ]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [resumeName, setResumeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(initialTemplate);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeContentSchema),
    defaultValues: {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        website: "",
      },
      experience: [{ title: "", company: "", duration: "", description: "" }],
      education: [{ degree: "", school: "", year: "" }],
      skills: [],
      projects: [],
      certifications: [],
      template: selectedTemplate || "professional",
    },
  });

  const updatePreviewData = useCallback(() => {
    const formData = form.getValues();
    setPreviewData({
      ...formData,
      skills,
      sections,
      template: selectedTemplate || "professional",
    });
  }, [form, skills, sections, selectedTemplate]);

  useEffect(() => {
    const subscription = form.watch(() => {
      updatePreviewData();
    });
    return () => subscription.unsubscribe();
  }, [form, updatePreviewData]);

  useEffect(() => {
    if (activeResume) {
      try {
        const parsedResume = JSON.parse(activeResume) as Resume;
        setActiveResumeId(parsedResume.id);
        const formData = dbToFormFormat(parsedResume.content);
        form.reset(formData);
        setSkills(formData.skills);
        setResumeName(parsedResume.name);
        setSections(formData.sections || sections);
        setSelectedTemplate(formData.template || null);
        setShowForm(true);
      } catch (error) {
        console.error("Error parsing resume data:", error);
        toast({
          title: "Error",
          description: "Failed to load resume data",
          variant: "destructive",
        });
      }
    }
  }, [activeResume, form, toast, sections]);

  useEffect(() => {
    if (selectedTemplate) {
      form.setValue("template", selectedTemplate, { shouldValidate: true });
      setShowForm(true);
      updatePreviewData();
    }
  }, [selectedTemplate, form, updatePreviewData]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    form.setValue("template", templateId, { shouldValidate: true });
    setShowForm(true);
    updatePreviewData();
  };

  const handleExport = async () => {
    if (!activeResumeId) {
      toast({
        title: "Error",
        description: "Please save your resume first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/resumes/export/pdf/${activeResumeId}`);
      if (!response.ok) throw new Error("Failed to export resume as PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Resume exported as PDF",
      });
    } catch (error) {
      console.error("Error exporting resume:", error);
      toast({
        title: "Error",
        description: "Failed to export resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addExperience = () => {
    const currentExperience = form.getValues("experience");
    form.setValue("experience", [
      ...currentExperience,
      { title: "", company: "", duration: "", description: "" },
    ]);
  };

  const removeExperience = (index: number) => {
    const currentExperience = form.getValues("experience");
    form.setValue("experience", currentExperience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    const currentEducation = form.getValues("education");
    form.setValue("education", [
      ...currentEducation,
      { degree: "", school: "", year: "" },
    ]);
  };

  const removeEducation = (index: number) => {
    const currentEducation = form.getValues("education");
    form.setValue("education", currentEducation.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const onSubmit = async (formData: ResumeData) => {
    if (!resumeName) {
      toast({
        title: "Error",
        description: "Please enter a name for your resume",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template first",
        variant: "destructive",
      });
      return;
    }

    const completeFormData: ResumeData = {
      ...formData,
      skills,
      sections,
      template: selectedTemplate,
    };

    const dbData = formToDbFormat(completeFormData);

    const resumeData: SavedResume = {
      name: resumeName,
      content: dbData,
    };

    setSaving(true);

    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to save resume");
      }

      const responseData = await response.json();
      setActiveResumeId(responseData.id);
      setActiveResume(JSON.stringify(responseData));

      toast({
        title: "Success",
        description: "Resume saved successfully",
      });

      await onSave();
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save resume",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="p-6">
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Resume Name</FormLabel>
                    <FormControl>
                      <Input
                        value={resumeName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResumeName(e.target.value)}
                        placeholder="Enter a name for your resume"
                        required
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Template Selection</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? "border-primary ring-2 ring-primary ring-opacity-50"
                          : "hover:border-primary"
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="aspect-video relative overflow-hidden rounded-md mb-2">
                        {template.preview}
                      </div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {showForm && (
                <>
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="personalInfo.fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="John Doe" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personalInfo.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="john@example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personalInfo.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="(555) 123-4567" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personalInfo.location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City, State" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personalInfo.linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="linkedin.com/in/johndoe" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personalInfo.website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="www.johndoe.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Experience</h3>
                      <Button type="button" variant="outline" onClick={addExperience}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Experience
                      </Button>
                    </div>
                    {form.getValues("experience").map((_, index) => (
                      <div key={index} className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Experience {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeExperience(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`experience.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Software Engineer" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experience.${index}.company`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Company Name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experience.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Jan 2020 - Present" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`experience.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="• Led development of key features resulting in 40% user growth
• Implemented CI/CD pipeline reducing deployment time by 50%
• Mentored 3 junior developers and conducted code reviews"
                                  className="min-h-[150px]"
                                />
                              </FormControl>
                              <p className="text-sm text-muted-foreground mt-1">
                                Start each bullet point with • or - on a new line. Use bullet points to highlight key achievements and responsibilities.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </Card>

                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Education</h3>
                      <Button type="button" variant="outline" onClick={addEducation}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Education
                      </Button>
                    </div>
                    {form.getValues("education").map((_, index) => (
                      <div key={index} className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Education {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeEducation(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`education.${index}.degree`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Degree</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Bachelor of Science in Computer Science" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.school`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>School</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="University Name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.year`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="2020" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Skills</h3>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkill(e.target.value)}
                          placeholder="Add a skill"
                          onKeyPress={(e: React.KeyboardEvent) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                        />
                        <Button type="button" onClick={addSkill}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {skill}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => removeSkill(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    "Save Resume"
                  )}
                </Button>
                {activeResumeId && (
                  <>
                    <Link href={`/resume/preview?id=${activeResumeId}`}>
                      <Button type="button" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Full Preview
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleExport}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </div>

        <div className="sticky top-8">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Resume Preview</h3>
              {selectedTemplate && (
                <Badge variant="secondary" className="capitalize">
                  {selectedTemplate} Template
                </Badge>
              )}
            </div>
            <div className="border rounded-lg overflow-auto max-h-[800px] bg-white dark:bg-gray-900">
              {previewData && <ResumePreview data={previewData} />}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
