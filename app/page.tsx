import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BriefcaseIcon, FileTextIcon, MessagesSquareIcon, LineChartIcon, BrainCircuitIcon, ClipboardCheckIcon, CodeIcon, SparklesIcon, GitForkIcon, SearchIcon } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: FileTextIcon,
    title: "Resume Builder & Analyzer",
    description: "Create and analyze your resume with AI-powered insights",
    href: "/resume"
  },
  {
    icon: SearchIcon,
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
    icon: BriefcaseIcon,
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
    icon: GitForkIcon,
    title: "Career Path Visualizer",
    description: "Explore and plan your career progression with AI guidance",
    href: "/tools/career"
  },
  {
    icon: LineChartIcon,
    title: "Market Intelligence",
    description: "Stay informed with industry trends and market insights",
    href: "/market-intelligence"
  }
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Your AI Career Assistant
            </h1>
            <p className="text-xl text-muted-foreground">
              Supercharge your job search with AI-powered tools for resume building, interview preparation, and more.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button asChild size="lg">
                <Link href="/resume">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <feature.icon className="w-10 h-10 text-primary" />
                  <h2 className="text-xl font-semibold">{feature.title}</h2>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
                <Button asChild variant="ghost" className="w-full mt-4">
                  <Link href={feature.href}>Get Started →</Link>
                </Button>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
