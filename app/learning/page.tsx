import { Metadata } from 'next';
import { PageContainer } from '@/components/page-container';
import LearningContainer from '@/components/learning/learning-container';

export const metadata: Metadata = {
  title: 'Learning Path - Kareerly',
  description: 'Track your progress and access personalized learning resources',
};

export default function LearningPage() {
  return (
    <PageContainer>
      <LearningContainer />
    </PageContainer>
  );
}
