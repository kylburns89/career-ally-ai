"use client"

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
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
import ResumePreview from "../resume/resume-preview"
import { CoverLetterPreview } from "../cover-letter/cover-letter-preview"
import { useSession } from "next-auth/react"
import { toast } from "../ui/use-toast"
import type { Application, ApplicationFormState, CommunicationEntry } from "../../types/application"
import { useApplications } from "../../hooks/use-applications"

type ApplicationStatus = "applied" | "interviewing" | "offer" | "rejected"

interface ApplicationTrackerProps {
  initialApplications: Application[]
  initialResumes: { id: string; name: string }[]
  initialCoverLetters: { id: string; name: string }[]
  initialContacts: { id: string; name: string; title: string | null }[]
}

const statusColors = {
  applied: "bg-blue-500",
  interviewing: "bg-yellow-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
}

export function ApplicationTracker({
  initialApplications,
  initialResumes,
  initialCoverLetters,
  initialContacts,
}: ApplicationTrackerProps) {
  const { data: session } = useSession()
  const { 
    applications, 
    isLoading, 
    addCommunication,
    deleteCommunication, 
    fetchApplications,
    updateApplication,
    deleteApplication,
    setApplications 
  } = useApplications(initialApplications)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null)
  const [selectedResume, setSelectedResume] = useState<any>(null)
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<any>(null)
  const [showResumePreview, setShowResumePreview] = useState(false)
  const [showCoverLetterPreview, setShowCoverLetterPreview] = useState(false)
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [newCommunication, setNewCommunication] = useState<Omit<CommunicationEntry, 'date'>>({
    type: 'email',
    summary: '',
    sentiment: 'neutral',
    followup_needed: false,
    notes: ''
  })
  const [newApplication, setNewApplication] = useState<ApplicationFormState>({
    jobTitle: "",
    company: "",
    location: "",
    status: "applied",
    notes: "",
    nextSteps: "",
    resumeId: null,
    coverLetterId: null,
    contactId: null,
  })

  useEffect(() => {
    if (session?.user) {
      fetchApplications()
    }
  }, [session, fetchApplications])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const applicationData = {
      id: isEditMode ? newApplication.id : undefined,
      jobTitle: newApplication.jobTitle,
      company: newApplication.company,
      location: newApplication.location || null,
      status: newApplication.status,
      appliedDate: new Date(),
      notes: newApplication.notes || null,
      nextSteps: newApplication.nextSteps || null,
      resumeId: newApplication.resumeId === "none" ? null : newApplication.resumeId,
      coverLetterId: newApplication.coverLetterId === "none" ? null : newApplication.coverLetterId,
      contactId: newApplication.contactId === "none" ? null : newApplication.contactId,
      userId: session?.user?.email as string
    }

    try {
      let response: Response;
      if (isEditMode) {
        response = await fetch(`/api/applications/${applicationData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationData),
        });

        if (!response.ok) throw new Error('Failed to update application');
        toast({ title: `Updated application for ${applicationData.jobTitle} at ${applicationData.company}` });
      } else {
        response = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationData),
        });

        if (!response.ok) throw new Error('Failed to create application');
        toast({ title: `Added new application for ${applicationData.jobTitle} at ${applicationData.company}` });
      }

      const savedApplication = await response.json();
      if (isEditMode) {
        updateApplication(savedApplication);
      } else {
        setApplications(prev => [savedApplication, ...prev]);
      }

      setIsOpen(false);
      setIsEditMode(false);
      setNewApplication({
        jobTitle: "",
        company: "",
        location: "",
        status: "applied",
        notes: "",
        nextSteps: "",
        resumeId: null,
        coverLetterId: null,
        contactId: null,
      });
    } catch (error) {
      console.error('Error saving application:', error);
      toast({ title: 'Failed to save application', variant: 'destructive' });
    }
  }

  const handleEdit = (application: Application) => {
    setNewApplication({
      id: application.id,
      company: application.company,
      jobTitle: application.jobTitle,
      location: application.location || "",
      status: application.status as ApplicationStatus,
      notes: application.notes || "",
      nextSteps: application.nextSteps || "",
      resumeId: application.resumeId || null,
      coverLetterId: application.coverLetterId || null,
      contactId: application.contactId || null,
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

    try {
      const response = await fetch(`/api/applications/${applicationToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete application');

      deleteApplication(applicationToDelete);
      toast({ title: "Application deleted successfully" });
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({ title: 'Failed to delete application', variant: 'destructive' });
    }

    setDeleteDialogOpen(false);
    setApplicationToDelete(null);
  }

  const handlePreviewResume = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (!response.ok) throw new Error('Failed to fetch resume');
      
      const resume = await response.json();
      setSelectedResume(resume);
      setShowResumePreview(true);
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast({ title: 'Failed to load resume preview', variant: 'destructive' });
    }
  }

  const handlePreviewCoverLetter = async (coverLetterId: string) => {
    try {
      const response = await fetch(`/api/cover-letters/${coverLetterId}`);
      if (!response.ok) throw new Error('Failed to fetch cover letter');
      
      const coverLetter = await response.json();
      setSelectedCoverLetter(coverLetter);
      setShowCoverLetterPreview(true);
    } catch (error) {
      console.error('Error fetching cover letter:', error);
      toast({ title: 'Failed to load cover letter preview', variant: 'destructive' });
    }
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Dialog open={isOpen} onOpenChange={(open: boolean) => {
            setIsOpen(open)
            if (!open) {
              setIsEditMode(false)
              setNewApplication({
                jobTitle: "",
                company: "",
                location: "",
                status: "applied",
                notes: "",
                nextSteps: "",
                resumeId: null,
                coverLetterId: null,
                contactId: null,
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
                    <label htmlFor="jobTitle">Position</label>
                    <Input
                      id="jobTitle"
                      value={newApplication.jobTitle}
                      onChange={(e) =>
                        setNewApplication({ ...newApplication, jobTitle: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="location">Location</label>
                    <Input
                      id="location"
                      value={newApplication.location}
                      onChange={(e) =>
                        setNewApplication({ ...newApplication, location: e.target.value })
                      }
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label htmlFor="status">Status</label>
                    <Select
                      value={newApplication.status}
                      onValueChange={(value: ApplicationStatus) => {
                        setNewApplication({ ...newApplication, status: value })
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

                  {/* Documents */}
                  <div className="space-y-2">
                    <label htmlFor="resume">Resume</label>
                    <Select
                      value={newApplication.resumeId || "none"}
                      onValueChange={(value: string) =>
                        setNewApplication({
                          ...newApplication,
                          resumeId: value === "none" ? null : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select resume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {initialResumes.map((resume) => (
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
                      value={newApplication.coverLetterId || "none"}
                      onValueChange={(value: string) =>
                        setNewApplication({
                          ...newApplication,
                          coverLetterId: value === "none" ? null : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cover letter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {initialCoverLetters.map((letter) => (
                          <SelectItem key={letter.id} value={letter.id}>
                            {letter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <TableHead>Resume</TableHead>
                <TableHead>Cover Letter</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Communications</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.company}</TableCell>
                  <TableCell>{application.jobTitle}</TableCell>
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
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {application.resumeId && (
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-500">Attached</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewResume(application.resumeId!)}
                        >
                          Preview
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {application.coverLetterId && (
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-500">Attached</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewCoverLetter(application.coverLetterId!)}
                        >
                          Preview
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{application.notes}</TableCell>
                  <TableCell>
                    {application.communicationHistory?.length ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {application.communicationHistory.length} entries
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application)
                            setShowCommunicationDialog(true)
                          }}
                        >
                          View
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(application)
                          setShowCommunicationDialog(true)
                        }}
                      >
                        Add Communication
                      </Button>
                    )}
                  </TableCell>
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

      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Communications History</DialogTitle>
            <DialogDescription>
              {selectedApplication && `${selectedApplication.jobTitle} at ${selectedApplication.company}`}
            </DialogDescription>
          </DialogHeader>

          {/* Communication History */}
          {selectedApplication?.communicationHistory && selectedApplication.communicationHistory.length > 0 && (
            <div className="space-y-4 mb-4">
              <h3 className="font-semibold">Previous Communications</h3>
              <div className="space-y-2">
                {selectedApplication.communicationHistory.map((comm, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-medium">{comm.type}</span>
                        <span className="text-gray-500 ml-2">
                          {new Date(comm.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          comm.sentiment === 'positive' ? 'default' :
                          comm.sentiment === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {comm.sentiment}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-red-500 hover:text-red-700"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this communication?')) {
                              const result = await deleteCommunication(selectedApplication.id, index)
                              if (result) {
                                toast({ title: 'Communication deleted successfully' })
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2">{comm.summary}</p>
                    {comm.notes && <p className="mt-1 text-gray-600">{comm.notes}</p>}
                    {comm.followup_needed && (
                      <Badge variant="outline" className="mt-2">
                        Followup needed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Communication Form */}
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (!selectedApplication) return

            const result = await addCommunication(selectedApplication.id, newCommunication)
            if (result) {
              setShowCommunicationDialog(false)
              setNewCommunication({
                type: 'email',
                summary: '',
                sentiment: 'neutral',
                followup_needed: false,
                notes: ''
              })
              toast({ title: 'Communication added successfully' })
            }
          }}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="type">Type</label>
                  <Select
                    value={newCommunication.type}
                    onValueChange={(value: CommunicationEntry['type']) =>
                      setNewCommunication({ ...newCommunication, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sentiment">Sentiment</label>
                  <Select
                    value={newCommunication.sentiment}
                    onValueChange={(value: CommunicationEntry['sentiment']) =>
                      setNewCommunication({ ...newCommunication, sentiment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="summary">Summary</label>
                <Textarea
                  id="summary"
                  value={newCommunication.summary}
                  onChange={(e) =>
                    setNewCommunication({ ...newCommunication, summary: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="notes">Additional Notes</label>
                <Textarea
                  id="notes"
                  value={newCommunication.notes}
                  onChange={(e) =>
                    setNewCommunication({ ...newCommunication, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="followup"
                  checked={newCommunication.followup_needed}
                  onChange={(e) =>
                    setNewCommunication({
                      ...newCommunication,
                      followup_needed: e.target.checked,
                    })
                  }
                />
                <label htmlFor="followup">Follow-up needed</label>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit">Add Communication</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
