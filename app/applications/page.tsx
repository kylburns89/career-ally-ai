import { PageContainer } from '../../components/page-container'
import { ApplicationTracker } from '../../components/applications/application-tracker'
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/auth-options";
import { prisma } from "../../lib/prisma";

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const [rawApplications, rawResumes, rawCoverLetters, rawContacts] = await Promise.all([
      prisma.jobApplication.findMany({
        where: { userId: user.id },
        include: { contact: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.resume.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.coverLetter.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.contact.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Transform the data to match Application type
    const applications = rawApplications.map(app => ({
      id: app.id,
      userId: app.userId,
      jobTitle: app.jobTitle,
      company: app.company,
      location: app.location,
      status: app.status,
      appliedDate: app.appliedDate,
      contactId: app.contactId,
      resumeId: app.resumeId,
      coverLetterId: app.coverLetterId,
      notes: app.notes,
      nextSteps: app.nextSteps,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));

    const resumes = rawResumes.map(resume => ({
      id: resume.id,
      name: resume.title,
    }));

    const coverLetters = rawCoverLetters.map(letter => ({
      id: letter.id,
      name: letter.title,
    }));

    const contacts = rawContacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      title: contact.title,
    }));

    return (
      <PageContainer>
        <ApplicationTracker 
          initialApplications={applications}
          initialResumes={resumes}
          initialCoverLetters={coverLetters}
          initialContacts={contacts}
        />
      </PageContainer>
    );
  } catch (error) {
    console.error("Error loading applications data:", error);
    return (
      <PageContainer>
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <h2 className="font-semibold">Error Loading Data</h2>
          <p>There was a problem loading your applications. Please try again later.</p>
        </div>
      </PageContainer>
    );
  }
}
