"use client"

import { useState, useCallback, useEffect } from "react"
import { useContacts } from "../../hooks/use-contacts"
import { useApplications } from "../../hooks/use-applications"
import { Contact } from "../../types/contact"
import { Application } from "../../types/application"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Badge } from "../ui/badge"
import { Textarea } from "../ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"
import { toast } from "sonner"

export function ContactManager() {
  const { contacts, stats, isLoading: contactsLoading, addContact, updateContact, deleteContact, linkApplication, unlinkApplication } = useContacts()
  const { applications, isLoading: applicationsLoading, fetchApplications } = useApplications()
  const unlinkedApplications = applications.filter(app => !app.contactId)
  const [showApplicationsDialog, setShowApplicationsDialog] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    company: "",
    title: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    relationship_score: 50,
    notes: "",
  })
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditMode && selectedContact) {
        await updateContact(selectedContact.id, newContact)
        toast.success(`Updated contact: ${newContact.name}`)
      } else {
        await addContact(newContact as Omit<Contact, "id" | "userId" | "createdAt" | "updatedAt">)
        toast.success(`Added new contact: ${newContact.name}`)
      }
      setIsOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving contact:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save contact')
    }
  }

  const handleEdit = (contact: Contact) => {
    setNewContact({
      name: contact.name,
      company: contact.company,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      linkedinUrl: contact.linkedinUrl,
      relationship_score: contact.relationship_score,
      notes: contact.notes,
    })
    setSelectedContact(contact)
    setIsEditMode(true)
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    setContactToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (contactToDelete) {
      try {
        await deleteContact(contactToDelete)
        toast.success("Contact deleted successfully")
        setDeleteDialogOpen(false)
        setContactToDelete(null)
      } catch (error) {
        console.error('Error deleting contact:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to delete contact')
      }
    }
  }

  const resetForm = () => {
    setNewContact({
      name: "",
      company: "",
      title: "",
      email: "",
      phone: "",
      linkedinUrl: "",
      relationship_score: 50,
      notes: "",
    })
    setIsEditMode(false)
    setSelectedContact(null)
  }

  useEffect(() => {
    if (showApplicationsDialog) {
      fetchApplications()
    }
  }, [showApplicationsDialog, fetchApplications])

  if (contactsLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Contacts</CardTitle>
            <CardDescription>Your network size</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalContacts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Relationship</CardTitle>
            <CardDescription>Network strength</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.round(stats.averageRelationshipScore)}/100</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contacts</h2>
        <Dialog open={isOpen} onOpenChange={(open: boolean) => {
          setIsOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>Add Contact</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Contact" : "Add New Contact"}</DialogTitle>
              <DialogDescription>
                Enter the contact details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name">Name *</label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="company">Company</label>
                <Input
                  id="company"
                  value={newContact.company || ""}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="title">Title</label>
                <Input
                  id="title"
                  value={newContact.title || ""}
                  onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={newContact.email || ""}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone">Phone</label>
                <Input
                  id="phone"
                  value={newContact.phone || ""}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="linkedin">LinkedIn URL</label>
                <Input
                  id="linkedin"
                  value={newContact.linkedinUrl || ""}
                  onChange={(e) => setNewContact({ ...newContact, linkedinUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="relationship">Relationship Score (0-100)</label>
                <Input
                  id="relationship"
                  type="number"
                  min="0"
                  max="100"
          value={newContact.relationship_score || 50}
          onChange={(e) => setNewContact({ ...newContact, relationship_score: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="notes">Notes</label>
                <Textarea
                  id="notes"
                  value={newContact.notes || ""}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                />
              </div>
              <Button type="submit">{isEditMode ? "Save Changes" : "Add Contact"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact.
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
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.company}</TableCell>
                <TableCell>{contact.title}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      contact.relationship_score && contact.relationship_score >= 70
                        ? "bg-green-500"
                        : contact.relationship_score && contact.relationship_score >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }
                  >
                    {contact.relationship_score}/100
                  </Badge>
                </TableCell>
                <TableCell>
                  {contact.applications && contact.applications.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {contact.applications.map((app) => (
                        <Badge
                          key={app.id}
                          variant="outline"
                          className={
                            app.status === "offer"
                              ? "bg-green-100"
                              : app.status === "interviewing"
                              ? "bg-blue-100"
                              : app.status === "rejected"
                              ? "bg-red-100"
                              : "bg-gray-100"
                          }
                        >
                          {app.company} - {app.jobTitle}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">No linked applications</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContact(contact)
                        setShowApplicationsDialog(true)
                      }}
                    >
                      Manage Applications
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
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

      <Dialog open={showApplicationsDialog} onOpenChange={setShowApplicationsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Applications - {selectedContact?.name}</DialogTitle>
            <DialogDescription>
              Link or unlink job applications for this contact
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Linked Applications</h3>
              {selectedContact?.applications && selectedContact.applications.length > 0 ? (
                <div className="space-y-2">
                  {selectedContact.applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{app.jobTitle}</p>
                        <p className="text-sm text-gray-500">{app.company}</p>
                        <Badge className="mt-1">{app.status}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await unlinkApplication(app.id)
                          toast.success("Application unlinked successfully")
                        }}
                      >
                        Unlink
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No applications linked to this contact</p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Available Applications</h3>
              <div className="space-y-2">
                {applicationsLoading ? (
                  <p className="text-gray-500">Loading applications...</p>
                ) : unlinkedApplications.length > 0 ? (
                  <div className="space-y-2">
                    {unlinkedApplications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{app.jobTitle}</p>
                          <p className="text-sm text-gray-500">{app.company}</p>
                          <Badge className="mt-1">{app.status}</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (selectedContact) {
                              await linkApplication(selectedContact.id, app.id)
                              toast.success("Application linked successfully")
                              fetchApplications() // Refresh the list
                            }
                          }}
                        >
                          Link
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No available applications to link</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
