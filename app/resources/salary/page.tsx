import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/page-container"

const SalaryResourcesPage = () => {
  const resources = [
    {
      title: "Salary Research",
      description: "Tools for researching tech salaries",
      links: [
        {
          title: "Levels.fyi",
          url: "https://www.levels.fyi/",
          description: "Detailed tech compensation data by company and level"
        },
        {
          title: "Glassdoor Salaries",
          url: "https://www.glassdoor.com/Salaries/",
          description: "Salary information and company reviews"
        },
        {
          title: "Payscale",
          url: "https://www.payscale.com/",
          description: "Personalized salary research and comparisons"
        }
      ]
    },
    {
      title: "Negotiation Strategies",
      description: "Resources for salary negotiation",
      links: [
        {
          title: "Negotiation Guide",
          url: "https://www.kalzumeus.com/2012/01/23/salary-negotiation/",
          description: "Comprehensive salary negotiation strategy"
        },
        {
          title: "Ten Rules for Negotiating",
          url: "https://www.freecodecamp.org/news/ten-rules-for-negotiating-a-job-offer-ee17cccbdab6/",
          description: "Essential rules for job offer negotiation"
        },
        {
          title: "Negotiation Scripts",
          url: "https://www.levels.fyi/blog/salary-negotiation-scripts-tech-companies.html",
          description: "Example scripts for negotiation conversations"
        }
      ]
    },
    {
      title: "Total Compensation",
      description: "Understanding the full compensation package",
      links: [
        {
          title: "Stock Options Guide",
          url: "https://github.com/jlevy/og-equity-compensation",
          description: "Guide to equity compensation"
        },
        {
          title: "Benefits Guide",
          url: "https://www.themuse.com/advice/the-comprehensive-guide-to-negotiating-benefits",
          description: "Understanding and negotiating benefits"
        },
        {
          title: "RSU Calculator",
          url: "https://www.levels.fyi/stock-options-calculator/",
          description: "Calculate the value of RSUs and stock options"
        }
      ]
    },
    {
      title: "Market Research",
      description: "Understanding the tech job market",
      links: [
        {
          title: "Tech Market Trends",
          url: "https://www.dice.com/career-advice/salary-trends",
          description: "Latest trends in tech salaries"
        },
        {
          title: "Salary Reports",
          url: "https://www.stackoverflow.co/salary/calculator",
          description: "Stack Overflow salary calculator"
        },
        {
          title: "Location Factor",
          url: "https://www.numbeo.com/cost-of-living/",
          description: "Cost of living comparisons"
        }
      ]
    },
    {
      title: "Career Progression",
      description: "Understanding salary growth and career paths",
      links: [
        {
          title: "Career Ladders",
          url: "https://career-ladders.dev/",
          description: "Engineering career progression frameworks"
        },
        {
          title: "Promotion Guide",
          url: "https://www.managersclub.com/how-to-get-promoted/",
          description: "Strategies for getting promoted"
        },
        {
          title: "Salary Progression",
          url: "https://www.levels.fyi/blog/engineering-level-guide.html",
          description: "Understanding engineering levels and compensation"
        }
      ]
    },
    {
      title: "Remote Work Compensation",
      description: "Understanding remote work salary considerations",
      links: [
        {
          title: "Remote Salary Calculator",
          url: "https://www.levels.fyi/remote/",
          description: "Calculate remote work compensation"
        },
        {
          title: "Remote Work Guide",
          url: "https://about.gitlab.com/company/culture/all-remote/compensation/",
          description: "GitLab's guide to remote compensation"
        },
        {
          title: "Global Pay Data",
          url: "https://www.salary.com/research/salary/benchmark/software-engineer-salary",
          description: "International salary comparisons"
        }
      ]
    }
  ]

  return (
    <PageContainer>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Salary Resources</h1>
          <p className="text-muted-foreground">
            Resources to help you research salaries and negotiate compensation packages
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
            <h2 className="text-xl font-semibold mb-2">Get Personalized Guidance</h2>
            <p className="text-muted-foreground mb-4">
              Use our salary coach to get personalized compensation advice
            </p>
            <Button asChild>
              <Link href="/salary">Go to Salary Coach</Link>
            </Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default SalaryResourcesPage
