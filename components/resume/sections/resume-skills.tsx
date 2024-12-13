import { Plus, Trash2 } from "lucide-react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResumeSkillsProps } from "./section-types";

export function ResumeSkills({ 
  skills,
  onAdd,
  onRemove,
  newSkill,
  setNewSkill,
}: ResumeSkillsProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Skills</h3>
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          <FormItem className="flex-1">
            <FormLabel>Add Skill</FormLabel>
            <FormControl>
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="React.js"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <Button
            type="button"
            variant="outline"
            onClick={onAdd}
            className="mt-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {skill}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
