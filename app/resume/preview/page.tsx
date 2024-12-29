import { Suspense } from "react";
import { PreviewContent } from "./preview-content";

export default function ResumePreviewPage() {
  return (
    <Suspense fallback={
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
