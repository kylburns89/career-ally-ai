"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import ResumePreview from "./resume-preview";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/loading";
import { resumeContentSchema } from "@/lib/validations";
import type { ResumeData, SavedResume } from "@/types/database";

interface ResumeBuilderProps {
  activeResume: string | null;
  setActiveResume: (resume: string) => void;
  selectedTemplate: string | null;
  onSave: () => Promise<void>;
}

export default function ResumeBuilder({ 
  activeResume, 
  setActiveResume, 
  selectedTemplate, 
  onSave 
}: ResumeBuilderProps): JSX.Element {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [resumeName, setResumeName] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeContentSchema),
    defaultValues: {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
      },
      experience: [{ title: "", company: "", duration: "", description: "" }],
      education: [{ degree: "", school: "", year: "" }],
      skills: [],
      template: selectedTemplate || "",
    },
  });

  // Memoize the watch callback to prevent infinite re-renders
  const updatePreviewData = useCallback(() => {
    const formData = form.getValues();
    setPreviewData({
      ...formData,
      skills,
      template: selectedTemplate || "",
    });
  }, [form, skills, selectedTemplate]);

  // Update preview data whenever form values change
  useEffect(() => {
    const subscription = form.watch(updatePreviewData);
    return () => subscription.unsubscribe();
  }, [form, updatePreviewData]);

  // Load existing resume data if available
  useEffect(() => {
    if (activeResume) {
      try {
        const parsedResume = JSON.parse(activeResume);
        const resumeData = parsedResume as SavedResume;
        form.reset({
          personalInfo: resumeData.content.personalInfo,
          experience: resumeData.content.experience,
          education: resumeData.content.education,
          skills: [],
          template: resumeData.content.template || "",
        });
        setSkills(resumeData.content.skills || []);
        setResumeName(resumeData.name || "");
      } catch (error) {
        console.error("Error parsing resume data:", error);
        toast({
          title: "Error",
          description: "Failed to load resume data",
          variant: "destructive",
        });
      }
    }
  }, [activeResume, form, toast]);

  // Update form when template changes
  useEffect(() => {
    form.setValue("template", selectedTemplate || "", { shouldValidate: true });
  }, [selectedTemplate, form]);

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

    // Include skills in the form data
    const completeFormData: ResumeData = {
      ...formData,
      skills,
      template: selectedTemplate,
    };

    const resumeData: SavedResume = {
      name: resumeName,
      content: completeFormData,
    };

    console.log("Submitting resume data:", JSON.stringify(resumeData, null, 2));
    setSaving(true);

    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });

      const responseData = await response.json();
      console.log("API response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || "Failed to save resume");
      }

      // Update active resume with the saved resume data from the response
      setActiveResume(JSON.stringify({
        id: responseData.id,
        name: responseData.name,
        content: responseData.content,
        created_at: responseData.created_at,
        updated_at: responseData.updated_at
      }));

      toast({
        title: "Success",
        description: "Resume saved successfully",
      });

      // Refresh the resumes list
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

  const addExperience = () => {
    const currentExperience = form.getValues("experience");
    form.setValue("experience", [
      ...currentExperience,
      { title: "", company: "", duration: "", description: "" },
    ]);
  };

  const removeExperience = (index: number) => {
    const currentExperience = form.getValues("experience");
    form.setValue(
      "experience",
      currentExperience.filter((_: unknown, i: number) => i !== index)
    );
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
    form.setValue(
      "education",
      currentEducation.filter((_: unknown, i: number) => i !== index)
    );
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="p-6">
              <FormItem>
                <FormLabel>Resume Name</FormLabel>
                <FormControl>
                  <Input
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    placeholder="Enter a name for your resume"
                    required
                  />
                </FormControl>
              </FormItem>
            </Card>

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
                        <Input {...field} />
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
                        <Input type="email" {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <Button type="button" variant="outline" onClick={addExperience}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
              {form.watch("experience").map((_, index) => (
                <div key={index} className="mb-6 relative">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => removeExperience(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name={`experience.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} placeholder="e.g., Jan 2020 - Present" />
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
                            placeholder="Describe your responsibilities and achievements..."
                          />
                        </FormControl>
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
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
              {form.watch("education").map((_, index) => (
                <div key={index} className="mb-6 relative">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} placeholder="e.g., 2020" />
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
              <div className="flex gap-2 mb-4">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
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
                  <div
                    key={index}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-secondary-foreground/50 hover:text-secondary-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Saving Resume...</span>
                </>
              ) : (
                "Save Resume"
              )}
            </Button>
          </form>
        </Form>
      </div>

      <div className="sticky top-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resume Preview</h3>
          <div className="border rounded-lg overflow-auto max-h-[800px]">
            {previewData && <ResumePreview data={previewData} />}
          </div>
        </Card>
      </div>
    </div>
  );
}
