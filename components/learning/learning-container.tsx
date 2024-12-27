'use client';

import { ErrorBoundary } from 'components/error-boundary';
import LearningPath from 'components/learning/learning-path';

export default function LearningContainer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Path</h1>
        <p className="text-gray-500">
          Track your progress and access personalized learning resources based on your skill gaps
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="space-y-2 mb-6">
          <h2 className="text-xl font-semibold">Your Learning Journey</h2>
          <p className="text-gray-500">
            We analyze your profile, applications, and industry trends to create a personalized
            learning path that helps you achieve your career goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-background rounded-lg border">
            <h3 className="font-medium mb-2">Skill Analysis</h3>
            <p className="text-sm text-gray-500">
              Identifies gaps between your current skills and industry demands
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <h3 className="font-medium mb-2">Curated Resources</h3>
            <p className="text-sm text-gray-500">
              Hand-picked learning materials from top educational platforms
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <h3 className="font-medium mb-2">Progress Tracking</h3>
            <p className="text-sm text-gray-500">
              Monitor your learning progress and skill development
            </p>
          </div>
        </div>

        <ErrorBoundary>
          <LearningPath />
        </ErrorBoundary>
      </div>
    </div>
  );
}
