import { CareerPathVisualizer } from "@/components/resources/career-path-visualizer";
import { PageContainer } from "@/components/page-container";

export default function CareerResourcesPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">Career Path Visualizer</h1>
          <p className="text-gray-500">
            Explore potential career paths and understand the skills and certifications needed for each role
          </p>
        </div>
        
        <CareerPathVisualizer />
      </div>
    </PageContainer>
  );
}
