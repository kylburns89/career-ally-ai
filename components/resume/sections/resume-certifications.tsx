import { Plus, Trash2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CertificationFormData } from "@/types/resume";
import { ResumeCertificationsProps } from "./section-types";

export function ResumeCertifications({ 
  form, 
  onAdd, 
  onRemove 
}: ResumeCertificationsProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Certifications</h3>
        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      </div>
      {form.getValues("certifications")?.map((_: CertificationFormData, index: number) => (
        <div key={index} className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Certification {index + 1}</h4>
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
              name={`certifications.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certification Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="AWS Certified Solutions Architect" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`certifications.${index}.issuer`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issuing Organization</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Amazon Web Services" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`certifications.${index}.date`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Earned</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="June 2023" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`certifications.${index}.url`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credential URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://www.credly.com/badges/..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </Card>
  );
}
