"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, FileText, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useResumes } from "@/hooks/use-resumes"

interface FormData {
  jobTitle: string
  companyName: string
  jobDescription: string
  keySkills: string
}

export function CoverLetterGenerator() {
  const [formData, setFormData] = useState<FormData>({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    keySkills: "",
  })
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const { toast } = useToast()
  const { resumes, isLoading: isLoadingResumes, isUploading, uploadResume, deleteResume } = useResumes()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Provide feedback on content length for job description
    if (name === 'jobDescription' && value.length > 8000) {
      toast({
        title: "Content Length Notice",
        description: "While we support longer content, consider focusing on the most relevant requirements for better results.",
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('text/plain')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or TXT file",
        variant: "destructive",
      })
      return
    }

    // Validate file size
    const maxSize = file.type.includes('pdf') ? 4 * 1024 * 1024 : 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `Maximum file size is ${maxSize / 1024 / 1024}MB`,
        variant: "destructive",
      })
      return
    }

    const resume = await uploadResume(file, file.name)
    if (resume) {
      setSelectedResumeId(resume.id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedResumeId) {
      toast({
        title: "Resume Required",
        description: "Please select or upload a resume to generate a cover letter.",
        variant: "destructive",
      })
      return
    }

    // Validate content length
    if (formData.jobDescription.length > 20000) {
      toast({
        title: "Content Too Long",
        description: "While we support longer content, this job description is excessive. Please focus on the key requirements.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const selectedResume = resumes.find(r => r.id === selectedResumeId)
      if (!selectedResume) throw new Error("Selected resume not found")

      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          companyName: formData.companyName,
          jobDescription: formData.jobDescription,
          keySkills: formData.keySkills,
          resumeUrl: selectedResume.file_url
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        if (response.status === 429 || errorData.type === "token_limit") {
          toast({
            title: "Content Too Large",
            description: errorData.error || "While we support larger content, this request exceeds our limits. Please reduce your inputs.",
            variant: "destructive",
          })
          return
        }
        
        throw new Error(errorData.error || "Failed to generate cover letter")
      }

      const data = await response.json()
      setGeneratedLetter(data.coverLetter)
      
      toast({
        title: "Success",
        description: "Cover letter generated successfully!",
      })
    } catch (error: any) {
      console.error("Error generating cover letter:", error)
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteResume = async (id: string) => {
    await deleteResume(id)
    if (selectedResumeId === id) {
      setSelectedResumeId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              placeholder="e.g. Senior Software Engineer"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="e.g. Tech Corp Inc."
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">
              Job Description
              <span className="text-sm text-muted-foreground ml-2">
                (Include full description - we'll process it intelligently)
              </span>
            </Label>
            <Textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              placeholder="Paste the job description here..."
              className="min-h-[200px]"
              required
              maxLength={20000}
            />
            <div className="text-sm text-muted-foreground">
              {formData.jobDescription.length}/20000 characters
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keySkills">
              Key Skills for the Role
              <span className="text-sm text-muted-foreground ml-2">
                (Comma-separated list)
              </span>
            </Label>
            <Textarea
              id="keySkills"
              name="keySkills"
              value={formData.keySkills}
              onChange={handleInputChange}
              placeholder="e.g. React, TypeScript, Node.js, AWS, Team Leadership..."
              className="min-h-[100px]"
              required
              maxLength={1000}
            />
            <div className="text-sm text-muted-foreground">
              {formData.keySkills.length}/1000 characters
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Resume</Label>
              {isLoadingResumes ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading resumes...</span>
                </div>
              ) : resumes.length > 0 ? (
                <Select value={selectedResumeId || ''} onValueChange={setSelectedResumeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>{resume.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteResume(resume.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Upload New Resume</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('resume')?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Resume
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF (up to 4MB), TXT (up to 1MB)
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isUploading || !selectedResumeId}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Cover Letter"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Generated Cover Letter</h2>
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          {generatedLetter ? (
            <div className="whitespace-pre-wrap">{generatedLetter}</div>
          ) : (
            <div className="text-muted-foreground">
              Your generated cover letter will appear here...
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
}
