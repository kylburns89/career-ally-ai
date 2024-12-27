"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const { profile, isLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string>("");
  const [formData, setFormData] = useState<{
    headline: string;
    summary: string;
    location: string;
    experience: any[];
    education: any[];
    certifications: any[];
  }>({
    headline: "",
    summary: "",
    location: "",
    experience: [],
    education: [],
    certifications: []
  });

  useEffect(() => {
    if (profile) {
      setSkills(profile.skills.join(", "));
      setFormData({
        headline: profile.headline || "",
        summary: profile.summary || "",
        location: profile.location || "",
        experience: profile.experience || [],
        education: profile.education || [],
        certifications: profile.certifications || []
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        ...formData,
        skills: skills.split(",").map(skill => skill.trim()).filter(Boolean)
      });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-pulse">Loading profile...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Professional Profile</CardTitle>
          <CardDescription>
            Complete your profile to get personalized job recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="headline" className="text-sm font-medium">
                Professional Headline
              </label>
              <Input
                id="headline"
                name="headline"
                value={formData.headline || ""}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="summary" className="text-sm font-medium">
                Professional Summary
              </label>
              <Textarea
                id="summary"
                name="summary"
                value={formData.summary || ""}
                onChange={handleChange}
                placeholder="Brief overview of your professional background"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="skills" className="text-sm font-medium">
                Skills
              </label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js (comma-separated)"
              />
            </div>

            <Button type="submit" className="w-full">
              {profile ? "Update Profile" : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
