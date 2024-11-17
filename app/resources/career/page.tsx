import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/page-container"

const CareerResourcesPage = () => {
  const resources = [
    {
      title: "Professional Development",
      description: "Resources for growing your professional skills",
      links: [
        {
          title: "Coursera",
          url: "https://www.coursera.org/browse/computer-science",
          description: "Online courses from top universities"
        },
        {
          title: "Udemy",
          url: "https://www.udemy.com/topic/software-development/",
          description: "Practical programming and development courses"
        },
        {
          title: "PluralSight",
          url: "https://www.pluralsight.com/",
          description: "Technology skill development platform"
        }
      ]
    },
    {
      title: "Leadership Development",
      description: "Resources for developing leadership skills",
      links: [
        {
          title: "Tech Lead Handbook",
          url: "https://github.com/kubernetes/community/tree/master/contributors/guide/technical-leads",
          description: "Guide to technical leadership"
        },
        {
          title: "Manager's Handbook",
          url: "https://themanagershandbook.com/",
          description: "Guide to engineering management"
        },
        {
          title: "Staff Engineer Path",
          url: "https://staffeng.com/",
          description: "Resources for senior technical leadership"
        }
      ]
    },
    {
      title: "Soft Skills",
      description: "Resources for developing essential soft skills",
      links: [
        {
          title: "Communication Skills",
          url: "https://www.coursera.org/learn/communication-in-the-workplace",
          description: "Effective workplace communication"
        },
        {
          title: "Problem Solving",
          url: "https://www.mindtools.com/pages/article/problem-solving.htm",
          description: "Problem-solving techniques and strategies"
        },
        {
          title: "Time Management",
          url: "https://todoist.com/productivity-methods",
          description: "Productivity and time management methods"
        }
      ]
    },
    {
      title: "Industry Knowledge",
      description: "Stay updated with industry trends",
      links: [
        {
          title: "Hacker News",
          url: "https://news.ycombinator.com/",
          description: "Tech news and discussions"
        },
        {
          title: "TechCrunch",
          url: "https://techcrunch.com/",
          description: "Technology news and analysis"
        },
        {
          title: "Dev.to",
          url: "https://dev.to/",
          description: "Developer community and articles"
        }
      ]
    },
    {
      title: "Personal Branding",
      description: "Build your professional brand",
      links: [
        {
          title: "Personal Website Guide",
          url: "https://www.freecodecamp.org/news/how-to-build-a-developer-portfolio-website/",
          description: "Create a developer portfolio"
        },
        {
          title: "Technical Blogging",
          url: "https://www.freecodecamp.org/news/how-to-write-a-great-technical-blog-post-414c414b67f6/",
          description: "Guide to technical writing"
        },
        {
          title: "Speaking at Conferences",
          url: "https://speaking.io/",
          description: "Public speaking tips for developers"
        }
      ]
    },
    {
      title: "Work-Life Balance",
      description: "Resources for maintaining healthy work-life balance",
      links: [
        {
          title: "Developer Health",
          url: "https://www.developerhealth.guide/",
          description: "Health guide for developers"
        },
        {
          title: "Burnout Prevention",
          url: "https://www.mindtools.com/pages/article/avoiding-burnout.htm",
          description: "Strategies to prevent burnout"
        },
        {
          title: "Remote Work Balance",
          url: "https://about.gitlab.com/company/culture/all-remote/mental-health/",
          description: "Mental health in remote work"
        }
      ]
    }
  ]

  return (
    <PageContainer>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Career Development Resources</h1>
          <p className="text-muted-foreground">
            Resources to help you grow professionally and advance your career in tech
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
            <h2 className="text-xl font-semibold mb-2">Track Your Progress</h2>
            <p className="text-muted-foreground mb-4">
              Use our tools to help guide your career development journey
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/resume">Resume Builder</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/interview">Interview Practice</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default CareerResourcesPage
