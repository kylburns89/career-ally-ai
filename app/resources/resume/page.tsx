import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/page-container"

const ResumeResourcesPage = () => {
  const resources = [
    {
      title: "Resume Writing Guide",
      description: "Learn how to write an effective resume that stands out",
      links: [
        {
          title: "Resume Writing Best Practices",
          url: "https://www.indeed.com/career-advice/resumes-cover-letters/resume-writing-guide",
          description: "Comprehensive guide on resume writing fundamentals"
        },
        {
          title: "Action Words for Your Resume",
          url: "https://www.harvard.edu/careers/resources/resumes-cvs-cover-letters/action-verbs/",
          description: "Strong action verbs to make your resume more impactful"
        },
        {
          title: "Resume Examples by Industry",
          url: "https://www.themuse.com/advice/resume-examples-by-industry",
          description: "Industry-specific resume examples and templates"
        }
      ]
    },
    {
      title: "ATS Optimization",
      description: "Tips for optimizing your resume for Applicant Tracking Systems",
      links: [
        {
          title: "ATS Resume Tips",
          url: "https://www.jobscan.co/blog/ats-friendly-resume/",
          description: "How to make your resume ATS-friendly"
        },
        {
          title: "Resume Keywords Guide",
          url: "https://www.glassdoor.com/blog/guide/resume-keywords/",
          description: "How to use the right keywords in your resume"
        }
      ]
    },
    {
      title: "Resume Formatting",
      description: "Guidelines for professional resume formatting",
      links: [
        {
          title: "Resume Format Guide",
          url: "https://www.linkedin.com/business/talent/blog/talent-acquisition/resume-format-guide",
          description: "Different resume formats and when to use them"
        },
        {
          title: "Resume Design Tips",
          url: "https://enhancv.com/blog/resume-design/",
          description: "Visual design principles for resumes"
        }
      ]
    },
    {
      title: "Technical Resumes",
      description: "Specific guidance for technical and software engineering resumes",
      links: [
        {
          title: "Software Engineer Resume Guide",
          url: "https://www.freecodecamp.org/news/writing-a-killer-software-engineering-resume/",
          description: "How to write an effective software engineering resume"
        },
        {
          title: "Technical Skills Section",
          url: "https://www.dice.com/career-advice/how-to-write-technical-skills-section",
          description: "How to present technical skills effectively"
        }
      ]
    }
  ]

  return (
    <PageContainer>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resume Writing Resources</h1>
          <p className="text-muted-foreground">
            Comprehensive resources to help you create an effective and professional resume
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
            <h2 className="text-xl font-semibold mb-2">Need More Help?</h2>
            <p className="text-muted-foreground mb-4">
              Use our resume builder tool to create a professional resume with expert guidance
            </p>
            <Button asChild>
              <Link href="/resume">Go to Resume Builder</Link>
            </Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default ResumeResourcesPage
