"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RocketIcon, SparklesIcon, BrainIcon, ShieldCheckIcon, HeartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/auth-provider";

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
  const router = useRouter();
  const { session, loading } = useAuthContext();

  const handleStartJourney = () => {
    // If still loading, show loading state in button
    if (loading) {
      console.log('Auth state is loading...');
      return;
    }

    console.log('Auth state:', { session: !!session, loading });
    
    if (session) {
      console.log('User is authenticated, redirecting to landing page...');
      router.push("/");
    } else {
      console.log('User is not authenticated, redirecting to login...');
      // Ensure we're using the full URL for the redirect
      const currentUrl = window.location.origin;
      const redirectUrl = new URL('/auth/login', currentUrl);
      redirectUrl.searchParams.set('redirectTo', '/tracker');
      router.push(redirectUrl.toString());
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About Kareerly</h1>
            <p className="text-xl text-muted-foreground">
              Kareerly is your intelligent career companion, combining advanced artificial intelligence with comprehensive career development tools to help you achieve your professional goals.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={handleStartJourney}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Start Your Journey'}
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="space-y-10 max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center">Why Choose Kareerly?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card 
                key={benefit.title} 
                className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <benefit.icon className="w-10 h-10 text-primary" />
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 bg-accent/10 rounded-2xl">
          <div className="max-w-3xl mx-auto text-center space-y-6 px-4">
            <h2 className="text-3xl font-semibold">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              We believe everyone deserves access to powerful career development tools. Our mission is to democratize career advancement by providing AI-powered tools that were once only available through expensive career coaching services.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={handleStartJourney}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Explore Features'}
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-semibold">Ready to Accelerate Your Career?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of professionals who are already using Kareerly to advance their careers.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={handleStartJourney}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Get Started Now'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
