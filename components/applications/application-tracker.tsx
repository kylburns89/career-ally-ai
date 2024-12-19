"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "../../lib/supabase/client"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Badge } from "../ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Database } from "../../types/database"
import { ApplicationFormState, ApplicationResponse } from "../../types/application"
import { useResumes } from "../../hooks/use-resumes"
import { useCoverLetters } from "../../hooks/use-cover-letters"
import { useContacts } from "../../hooks/use-contacts"
import ResumePreview from "../resume/resume-preview"
import { CoverLetterPreview } from "../cover-letter/cover-letter-preview"
import { ApplicationAnalyticsDashboard } from "./application-analytics"
import Link from "next/link"
import { toast } from "sonner"

type ApplicationStatus = "applied" | "interviewing" | "offer" | "rejected"

interface RawApplicationResponse {
  id: string
  user_id: string
  company: string
  job_title: string
  status: string
  applied_date: string
  notes: string | null
  resume_id: string | null
  cover_letter_id: string | null
  contact_id: string | null
  created_at: string
  updated_at: string
  response_date: string | null
  interview_date: string | null
  offer_date: string | null
  rejection_date: string | null
  follow_up_dates: string[] | null
  interview_feedback: string | null
  salary_offered: number | null
  application_method: string | null
  application_source: string | null
  interview_rounds: number
  interview_types: string[] | null
  skills_assessed: string[] | null
  resumes: { name: string } | null
  cover_letters: { name: string } | null
  contacts: { name: string; title: string | null } | null
}

const statusColors = {
  applied: "bg-blue-500",
  interviewing: "bg-yellow-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
}

export function ApplicationTracker() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null)
  const [selectedResume, setSelectedResume] = useState<any>(null)
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<any>(null)
  const [showResumePreview, setShowResumePreview] = useState(false)
  const [showCoverLetterPreview, setShowCoverLetterPreview] = useState(false)
  const [newApplication, setNewApplication] = useState<ApplicationFormState>({
    company: "",
    job_title: "",
    status: "applied",
    notes: "",
    resume_id: null,
    cover_letter_id: null,
    contact_id: null,
    application_method: null,
    application_source: null,
    interview_rounds: 0,
    interview_types: null,
    skills_assessed: null,
  })

  const supabase = createClient()
  const { resumes, isLoading: resumesLoading } = useResumes()
  const { coverLetters, isLoading: coverLettersLoading } = useCoverLetters()
  const { contacts, isLoading: contactsLoading } = useContacts()

  const fetchApplications = useCallback(async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*, resumes(name), cover_letters(name), contacts(name, title)")
      .order("created_at", { ascending: false })
      .returns<RawApplicationResponse[]>()

    if (error) {
      console.error("Error fetching applications:", error)
      toast.error("Failed to fetch applications")
      return
    }

    if (data) {
      setApplications(data as unknown as ApplicationResponse[])
    }
  }, [supabase])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error("No session found:", sessionError)
      toast.error("Authentication error. Please try logging in again.")
      return
    }

    const now = new Date().toISOString()
    const application = {
      user_id: session.user.id,
      company: newApplication.company,
      job_title: newApplication.job_title,
      status: newApplication.status,
      applied_date: now,
      notes: newApplication.notes || null,
      resume_id: newApplication.resume_id === "none" ? null : newApplication.resume_id,
      cover_letter_id: newApplication.cover_letter_id === "none" ? null : newApplication.cover_letter_id,
      contact_id: newApplication.contact_id === "none" ? null : newApplication.contact_id,
      application_method: newApplication.application_method,
      application_source: newApplication.application_source,
      interview_rounds: newApplication.interview_rounds || 0,
      interview_types: newApplication.interview_types,
      skills_assessed: newApplication.skills_assessed,
      response_date: newApplication.response_date,
      interview_date: newApplication.interview_date,
      offer_date: newApplication.offer_date,
      rejection_date: newApplication.rejection_date,
      follow_up_dates: newApplication.follow_up_dates,
      interview_feedback: newApplication.interview_feedback,
      salary_offered: newApplication.salary_offered,
    }

    let error;
    if (isEditMode && newApplication.id) {
      const { error: updateError } = await supabase
        .from("applications")
        .update(application)
        .eq("id", newApplication.id)
      error = updateError
      if (!error) {
        toast.success(`Updated application for ${application.job_title} at ${application.company}`)
      }
    } else {
      const { error: insertError } = await supabase
        .from("applications")
        .insert([application])
      error = insertError
      if (!error) {
        toast.success(`Added new application for ${application.job_title} at ${application.company}`)
      }
    }

    if (error) {
      console.error("Error saving application:", error)
      toast.error(error.message || "Failed to save application")
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
      contact_id: null,
      application_method: null,
      application_source: null,
      interview_rounds: 0,
      interview_types: null,
      skills_assessed: null,
    })
    fetchApplications()
  }

  const handleEdit = (application: ApplicationResponse) => {
    setNewApplication({
      id: application.id,
      company: application.company,
      job_title: application.job_title,
      status: application.status as ApplicationStatus,
      notes: application.notes || "",
      resume_id: application.resume_id,
      cover_letter_id: application.cover_letter_id,
      contact_id: application.contact_id,
      application_method: application.application_method,
      application_source: application.application_source,
      interview_rounds: application.interview_rounds,
      interview_types: application.interview_types,
      skills_assessed: application.skills_assessed,
      response_date: application.response_date,
      interview_date: application.interview_date,
      offer_date: application.offer_date,
      rejection_date: application.rejection_date,
      follow_up_dates: application.follow_up_dates,
      interview_feedback: application.interview_feedback,
      salary_offered: application.salary_offered,
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
      toast.error("Failed to delete application")
      return
    }

    toast.success("Application deleted successfully")
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
      toast.error("Failed to load resume preview")
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
      toast.error("Failed to load cover letter preview")
      return
    }

    setSelectedCoverLetter(coverLetter)
    setShowCoverLetterPreview(true)
  }

  if (resumesLoading || coverLettersLoading || contactsLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="tracker" className="w-full">
        <TabsList>
          <TabsTrigger value="tracker">Application Tracker</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracker">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
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
                    contact_id: null,
                    application_method: null,
                    application_source: null,
                    interview_rounds: 0,
                    interview_types: null,
                    skills_assessed: null,
                  })
                }
              }}>
                <DialogTrigger asChild>
                  <Button>Add Application</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Application" : "Add New Application"}</DialogTitle>
                    <DialogDescription>
                      Enter the details of your job application
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Basic Information */}
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

                      {/* Application Details */}
                      <div className="space-y-2">
                        <label htmlFor="applicationMethod">Application Method</label>
                        <Select
                          value={newApplication.application_method || ""}
                          onValueChange={(value) =>
                            setNewApplication({ ...newApplication, application_method: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="company_website">Company Website</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="indeed">Indeed</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="applicationSource">Application Source</label>
                        <Select
                          value={newApplication.application_source || ""}
                          onValueChange={(value) =>
                            setNewApplication({ ...newApplication, application_source: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="job_board">Job Board</SelectItem>
                            <SelectItem value="company_careers">Company Careers</SelectItem>
                            <SelectItem value="recruiter">Recruiter</SelectItem>
                            <SelectItem value="network">Network</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Status and Dates */}
                      <div className="space-y-2">
                        <label htmlFor="status">Status</label>
                        <Select
                          value={newApplication.status}
                          onValueChange={(value: ApplicationStatus) => {
                            const now = new Date().toISOString()
                            const updates: Partial<ApplicationFormState> = { status: value }
                            
                            // Update relevant dates based on status
                            if (value === "interviewing") {
                              updates.interview_date = now
                              updates.response_date = updates.response_date || now
                            } else if (value === "offer") {
                              updates.offer_date = now
                            } else if (value === "rejected") {
                              updates.rejection_date = now
                            }
                            
                            setNewApplication({ ...newApplication, ...updates })
                          }}
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

                      {/* Interview Details */}
                      {(newApplication.status === "interviewing" || newApplication.status === "offer") && (
                        <>
                          <div className="space-y-2">
                            <label htmlFor="interviewRounds">Interview Rounds</label>
                            <Input
                              id="interviewRounds"
                              type="number"
                              min="0"
                              value={newApplication.interview_rounds || 0}
                              onChange={(e) =>
                                setNewApplication({
                                  ...newApplication,
                                  interview_rounds: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="interviewTypes">Interview Types</label>
                            <Select
                              value={newApplication.interview_types?.[0] || ""}
                              onValueChange={(value) =>
                                setNewApplication({
                                  ...newApplication,
                                  interview_types: [value],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="phone">Phone Screen</SelectItem>
                                <SelectItem value="technical">Technical</SelectItem>
                                <SelectItem value="behavioral">Behavioral</SelectItem>
                                <SelectItem value="onsite">On-site</SelectItem>
                                <SelectItem value="panel">Panel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="interviewFeedback">Interview Feedback</label>
                            <Input
                              id="interviewFeedback"
                              value={newApplication.interview_feedback || ""}
                              onChange={(e) =>
                                setNewApplication({
                                  ...newApplication,
                                  interview_feedback: e.target.value,
                                })
                              }
                            />
                          </div>
                        </>
                      )}

                      {/* Offer Details */}
                      {newApplication.status === "offer" && (
                        <div className="space-y-2">
                          <label htmlFor="salaryOffered">Salary Offered</label>
                          <Input
                            id="salaryOffered"
                            type="number"
                            min="0"
                            value={newApplication.salary_offered || ""}
                            onChange={(e) =>
                              setNewApplication({
                                ...newApplication,
                                salary_offered: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                      )}

                      {/* Documents and Contact */}
                      <div className="space-y-2">
                        <label htmlFor="resume">Resume</label>
                        <Select
                          value={newApplication.resume_id || "none"}
                          onValueChange={(value) =>
                            setNewApplication({
                              ...newApplication,
                              resume_id: value === "none" ? null : value,
                            })
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
                            setNewApplication({
                              ...newApplication,
                              cover_letter_id: value === "none" ? null : value,
                            })
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
                        <label htmlFor="contact">Contact</label>
                        <Select
                          value={newApplication.contact_id || "none"}
                          onValueChange={(value) =>
                            setNewApplication({
                              ...newApplication,
                              contact_id: value === "none" ? null : value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select contact" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {contacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.name} {contact.title ? `(${contact.title})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-sm text-gray-500">
                          <Link href="/applications/contacts" className="text-blue-500 hover:underline">
                            Manage Contacts
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
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
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Applied</TableHead>
                    <TableHead>Contact</TableHead>
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
                        {application.contacts?.name && (
                          <div className="flex items-center space-x-2">
                            <Link 
                              href="/applications/contacts" 
                              className="text-blue-500 hover:underline"
                            >
                              {application.contacts.name}
                              {application.contacts.title && (
                                <span className="text-gray-500">
                                  {" "}
                                  ({application.contacts.title})
                                </span>
                              )}
                            </Link>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {application.resume_id && (
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-500">
                              {application.resumes?.name || 'Attached'}
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
                              {application.cover_letters?.name || 'Attached'}
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
        </TabsContent>

        <TabsContent value="analytics">
          <ApplicationAnalyticsDashboard />
        </TabsContent>
      </Tabs>

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
    </div>
  )
}
