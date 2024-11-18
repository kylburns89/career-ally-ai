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
import { Database } from "@/types/database"

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
  const [newApplication, setNewApplication] = useState<{
    company: string
    job_title: string
    status: ApplicationStatus
    notes: string
  }>({
    company: "",
    job_title: "",
    status: "applied",
    notes: "",
  })

  const supabase = createClientComponentClient<Database>()

  const fetchApplications = useCallback(async () => {
    const { data: applications, error } = await supabase
      .from("applications")
      .select("*")
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
    }

    const { error } = await supabase
      .from("applications")
      .insert([application])

    if (error) {
      console.error("Error inserting application:", error)
      return
    }

    setIsOpen(false)
    setNewApplication({
      company: "",
      job_title: "",
      status: "applied",
      notes: "",
    })
    fetchApplications()
  }

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Add Application</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Application</DialogTitle>
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
              <label htmlFor="notes">Notes</label>
              <Input
                id="notes"
                value={newApplication.notes}
                onChange={(e) =>
                  setNewApplication({ ...newApplication, notes: e.target.value })
                }
              />
            </div>
            <Button type="submit">Add Application</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Notes</TableHead>
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
                <TableCell>{application.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
