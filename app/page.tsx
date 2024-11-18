import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BriefcaseIcon, FileTextIcon, MessagesSquareIcon, LineChartIcon, BrainCircuitIcon, ClipboardCheckIcon, CodeIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: FileTextIcon,
    title: "Resume Builder & Analyzer",
    description: "Create and analyze your resume with AI-powered insights",
    href: "/resume"
  },
  {
    icon: BriefcaseIcon,
    title: "Job Search",
    description: "Get personalized job recommendations based on your profile",
    href: "/jobs"
  },
  {
    icon: MessagesSquareIcon,
    title: "Interview Simulator",
    description: "Practice interviews with AI and get real-time feedback",
    href: "/interview"
  },
  {
    icon: ClipboardCheckIcon,
    title: "Cover Letter Generator",
    description: "Generate tailored cover letters for your applications",
    href: "/cover-letter"
  },
  {
    icon: LineChartIcon,
    title: "Salary Coach",
    description: "Get guidance on salary negotiation strategies",
    href: "/salary"
  },
  {
    icon: BrainCircuitIcon,
    title: "Application Tracker",
    description: "Track and manage your job applications",
    href: "/tracker"
  },
  {
    icon: CodeIcon,
    title: "Technical Challenges",
    description: "Practice technical interviews with AI feedback",
    href: "/challenges"
  },
  {
    icon: SparklesIcon,
    title: "Coming Soon",
    description: "Career Path Planning, Networking Assistant, Skills Assessment, and more exciting features on the way!",
    href: "#"
  }
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Your AI Career Assistant</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Supercharge your job search with AI-powered tools for resume building, interview preparation, and more.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/resume">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className={`p-6 hover:shadow-lg transition-shadow ${feature.title === "Coming Soon" ? "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10" : ""}`}>
            <div className="space-y-4">
              <feature.icon className={`w-12 h-12 ${feature.title === "Coming Soon" ? "text-purple-500" : "text-primary"}`} />
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="text-muted-foreground">{feature.description}</p>
              {feature.title !== "Coming Soon" ? (
                <Button asChild variant="ghost" className="w-full">
                  <Link href={feature.href}>Get Started →</Link>
                </Button>
              ) : (
                <Button disabled variant="ghost" className="w-full">
                  Stay Tuned →
                </Button>
              )}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
