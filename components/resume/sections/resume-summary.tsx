import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ResumeSummaryProps } from "./section-types";

export function ResumeSummary({ form }: ResumeSummaryProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Professional Summary</h3>
      <FormField
        control={form.control}
        name="summary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Summary</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Write a brief summary highlighting your key qualifications, experience, and career objectives..."
                className="min-h-[150px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
}
