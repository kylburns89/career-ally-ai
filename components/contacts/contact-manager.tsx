"use client"

import { useState } from "react"
import { useContacts } from "../../hooks/use-contacts"
import { Contact, CommunicationEntry } from "../../types/contact"
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

export function ContactManager() {
  const { contacts, stats, isLoading, addContact, updateContact, deleteContact, addCommunication } = useContacts()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    company: "",
    title: "",
    email: "",
    phone: "",
    linkedin_url: "",
    relationship_score: 50,
    notes: "",
  })
  const [newCommunication, setNewCommunication] = useState<Partial<CommunicationEntry>>({
    type: "email",
    summary: "",
    sentiment: "neutral",
    followup_needed: false,
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditMode && selectedContactId) {
      await updateContact(selectedContactId, newContact)
    } else {
      await addContact(newContact as Omit<Contact, "id" | "user_id" | "created_at" | "updated_at" | "communication_history">)
    }
    setIsOpen(false)
    resetForm()
  }

  const handleEdit = (contact: Contact) => {
    setNewContact({
      name: contact.name,
      company: contact.company,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      linkedin_url: contact.linkedin_url,
      relationship_score: contact.relationship_score,
      notes: contact.notes,
    })
    setSelectedContactId(contact.id)
    setIsEditMode(true)
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    setContactToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (contactToDelete) {
      await deleteContact(contactToDelete)
      setDeleteDialogOpen(false)
      setContactToDelete(null)
    }
  }

  const handleAddCommunication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedContactId && newCommunication.type && newCommunication.summary) {
      await addCommunication(selectedContactId, newCommunication as Omit<CommunicationEntry, "date">)
      setShowCommunicationDialog(false)
      resetCommunicationForm()
    }
  }

  const resetForm = () => {
    setNewContact({
      name: "",
      company: "",
      title: "",
      email: "",
      phone: "",
      linkedin_url: "",
      relationship_score: 50,
      notes: "",
    })
    setIsEditMode(false)
    setSelectedContactId(null)
  }

  const resetCommunicationForm = () => {
    setNewCommunication({
      type: "email",
      summary: "",
      sentiment: "neutral",
      followup_needed: false,
      notes: "",
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <Card>
          <CardHeader>
            <CardTitle>Need Follow-up</CardTitle>
            <CardDescription>Pending interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.needsFollowup}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.recentCommunications}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contacts</h2>
        <Dialog open={isOpen} onOpenChange={(open) => {
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
                  value={newContact.linkedin_url || ""}
                  onChange={(e) => setNewContact({ ...newContact, linkedin_url: e.target.value })}
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

      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Communication</DialogTitle>
            <DialogDescription>
              Record a new interaction with this contact
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCommunication} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="type">Type</label>
              <Select
                value={newCommunication.type}
                onValueChange={(value) => setNewCommunication({ ...newCommunication, type: value as CommunicationEntry["type"] })}
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
              <label htmlFor="summary">Summary *</label>
              <Textarea
                id="summary"
                value={newCommunication.summary}
                onChange={(e) => setNewCommunication({ ...newCommunication, summary: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="sentiment">Sentiment</label>
              <Select
                value={newCommunication.sentiment}
                onValueChange={(value) => setNewCommunication({ ...newCommunication, sentiment: value as CommunicationEntry["sentiment"] })}
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
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newCommunication.followup_needed}
                  onChange={(e) => setNewCommunication({ ...newCommunication, followup_needed: e.target.checked })}
                />
                <span>Needs Follow-up</span>
              </label>
            </div>
            <div className="space-y-2">
              <label htmlFor="notes">Notes</label>
              <Textarea
                id="notes"
                value={newCommunication.notes}
                onChange={(e) => setNewCommunication({ ...newCommunication, notes: e.target.value })}
              />
            </div>
            <Button type="submit">Add Communication</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact and all associated communication history.
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
              <TableHead>Last Contact</TableHead>
              <TableHead>Actions</TableHead>
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
                  {contact.last_contact_date
                    ? new Date(contact.last_contact_date).toLocaleDateString()
                    : "Never"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContactId(contact.id)
                        setShowCommunicationDialog(true)
                      }}
                    >
                      Add Communication
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
    </div>
  )
}
