import { ContactManager } from "../../../components/contacts/contact-manager"

export default function ContactsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Contact Management</h1>
      <ContactManager />
    </div>
  )
}
