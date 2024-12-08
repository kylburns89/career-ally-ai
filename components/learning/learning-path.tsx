'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { SkillGap, LearningResource, TavilySearchResult } from '@/types/tavily';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useProfile } from '@/hooks/use-profile';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/types/database';

interface LearningPathData {
  id: string;
  user_id: string;
  title: string;
  description: string;
  skill_gaps: SkillGap[];
  created_at: string;
  updated_at: string;
}

export default function LearningPath() {
  const [learningPath, setLearningPath] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const { profile } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLearningPath() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found');
          return;
        }

        console.log('Fetching learning path for user:', user.id);
        const response = await fetch(`/api/learning-path?userId=${user.id}`);
        const data = await response.json();
        
        console.log('Fetch response:', data);
        if (data && data.length > 0) {
          setLearningPath(data[0]);
        }
      } catch (error) {
        console.error('Error fetching learning path:', error);
        toast({
          title: "Error",
          description: "Failed to fetch learning path. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLearningPath();
  }, [supabase, toast]);

  const generateLearningPath = async () => {
    try {
      console.log('Starting learning path generation');
      setGenerating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found during generation');
        return;
      }

      console.log('User found:', user.id);
      console.log('Profile:', profile);
      
      if (!profile?.skills?.length) {
        console.log('No skills found in profile');
        return;
      }

      console.log('Skills found:', profile.skills);

      // Transform skills into the required format
      const skillInputs = profile.skills.map((skill: string) => ({
        name: skill,
        currentLevel: 1, // Default starting level
        targetLevel: 3  // Default target level
      }));

      console.log('Making POST request with skills:', skillInputs);

      const response = await fetch('/api/learning-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          skills: skillInputs
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to generate learning path');
      }

      setLearningPath(responseData);
      
      toast({
        title: "Success",
        description: "Learning path generated successfully!",
      });
    } catch (error) {
      console.error('Error generating learning path:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate learning path. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const updateResourceProgress = async (
    skillGapIndex: number,
    resourceIndex: number,
    completed: boolean
  ) => {
    if (!learningPath) return;

    const updatedPath = { ...learningPath };
    const resource = updatedPath.skill_gaps[skillGapIndex].resources[resourceIndex];
    resource.completed = completed;
    resource.progress = completed ? 100 : 0;

    setLearningPath(updatedPath);

    try {
      await supabase
        .from('learning_paths')
        .update({ 
          skill_gaps: JSON.stringify(updatedPath.skill_gaps),
          updated_at: new Date().toISOString()
        })
        .eq('id', learningPath.id);
        
      toast({
        title: "Success",
        description: "Progress updated successfully!",
      });
    } catch (error) {
      console.error('Error updating resource progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading learning path...</div>;
  }

  if (!learningPath) {
    const hasSkills = profile?.skills && profile.skills.length > 0;
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h3 className="text-lg font-semibold">No learning path found</h3>
        {hasSkills ? (
          <>
            <p className="text-gray-500">Generate a personalized learning path based on your skills</p>
            <Button 
              onClick={generateLearningPath}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Learning Path'}
            </Button>
          </>
        ) : (
          <p className="text-gray-500">Complete your profile with skills to generate a personalized learning path</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{learningPath.title}</h2>
          <p className="text-gray-500">{learningPath.description}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Path
        </Button>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {learningPath.skill_gaps.map((skillGap, skillIndex) => (
          <AccordionItem key={skillGap.skill} value={skillGap.skill}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold">{skillGap.skill}</h3>
                  <Badge variant="secondary">
                    Level {skillGap.currentLevel} → {skillGap.targetLevel}
                  </Badge>
                </div>
                <Progress 
                  value={
                    (skillGap.resources.filter((r: LearningResource) => r.completed).length / 
                    skillGap.resources.length) * 100
                  }
                  className="w-[100px]"
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <h4 className="font-semibold">Learning Resources</h4>
                  {skillGap.resources.map((resource: LearningResource, resourceIndex: number) => (
                    <Card key={resource.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{resource.title}</h5>
                          <p className="text-sm text-gray-500">{resource.provider}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Progress value={resource.progress} className="w-[100px]" />
                          <Button
                            variant={resource.completed ? "secondary" : "default"}
                            onClick={() => updateResourceProgress(
                              skillIndex,
                              resourceIndex,
                              !resource.completed
                            )}
                          >
                            {resource.completed ? "Completed" : "Mark Complete"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            Start Learning
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-4">
                  <h4 className="font-semibold">Recommended Certifications</h4>
                  {skillGap.certifications.map((cert: TavilySearchResult) => (
                    <Card key={cert.url} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{cert.title}</h5>
                          <p className="text-sm text-gray-500">{cert.source}</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => window.open(cert.url, '_blank')}
                        >
                          Learn More
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
