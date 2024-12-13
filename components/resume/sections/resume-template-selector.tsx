import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/types/resume";
import { ResumeTemplateSelectorProps } from "./section-types";

export function ResumeTemplateSelector({
  selectedTemplate,
  onTemplateSelect,
}: ResumeTemplateSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Template</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <Button
            key={template}
            variant={selectedTemplate === template ? "default" : "outline"}
            className="h-auto py-4 px-6"
            onClick={() => onTemplateSelect(template)}
          >
            <div className="text-center">
              <div className="capitalize">{template}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
