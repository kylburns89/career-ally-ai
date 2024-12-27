import { useState } from "react";
import { toast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import type { SkillGap, LearningResource, LearningPathModel } from "../../types/learning";
import { useLearningPaths } from "../../hooks/use-learning-paths";

type Priority = 'high' | 'medium' | 'low';

const formatDate = (date: string | Date | undefined) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export default function LearningPath(): JSX.Element {
  const { learningPaths, loading: pathsLoading, generateLearningPath, deleteLearningPath, togglePathCompletion } = useLearningPaths();
  const [generating, setGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [currentPath, setCurrentPath] = useState<LearningPathModel | null>(null);
  const [mode, setMode] = useState<'create' | 'view'>('create');

  const [newSkill, setNewSkill] = useState<SkillGap>({
    skill: '',
    description: '',
    priority: 'medium',
    currentLevel: '',
    targetLevel: ''
  });

  const addSkillGap = () => {
    if (!newSkill.skill || !newSkill.description) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    setSkillGaps([...skillGaps, newSkill]);
    setNewSkill({
      skill: '',
      description: '',
      priority: 'medium',
      currentLevel: '',
      targetLevel: ''
    });
    setIsDialogOpen(false);
  };

  const removeSkillGap = (index: number) => {
    setSkillGaps(skillGaps.filter((_, i) => i !== index));
  };

  const handleGeneratePath = async () => {
    if (skillGaps.length === 0) {
      toast({ title: "Please add at least one skill gap", variant: "destructive" });
      return;
    }

    try {
      setGenerating(true);
      const data = await generateLearningPath(skillGaps);
      if (data) {
        setCurrentPath(data);
        setSkillGaps([]); // Clear skill gaps after successful generation
        toast({ title: "Learning path generated and saved successfully" });
      }
    } catch (error) {
      console.error('Error generating learning path:', error);
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      } else {
        toast({ title: "Failed to generate learning path. Please try again.", variant: "destructive" });
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Learning Path</h1>
            <p className="text-muted-foreground">
              Personalized learning recommendations based on your career goals and current skill set.
            </p>
          </div>
          {pathsLoading && <Loader2 className="h-6 w-6 animate-spin" />}
        </div>
      </div>

      {/* Mode Switch */}
      <div className="flex justify-end space-x-4">
        <Button
          variant={mode === 'create' ? 'default' : 'outline'}
          onClick={() => {
            setMode('create');
            setCurrentPath(null);
          }}
        >
          Create New Path
        </Button>
        <Button
          variant={mode === 'view' ? 'default' : 'outline'}
          onClick={() => {
            setMode('view');
            setCurrentPath(null);
          }}
        >
          View Saved Paths
        </Button>
      </div>

      {/* Previous Learning Paths */}
      {learningPaths.length > 0 && mode === 'view' && !currentPath && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Learning Paths</h2>
          <div className="space-y-4">
            {learningPaths.map((path) => (
              <Card key={path.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{path.title}</h3>
                      {path.completed && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-sm rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{path.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {path.skillGaps.map((gap: SkillGap, index: number) => (
                        <div
                          key={index}
                          className={`px-2 py-1 rounded-md text-sm ${
                            gap.priority === 'high' ? 'bg-red-100 text-red-700' :
                            gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}
                        >
                          {gap.skill}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {formatDate(path.createdAt)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPath(path)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLearningPath(path.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {mode === 'create' && !currentPath && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Skill Gaps</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill Gap
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Skill Gap</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill">Skill</Label>
                    <Input
                      id="skill"
                      value={newSkill.skill}
                      onChange={(e) => setNewSkill({ ...newSkill, skill: e.target.value })}
                      placeholder="e.g., React.js, Python, Project Management"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSkill.description}
                      onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                      placeholder="Describe the skill gap and your learning objectives"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newSkill.priority}
                      onValueChange={(value: Priority) => setNewSkill({ ...newSkill, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentLevel">Current Level (Optional)</Label>
                    <Input
                      id="currentLevel"
                      value={newSkill.currentLevel}
                      onChange={(e) => setNewSkill({ ...newSkill, currentLevel: e.target.value })}
                      placeholder="e.g., Beginner, Intermediate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetLevel">Target Level (Optional)</Label>
                    <Input
                      id="targetLevel"
                      value={newSkill.targetLevel}
                      onChange={(e) => setNewSkill({ ...newSkill, targetLevel: e.target.value })}
                      placeholder="e.g., Advanced, Expert"
                    />
                  </div>
                  <Button onClick={addSkillGap} className="w-full">
                    Add Skill Gap
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {skillGaps.length > 0 ? (
            <div className="space-y-4">
              {skillGaps.map((gap, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-medium">{gap.skill}</h3>
                      <p className="text-muted-foreground">{gap.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className={`font-medium ${
                          gap.priority === 'high' ? 'text-red-500' :
                          gap.priority === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {gap.priority.charAt(0).toUpperCase() + gap.priority.slice(1)} Priority
                        </div>
                        {gap.currentLevel && <div>Current: {gap.currentLevel}</div>}
                        {gap.targetLevel && <div>Target: {gap.targetLevel}</div>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkillGap(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                No skill gaps added. Click the button above to add your first skill gap.
              </p>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleGeneratePath}
              disabled={generating || skillGaps.length === 0}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating
                </>
              ) : (
                'Generate Learning Path'
              )}
            </Button>
          </div>
        </div>
      )}

      {currentPath && (
        <div className="grid gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                {currentPath.title && <h2 className="text-2xl font-bold">{currentPath.title}</h2>}
                {currentPath.description && <p className="text-muted-foreground mt-1">{currentPath.description}</p>}
                {currentPath.createdAt && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Created on {formatDate(currentPath.createdAt)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={currentPath.completed ? "outline" : "default"}
                  onClick={() => togglePathCompletion(currentPath.id, !currentPath.completed)}
                >
                  {currentPath.completed ? "Mark as Incomplete" : "Mark as Complete"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPath(null);
                    setMode(mode === 'create' ? 'view' : 'create');
                  }}
                >
                  Back to {mode === 'create' ? 'Saved Paths' : 'Create Path'}
                </Button>
              </div>
            </div>
            {currentPath.completed && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md">
                This learning path has been completed! 🎉
              </div>
            )}
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Skill Gaps</h2>
            <div className="space-y-4">
              {currentPath.skillGaps.map((gap: SkillGap, index: number) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium">{gap.skill}</h3>
                  <p className="text-muted-foreground">{gap.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Priority:</div>
                    <div className={`text-sm ${
                      gap.priority === 'high' ? 'text-red-500' :
                      gap.priority === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {gap.priority.charAt(0).toUpperCase() + gap.priority.slice(1)}
                    </div>
                    {gap.currentLevel && (
                      <>
                        <div className="text-sm font-medium ml-4">Current Level:</div>
                        <div className="text-sm">{gap.currentLevel}</div>
                      </>
                    )}
                    {gap.targetLevel && (
                      <>
                        <div className="text-sm font-medium ml-4">Target Level:</div>
                        <div className="text-sm">{gap.targetLevel}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {currentPath.resources && currentPath.resources.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Learning Resources</h2>
              <div className="space-y-6">
                {currentPath.resources.map((resource: LearningResource, index: number) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-medium">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {resource.title}
                      </a>
                    </h3>
                    <p className="text-muted-foreground">{resource.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {resource.skills.map((skill: string, skillIndex: number) => (
                        <div
                          key={skillIndex}
                          className="px-2 py-1 bg-accent text-accent-foreground rounded-md text-sm"
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div>Type: {resource.type}</div>
                      <div>Duration: {resource.duration}</div>
                      {resource.difficulty && (
                        <div>Difficulty: {resource.difficulty}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
