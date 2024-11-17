import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/page-container"

const JobSearchResourcesPage = () => {
  const resources = [
    {
      title: "Job Search Platforms",
      description: "Popular platforms for finding tech jobs",
      links: [
        {
          title: "LinkedIn Jobs",
          url: "https://www.linkedin.com/jobs/",
          description: "Professional networking and job search platform"
        },
        {
          title: "Indeed",
          url: "https://www.indeed.com/",
          description: "Comprehensive job search engine"
        },
        {
          title: "Wellfound (AngelList)",
          url: "https://wellfound.com/jobs",
          description: "Startup and tech company job board"
        },
        {
          title: "Glassdoor",
          url: "https://www.glassdoor.com/",
          description: "Job listings with company reviews and salaries"
        }
      ]
    },
    {
      title: "Tech-Specific Job Boards",
      description: "Job boards focused on tech roles",
      links: [
        {
          title: "Stack Overflow Jobs",
          url: "https://stackoverflow.com/jobs",
          description: "Developer-focused job board"
        },
        {
          title: "GitHub Jobs",
          url: "https://jobs.github.com/",
          description: "Tech jobs from GitHub's job board"
        },
        {
          title: "Hacker News Who's Hiring",
          url: "https://news.ycombinator.com/jobs",
          description: "Monthly thread of tech job postings"
        }
      ]
    },
    {
      title: "Networking",
      description: "Resources for professional networking",
      links: [
        {
          title: "LinkedIn Networking Guide",
          url: "https://www.linkedin.com/business/sales/blog/profile-best-practices/17-steps-to-a-better-linkedin-profile-in-2017",
          description: "Tips for building your LinkedIn presence"
        },
        {
          title: "Tech Meetups",
          url: "https://www.meetup.com/topics/tech/",
          description: "Find local tech meetups and events"
        },
        {
          title: "Conference List",
          url: "https://confs.tech/",
          description: "Upcoming tech conferences and events"
        }
      ]
    },
    {
      title: "Company Research",
      description: "Tools for researching potential employers",
      links: [
        {
          title: "Levels.fyi",
          url: "https://www.levels.fyi/",
          description: "Tech company compensation data"
        },
        {
          title: "Blind",
          url: "https://www.teamblind.com/",
          description: "Anonymous professional community"
        },
        {
          title: "The Muse Company Profiles",
          url: "https://www.themuse.com/companies",
          description: "In-depth company culture profiles"
        }
      ]
    },
    {
      title: "Career Planning",
      description: "Resources for career development",
      links: [
        {
          title: "Tech Career Roadmap",
          url: "https://roadmap.sh/",
          description: "Developer roadmaps and learning paths"
        },
        {
          title: "Career Advice Blog",
          url: "https://www.kalzumeus.com/greatest-hits/",
          description: "Career strategy for software developers"
        },
        {
          title: "Tech Interview Handbook",
          url: "https://www.techinterviewhandbook.org/",
          description: "Comprehensive tech interview guide"
        }
      ]
    },
    {
      title: "Remote Work",
      description: "Resources for finding remote jobs",
      links: [
        {
          title: "We Work Remotely",
          url: "https://weworkremotely.com/",
          description: "Remote job board"
        },
        {
          title: "Remote.co",
          url: "https://remote.co/remote-jobs/",
          description: "Remote job listings and resources"
        },
        {
          title: "Remote Work Guide",
          url: "https://about.gitlab.com/company/culture/all-remote/guide/",
          description: "GitLab's guide to remote work"
        }
      ]
    }
  ]

  return (
    <PageContainer>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Search Resources</h1>
          <p className="text-muted-foreground">
            Comprehensive resources to help you find and land your next tech role
          </p>
        </div>

        <div className="space-y-6">
          {resources.map((section) => (
            <Card key={section.title} className="p-6">
              <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
              <p className="text-muted-foreground mb-4">{section.description}</p>
              <div className="space-y-4">
                {section.links.map((link) => (
                  <div key={link.title} className="border-t pt-4 first:border-t-0 first:pt-0">
                    <h3 className="font-semibold mb-1">{link.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                    <Button asChild variant="outline">
                      <Link href={link.url} target="_blank" rel="noopener noreferrer">
                        Visit Resource
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card className="p-6 bg-muted">
            <h2 className="text-xl font-semibold mb-2">Track Your Applications</h2>
            <p className="text-muted-foreground mb-4">
              Use our application tracker to manage your job search process
            </p>
            <Button asChild>
              <Link href="/applications">Go to Application Tracker</Link>
            </Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default JobSearchResourcesPage
