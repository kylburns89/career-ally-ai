import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
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
import { ResumeFormData, ProjectFormData } from "@/types/resume";
import { ResumeProjectsProps } from "./section-types";

export function ResumeProjects({ form, onAdd, onRemove }: ResumeProjectsProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>
      {form.getValues("projects")?.map((_: ProjectFormData, index: number) => (
        <div key={index} className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Project {index + 1}</h4>
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
              name={`projects.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E-commerce Platform" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`projects.${index}.technologies`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies Used</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="React, Node.js, MongoDB" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`projects.${index}.url`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://github.com/username/project" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name={`projects.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="• Developed a full-stack e-commerce platform using React and Node.js
• Implemented secure payment processing with Stripe integration
• Reduced page load time by 40% through optimization techniques"
                    className="min-h-[150px]"
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground mt-1">
                  Start each bullet point with • or - on a new line. Use bullet points to highlight key features and achievements.
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
