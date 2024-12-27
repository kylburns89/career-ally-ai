import { useState, useEffect } from 'react';
import { toast } from "../components/ui/use-toast";
import type { SkillGap, LearningResource, LearningPathModel } from '../types/learning';

export function useLearningPaths() {
  const [learningPaths, setLearningPaths] = useState<LearningPathModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      const response = await fetch('/api/learning-path');
      if (!response.ok) throw new Error('Failed to fetch learning paths');
      const data = await response.json();
      setLearningPaths(data);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      toast({ title: "Failed to fetch learning paths", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPath = async (skillGaps: SkillGap[]): Promise<LearningPathModel | null> => {
    try {
      const response = await fetch('/api/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillGaps }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate learning path');
      }
      
      const data = await response.json();
      await fetchLearningPaths(); // Refresh the list
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate learning path');
    }
  };

  const deleteLearningPath = async (id: string) => {
    try {
      const response = await fetch(`/api/learning-path/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete learning path');
      
      setLearningPaths(paths => paths.filter(path => path.id !== id));
      toast({ title: "Learning path deleted" });
    } catch (error) {
      console.error('Error deleting learning path:', error);
      toast({ title: "Failed to delete learning path", variant: "destructive" });
    }
  };

  const togglePathCompletion = async (id: string, completed: boolean): Promise<LearningPathModel> => {
    try {
      const response = await fetch(`/api/learning-path/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) throw new Error('Failed to update learning path');
      
      const updatedPath = await response.json();
      setLearningPaths(paths => 
        paths.map(path => path.id === id ? updatedPath : path)
      );
      toast({ title: `Learning path marked as ${completed ? 'completed' : 'incomplete'}` });
      return updatedPath;
    } catch (error) {
      console.error('Error updating learning path:', error);
      toast({ title: "Failed to update learning path", variant: "destructive" });
      throw error;
    }
  };

  return {
    learningPaths,
    loading,
    generateLearningPath,
    deleteLearningPath,
    togglePathCompletion,
    refresh: fetchLearningPaths,
  };
}
