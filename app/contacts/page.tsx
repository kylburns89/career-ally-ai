"use client"

import { ContactManager } from "../../components/contacts/contact-manager"
import { PageContainer } from "../../components/page-container"

export default function ContactsPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-gray-500">Manage your professional network and track job application contacts</p>
        </div>
        <ContactManager />
      </div>
    </PageContainer>
  )
}
