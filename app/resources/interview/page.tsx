import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/page-container"

const InterviewResourcesPage = () => {
  const resources = [
    {
      title: "Technical Interview Preparation",
      description: "Resources for preparing for technical interviews",
      links: [
        {
          title: "LeetCode",
          url: "https://leetcode.com/",
          description: "Practice coding problems and learn algorithms"
        },
        {
          title: "System Design Primer",
          url: "https://github.com/donnemartin/system-design-primer",
          description: "Learn how to design large-scale systems"
        },
        {
          title: "Frontend Interview Handbook",
          url: "https://frontendinterviewhandbook.com/",
          description: "Comprehensive guide for frontend interviews"
        }
      ]
    },
    {
      title: "Behavioral Interviews",
      description: "Prepare for behavioral and situational questions",
      links: [
        {
          title: "STAR Method Guide",
          url: "https://www.themuse.com/advice/star-interview-method",
          description: "How to structure your behavioral interview responses"
        },
        {
          title: "Common Behavioral Questions",
          url: "https://www.indeed.com/career-advice/interviewing/most-common-behavioral-interview-questions",
          description: "Practice answering common behavioral questions"
        },
        {
          title: "Leadership Examples",
          url: "https://www.glassdoor.com/blog/guide/leadership-interview-questions/",
          description: "How to discuss leadership experience in interviews"
        }
      ]
    },
    {
      title: "Interview Best Practices",
      description: "General interview tips and strategies",
      links: [
        {
          title: "Interview Research Tips",
          url: "https://www.linkedin.com/business/talent/blog/talent-acquisition/how-to-research-company-before-interview",
          description: "How to research a company before an interview"
        },
        {
          title: "Questions to Ask Interviewers",
          url: "https://www.themuse.com/advice/51-interview-questions-you-should-be-asking",
          description: "Smart questions to ask during your interview"
        },
        {
          title: "Virtual Interview Tips",
          url: "https://www.indeed.com/career-advice/interviewing/virtual-interview-tips",
          description: "How to succeed in virtual interviews"
        }
      ]
    },
    {
      title: "System Design Interviews",
      description: "Resources for system design interview preparation",
      links: [
        {
          title: "System Design Interview Guide",
          url: "https://www.educative.io/blog/complete-guide-system-design-interview",
          description: "Comprehensive guide to system design interviews"
        },
        {
          title: "Grokking System Design",
          url: "https://github.com/donnemartin/system-design-primer#how-to-approach-a-system-design-interview-question",
          description: "Step-by-step approach to system design questions"
        }
      ]
    },
    {
      title: "Salary Negotiation",
      description: "Tips for negotiating your compensation package",
      links: [
        {
          title: "Salary Negotiation Guide",
          url: "https://www.kalzumeus.com/2012/01/23/salary-negotiation/",
          description: "Comprehensive guide to salary negotiation"
        },
        {
          title: "Negotiation Scripts",
          url: "https://www.levels.fyi/blog/salary-negotiation-scripts-tech-companies.html",
          description: "Example scripts for negotiation conversations"
        }
      ]
    }
  ]

  return (
    <PageContainer>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Interview Resources</h1>
          <p className="text-muted-foreground">
            Comprehensive resources to help you prepare for technical and behavioral interviews
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
            <h2 className="text-xl font-semibold mb-2">Practice Makes Perfect</h2>
            <p className="text-muted-foreground mb-4">
              Try our interview simulator to practice with AI-powered mock interviews
            </p>
            <Button asChild>
              <Link href="/interview">Go to Interview Simulator</Link>
            </Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default InterviewResourcesPage
