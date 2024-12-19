'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  ChevronRight, 
  Clock, 
  Award, 
  BookOpen, 
  Briefcase,
  Sparkles
} from "lucide-react";
import { useToast } from '../../components/ui/use-toast';

interface CareerStep {
  title: string;
  timeline: string;
  required_skills: string[];
  certifications: string[];
  responsibilities: string[];
}

export function CareerPathVisualizer() {
  const [loading, setLoading] = useState(false);
  const [careerInput, setCareerInput] = useState('');
  const [careerPath, setCareerPath] = useState<CareerStep[]>([]);
  const [prismEnergy, setPrismEnergy] = useState(0);
  const [prismState, setPrismState] = useState<'idle' | 'processing' | 'responding'>('idle');
  const { toast } = useToast();

  // Simulate prism energy animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrismEnergy(prev => {
        const base = prismState === 'idle' ? 0.3 : 
                    prismState === 'processing' ? 0.9 : 0.5;
        return base + Math.sin(Date.now() * 0.003) * 0.2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [prismState]);

  const generateCareerPath = async (useProfile: boolean) => {
    try {
      setLoading(true);
      setPrismState('processing');
      
      if (!useProfile && !careerInput) {
        toast({
          title: "Please enter a career or job title",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/career-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useProfile,
          careerInput,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate career path');
      }

      const data = await response.json();
      setPrismState('responding');
      setCareerPath(data.career_steps);
    } catch (error) {
      toast({
        title: "Error generating career path",
        description: "Please try again later",
        variant: "destructive",
      });
      setPrismState('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 relative min-h-[600px]">
      {/* Interactive Prism */}
      <div className="relative w-64 h-64 mx-auto mb-12">
        <motion.div 
          className="absolute inset-0"
          style={{
            background: `conic-gradient(
              from 0deg,
              rgba(59, 130, 246, ${prismEnergy}),
              rgba(139, 92, 246, ${prismEnergy}),
              rgba(236, 72, 153, ${prismEnergy}),
              rgba(59, 130, 246, ${prismEnergy})
            )`,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            filter: 'blur(8px)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Prism Core */}
        <motion.div
          className="absolute inset-0 bg-black/90"
          style={{
            clipPath: 'polygon(50% 5%, 95% 50%, 50% 95%, 5% 50%)',
          }}
          animate={{
            scale: prismState === 'processing' ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: prismState === 'processing' ? Infinity : 0,
            ease: "easeInOut",
          }}
        />

        {/* Loading Animation */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="relative">
        <div className="flex gap-4">
          <Input
            placeholder="Enter a career or job title..."
            value={careerInput}
            onChange={(e) => setCareerInput(e.target.value)}
            className="flex-1"
            disabled={loading}
          />
          <Button
            onClick={() => generateCareerPath(false)}
            disabled={loading}
            className="relative overflow-hidden"
          >
            <span className="relative z-10">Generate Path</span>
            <motion.div
              className="absolute inset-0 bg-blue-600"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </Button>
        </div>
      </div>

      {/* Profile Option */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-500">or</span>
        <Button
          variant="outline"
          onClick={() => generateCareerPath(true)}
          disabled={loading}
          className="w-full mt-2"
        >
          Use My Profile Information
        </Button>
      </div>

      {/* Career Path Results */}
      <AnimatePresence>
        {careerPath.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-lg font-semibold">
                    {step.title}
                  </Badge>
                  <ChevronRight className="text-gray-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Estimated Timeline: {step.timeline}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <BookOpen className="w-4 h-4" />
                        <span>Required Skills:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {step.required_skills.map((skill, i) => (
                          <Badge key={i} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Award className="w-4 h-4" />
                        <span>Recommended Certifications:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {step.certifications.map((cert, i) => (
                          <Badge key={i} variant="outline" className="border-blue-200">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Briefcase className="w-4 h-4" />
                      <span>Key Responsibilities:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {step.responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
