import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RocketIcon, SparklesIcon, BrainIcon, ShieldCheckIcon, HeartIcon } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: RocketIcon,
    title: "AI-Powered Career Growth",
    description: "Leverage cutting-edge AI technology to accelerate your career journey with personalized guidance and tools."
  },
  {
    icon: SparklesIcon,
    title: "Comprehensive Tools",
    description: "From resume building to interview preparation, access all the tools you need in one integrated platform."
  },
  {
    icon: BrainIcon,
    title: "Smart Insights",
    description: "Get data-driven recommendations and insights to make informed decisions about your career path."
  },
  {
    icon: ShieldCheckIcon,
    title: "Privacy First",
    description: "Your data is secure and private stored in Supabase, a secure and compliant platform."
  },
  {
    icon: HeartIcon,
    title: "User-Centric Design",
    description: "Enjoy an intuitive interface designed to make your job search process smooth and efficient."
  }
];

export default function About() {
  return (
    <div className="space-y-12 py-8">
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">About Kareerly</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Kareerly is your intelligent career companion, combining advanced artificial intelligence with comprehensive career development tools to help you achieve your professional goals.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/auth/login">Start Your Journey</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-3xl font-semibold text-center">Why Choose Career Ally AI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="p-6">
              <div className="space-y-4">
                <benefit.icon className="w-12 h-12 text-primary" />
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-semibold">Our Mission</h2>
        <p className="text-lg text-muted-foreground">
          We believe everyone deserves access to powerful career development tools. Our mission is to democratize career advancement by providing AI-powered tools that were once only available through expensive career coaching services.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/auth/login">Explore Features</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
