import { Plus, Trash2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExperienceFormData } from "@/types/resume";
import { ResumeExperienceProps } from "./section-types";

export function ResumeExperience({ 
  form, 
  onAdd, 
  onRemove 
}: ResumeExperienceProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Experience</h3>
        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </div>
      {form.getValues("experience")?.map((_: ExperienceFormData, index: number) => (
        <div key={index} className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Experience {index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`experience.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Senior Software Engineer" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`experience.${index}.company`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tech Company Inc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`experience.${index}.duration`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Jan 2020 - Present" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name={`experience.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="• Led a team of 5 developers in building a scalable microservices architecture
• Reduced system latency by 40% through performance optimization
• Implemented automated testing, achieving 90% code coverage"
                    className="min-h-[150px]"
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground mt-1">
                  Start each bullet point with • or - on a new line. Use bullet points to highlight key achievements and responsibilities.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </Card>
  );
}
