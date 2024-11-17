import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/page-container"

const ResourcesPage = () => {
  const resourceCategories = [
    {
      title: "Resume Writing",
      description: "Expert tips, templates, and guides for crafting an effective resume",
      href: "/resources/resume",
    },
    {
      title: "Interview Preparation",
      description: "Common interview questions, preparation strategies, and best practices",
      href: "/resources/interview",
    },
    {
      title: "Job Search",
      description: "Job search strategies, networking tips, and career planning resources",
      href: "/resources/job-search",
    },
    {
      title: "Technical Skills",
      description: "Programming resources, coding practice, and technical interview prep",
      href: "/resources/technical",
    },
    {
      title: "Career Development",
      description: "Professional growth, skill development, and career advancement resources",
      href: "/resources/career",
    },
    {
      title: "Salary Negotiation",
      description: "Salary research, negotiation strategies, and compensation guides",
      href: "/resources/salary",
    }
  ]

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Career Resources</h1>
          <p className="text-muted-foreground">
            Comprehensive resources to help you succeed in your job search and career development
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resourceCategories.map((category) => (
            <Card key={category.title} className="p-6">
              <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
              <p className="text-muted-foreground mb-4">{category.description}</p>
              <Button asChild>
                <Link href={category.href}>View Resources</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}

export default ResourcesPage
