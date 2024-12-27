import { useState } from "react";
import { format } from "date-fns";
import { Check, Edit2, Trash2, X } from "lucide-react";
import { toast } from "../../components/ui/use-toast";
import type { SavedResume } from "../../types/resume";

interface ResumeListProps {
  resumes: SavedResume[];
  activeResume?: SavedResume;
  onSelect: (resume: SavedResume) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function ResumeList({
  resumes,
  activeResume,
  onSelect,
  onDelete,
  onRename,
}: ResumeListProps) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  const handleStartEditName = (resumeId: string, currentName: string) => {
    setEditingName(resumeId);
    setTempName(currentName || "");
  };

  const handleSaveName = async (resumeId: string) => {
    if (!tempName.trim()) {
      toast({ title: "Resume name cannot be empty", variant: "destructive" });
      return;
    }
    await onRename(resumeId, tempName);
    setEditingName(null);
  };

  const handleCancelEditName = () => {
    setEditingName(null);
    setTempName("");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {resumes.map((resume) => (
        <div key={resume.id} className="relative pt-3 pr-3">
          <div
            onClick={() => onSelect(resume)}
            className={"p-4 rounded-lg border-2 transition-all hover:border-primary cursor-pointer " + 
              (activeResume?.id === resume.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border')}
          >
            {editingName === resume.id ? (
              <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded bg-background text-foreground"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => resume.id ? handleSaveName(resume.id) : null}
                    className="flex-1 p-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    <Check className="h-3 w-3 mx-auto" />
                  </button>
                  <button
                    onClick={handleCancelEditName}
                    className="flex-1 p-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
                  >
                    <X className="h-3 w-3 mx-auto" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between group">
                  <h3 className="font-medium truncate flex-1 text-foreground">
                    {resume.name || 'Untitled Resume'}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditName(resume.id || "", resume.name || "");
                    }}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors relative group-hover:opacity-100 opacity-70"
                    title="Edit Resume Name"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Edit Name
                    </span>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {resume.updatedAt ? format(new Date(resume.updatedAt), 'MM/dd/yyyy') : 'No date'}
                </p>
              </>
            )}
          </div>
          <button
            onClick={() => onDelete(resume.id || "")}
            className="absolute top-0 right-0 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 shadow-sm"
            title="Delete Resume"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
