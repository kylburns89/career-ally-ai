"use client"

import { useEffect, useState, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Database } from "@/types/database"
import { useResumes } from "@/hooks/use-resumes"
import { useCoverLetters } from "@/hooks/use-cover-letters"
import ResumePreview from "@/components/resume/resume-preview"
import { CoverLetterPreview } from "@/components/cover-letter/cover-letter-preview"

type ApplicationStatus = "applied" | "interviewing" | "offer" | "rejected"

type Application = Database["public"]["Tables"]["applications"]["Row"]

const statusColors = {
  applied: "bg-blue-500",
  interviewing: "bg-yellow-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
}

export function ApplicationTracker() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null)
  const [selectedResume, setSelectedResume] = useState<any>(null)
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<any>(null)
  const [showResumePreview, setShowResumePreview] = useState(false)
  const [showCoverLetterPreview, setShowCoverLetterPreview] = useState(false)
  const [newApplication, setNewApplication] = useState<{
    id?: string
    company: string
    job_title: string
    status: ApplicationStatus
    notes: string
    resume_id: string | null
    cover_letter_id: string | null
  }>({
    company: "",
    job_title: "",
    status: "applied",
    notes: "",
    resume_id: null,
    cover_letter_id: null,
  })

  const supabase = createClientComponentClient<Database>()
  const { resumes, isLoading: resumesLoading } = useResumes()
  const { coverLetters, isLoading: coverLettersLoading } = useCoverLetters()

  const fetchApplications = useCallback(async () => {
    const { data: applications, error } = await supabase
      .from("applications")
      .select("*, resumes(name), cover_letters(name)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching applications:", error)
      return
    }

    setApplications(applications)
  }, [supabase])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error("No session found:", sessionError)
      return
    }

    const application = {
      user_id: session.user.id,
      company: newApplication.company,
      job_title: newApplication.job_title,
      status: newApplication.status,
      applied_date: new Date().toISOString(),
      notes: newApplication.notes || null,
      resume_id: newApplication.resume_id === "none" ? null : newApplication.resume_id,
      cover_letter_id: newApplication.cover_letter_id === "none" ? null : newApplication.cover_letter_id,
    }

    let error;
    if (isEditMode && newApplication.id) {
      const { error: updateError } = await supabase
        .from("applications")
        .update(application)
        .eq("id", newApplication.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("applications")
        .insert([application])
      error = insertError
    }

    if (error) {
      console.error("Error saving application:", error)
      return
    }

    setIsOpen(false)
    setIsEditMode(false)
    setNewApplication({
      company: "",
      job_title: "",
      status: "applied",
      notes: "",
      resume_id: null,
      cover_letter_id: null,
    })
    fetchApplications()
  }

  const handleEdit = (application: Application) => {
    setNewApplication({
      id: application.id,
      company: application.company,
      job_title: application.job_title,
      status: application.status as ApplicationStatus,
      notes: application.notes || "",
      resume_id: application.resume_id,
      cover_letter_id: application.cover_letter_id,
    })
    setIsEditMode(true)
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    setApplicationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!applicationToDelete) return

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", applicationToDelete)

    if (error) {
      console.error("Error deleting application:", error)
      return
    }

    setDeleteDialogOpen(false)
    setApplicationToDelete(null)
    fetchApplications()
  }

  const handlePreviewResume = async (resumeId: string) => {
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .single()

    if (error) {
      console.error("Error fetching resume:", error)
      return
    }

    setSelectedResume(resume)
    setShowResumePreview(true)
  }

  const handlePreviewCoverLetter = async (coverLetterId: string) => {
    const { data: coverLetter, error } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("id", coverLetterId)
      .single()

    if (error) {
      console.error("Error fetching cover letter:", error)
      return
    }

    setSelectedCoverLetter(coverLetter)
    setShowCoverLetterPreview(true)
  }

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          setIsEditMode(false)
          setNewApplication({
            company: "",
            job_title: "",
            status: "applied",
            notes: "",
            resume_id: null,
            cover_letter_id: null,
          })
        }
      }}>
        <DialogTrigger asChild>
          <Button>Add Application</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Application" : "Add New Application"}</DialogTitle>
            <DialogDescription>
              Enter the details of your job application
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="company">Company</label>
              <Input
                id="company"
                value={newApplication.company}
                onChange={(e) =>
                  setNewApplication({ ...newApplication, company: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="position">Position</label>
              <Input
                id="position"
                value={newApplication.job_title}
                onChange={(e) =>
                  setNewApplication({ ...newApplication, job_title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="status">Status</label>
              <Select
                value={newApplication.status}
                onValueChange={(value: ApplicationStatus) =>
                  setNewApplication({ ...newApplication, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="resume">Resume</label>
              <Select
                value={newApplication.resume_id || "none"}
                onValueChange={(value) =>
                  setNewApplication({ ...newApplication, resume_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="coverLetter">Cover Letter</label>
              <Select
                value={newApplication.cover_letter_id || "none"}
                onValueChange={(value) =>
                  setNewApplication({ ...newApplication, cover_letter_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cover letter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {coverLetters.map((letter) => (
                    <SelectItem key={letter.id} value={letter.id}>
                      {letter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="notes">Notes</label>
              <Input
                id="notes"
                value={newApplication.notes}
                onChange={(e) =>
                  setNewApplication({ ...newApplication, notes: e.target.value })
                }
              />
            </div>
            <Button type="submit">{isEditMode ? "Save Changes" : "Add Application"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showResumePreview} onOpenChange={setShowResumePreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
          </DialogHeader>
          {selectedResume && (
            <div className="max-h-[80vh] overflow-y-auto">
              <ResumePreview data={selectedResume.content} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCoverLetterPreview} onOpenChange={setShowCoverLetterPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Cover Letter Preview</DialogTitle>
          </DialogHeader>
          {selectedCoverLetter && (
            <div className="max-h-[80vh] overflow-y-auto">
              <CoverLetterPreview 
                content={selectedCoverLetter.content} 
                template="professional"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Resume</TableHead>
              <TableHead>Cover Letter</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>{application.company}</TableCell>
                <TableCell>{application.job_title}</TableCell>
                <TableCell>
                  <Badge
                    className={`${
                      statusColors[application.status as ApplicationStatus]
                    } text-white`}
                  >
                    {application.status.charAt(0).toUpperCase() +
                      application.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(application.applied_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {application.resume_id && (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-500">
                        {(application as any).resumes?.name || 'Attached'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewResume(application.resume_id!)}
                      >
                        Preview
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {application.cover_letter_id && (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-500">
                        {(application as any).cover_letters?.name || 'Attached'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewCoverLetter(application.cover_letter_id!)}
                      >
                        Preview
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>{application.notes}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(application)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(application.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
