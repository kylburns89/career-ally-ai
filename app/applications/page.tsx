import { Metadata } from "next"
import { ApplicationTracker } from "../../components/applications/application-tracker"

export const metadata: Metadata = {
  title: "Application Tracker",
  description: "Track and manage your job applications",
}

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Application Tracker</h1>
            <p className="text-muted-foreground">
              Keep track of your job applications and their status
            </p>
          </div>
        </div>
        <ApplicationTracker />
      </div>
    </div>
  )
}
