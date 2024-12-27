import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types/profile";

export { type Profile };

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("[USE_PROFILE]", error);
      toast({
        title: "Error",
        description: "Failed to fetch profile. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("[USE_PROFILE]", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return {
    profile,
    isLoading,
    getProfile,
    updateProfile,
  };
};
