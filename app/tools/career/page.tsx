import { CareerPathVisualizer } from "@/components/tools/career-path-visualizer";
import { PageContainer } from "@/components/page-container";

export default function CareerToolsPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">AI Career Path Visualizer</h1>
          <p className="text-gray-500">
            Get personalized career progression insights powered by AI. Enter a specific career path or use your profile information to visualize your potential journey.
          </p>
        </div>
        
        <CareerPathVisualizer />
      </div>
    </PageContainer>
  );
}
