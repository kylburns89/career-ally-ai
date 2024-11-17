import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/page-container"

const TechnicalResourcesPage = () => {
  const resources = [
    {
      title: "Programming Fundamentals",
      description: "Core programming concepts and learning resources",
      links: [
        {
          title: "freeCodeCamp",
          url: "https://www.freecodecamp.org/",
          description: "Free courses covering web development, JavaScript, and more"
        },
        {
          title: "The Odin Project",
          url: "https://www.theodinproject.com/",
          description: "Full-stack curriculum with hands-on projects"
        },
        {
          title: "MDN Web Docs",
          url: "https://developer.mozilla.org/",
          description: "Comprehensive web development documentation"
        }
      ]
    },
    {
      title: "Data Structures & Algorithms",
      description: "Resources for learning DSA concepts",
      links: [
        {
          title: "Visualgo",
          url: "https://visualgo.net/",
          description: "Visualizing data structures and algorithms"
        },
        {
          title: "NeetCode",
          url: "https://neetcode.io/",
          description: "Structured approach to learning algorithms"
        },
        {
          title: "Big-O Cheat Sheet",
          url: "https://www.bigocheatsheet.com/",
          description: "Common data structures and their complexities"
        }
      ]
    },
    {
      title: "Coding Practice",
      description: "Platforms for practicing coding problems",
      links: [
        {
          title: "LeetCode",
          url: "https://leetcode.com/",
          description: "Practice coding problems and competitions"
        },
        {
          title: "HackerRank",
          url: "https://www.hackerrank.com/",
          description: "Coding challenges and skill assessments"
        },
        {
          title: "CodeWars",
          url: "https://www.codewars.com/",
          description: "Practice coding through challenges"
        }
      ]
    },
    {
      title: "System Design",
      description: "Resources for learning system design",
      links: [
        {
          title: "System Design Primer",
          url: "https://github.com/donnemartin/system-design-primer",
          description: "Study guide for system design concepts"
        },
        {
          title: "High Scalability",
          url: "http://highscalability.com/",
          description: "Real-world architecture case studies"
        },
        {
          title: "ByteByteGo",
          url: "https://bytebytego.com/",
          description: "Visual explanations of system design concepts"
        }
      ]
    },
    {
      title: "Modern Web Development",
      description: "Resources for frontend and backend development",
      links: [
        {
          title: "React Documentation",
          url: "https://react.dev/",
          description: "Official React documentation and tutorials"
        },
        {
          title: "Next.js Learn",
          url: "https://nextjs.org/learn",
          description: "Learn Next.js through interactive courses"
        },
        {
          title: "Full Stack Open",
          url: "https://fullstackopen.com/",
          description: "Modern web development curriculum"
        }
      ]
    },
    {
      title: "Developer Tools",
      description: "Essential tools and resources for developers",
      links: [
        {
          title: "GitHub Skills",
          url: "https://skills.github.com/",
          description: "Learn Git and GitHub fundamentals"
        },
        {
          title: "DevDocs",
          url: "https://devdocs.io/",
          description: "Unified documentation for developers"
        },
        {
          title: "Can I Use",
          url: "https://caniuse.com/",
          description: "Browser support tables for web features"
        }
      ]
    }
  ]

  return (
    <PageContainer>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Technical Resources</h1>
          <p className="text-muted-foreground">
            Comprehensive resources to help you build your technical skills and prepare for technical interviews
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
            <h2 className="text-xl font-semibold mb-2">Practice Your Skills</h2>
            <p className="text-muted-foreground mb-4">
              Try our technical challenge simulator to practice coding problems
            </p>
            <Button asChild>
              <Link href="/challenges">Go to Technical Challenges</Link>
            </Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default TechnicalResourcesPage
