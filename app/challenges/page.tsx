import { Metadata } from "next"
import TechnicalChallengeSimulator from "@/components/challenges/technical-challenge-simulator"

export const metadata: Metadata = {
  title: "Technical Challenges | Kareerly",
  description: "Practice technical coding challenges with real-time AI feedback",
}

export default function ChallengePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Technical Challenge Practice</h1>
        <p className="text-muted-foreground">
          Practice technical coding challenges with our AI interviewer. Get real-time feedback and guidance to improve your problem-solving skills.
        </p>
        <TechnicalChallengeSimulator />
      </div>
    </div>
  )
}
