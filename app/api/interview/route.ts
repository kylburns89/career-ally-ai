import { NextResponse } from "next/server"
import { createChatCompletion } from "@/lib/openai"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const getSystemPrompt = (role: string) => {
  const basePrompt = `You are an experienced technical interviewer conducting a software engineering interview for a ${role} position. Follow these rules:

1. Start with a brief introduction and an initial technical question
2. Ask one question at a time
3. Evaluate the candidate's response and provide brief feedback
4. Follow-up with related questions based on their response
5. Keep responses concise and focused
6. End the interview naturally after a reasonable number of questions

Focus on topics relevant to ${role}, such as:`

  const roleSpecificTopics: Record<string, string[]> = {
    "Frontend Developer": [
      "React, Vue, or Angular frameworks",
      "HTML5, CSS3, and modern JavaScript",
      "State management and component lifecycle",
      "Browser APIs and performance optimization",
      "Responsive design and CSS frameworks",
      "Web accessibility and SEO best practices"
    ],
    "Backend Developer": [
      "API design and REST principles",
      "Database design and optimization",
      "Server-side frameworks",
      "Authentication and authorization",
      "Caching strategies",
      "Microservices architecture"
    ],
    "Full Stack Developer": [
      "Frontend and backend technologies",
      "Database management",
      "API integration",
      "Full application lifecycle",
      "DevOps basics",
      "System architecture"
    ],
    "DevOps Engineer": [
      "CI/CD pipelines",
      "Container orchestration",
      "Infrastructure as Code",
      "Cloud platforms (AWS, Azure, GCP)",
      "Monitoring and logging",
      "Security best practices"
    ],
    "Mobile Developer": [
      "Native app development",
      "Cross-platform frameworks",
      "Mobile UI/UX principles",
      "App lifecycle management",
      "Mobile security",
      "Performance optimization"
    ],
    "Data Engineer": [
      "Data pipelines and ETL processes",
      "Big data technologies",
      "Data warehousing",
      "SQL and NoSQL databases",
      "Data modeling",
      "Data security and governance"
    ],
    "Machine Learning Engineer": [
      "ML algorithms and models",
      "Deep learning frameworks",
      "Feature engineering",
      "Model deployment and scaling",
      "MLOps practices",
      "Data preprocessing"
    ],
    "Software Engineer": [
      "Data structures and algorithms",
      "System design",
      "Programming concepts",
      "Problem-solving methodology",
      "Best practices and design patterns",
      "Previous project experience"
    ]
  }

  // For custom roles, provide a mix of general and role-specific topics
  const getCustomRoleTopics = (role: string) => [
    `Core ${role} responsibilities and skills`,
    "Problem-solving and technical approach",
    "Relevant technologies and tools",
    "Best practices in your field",
    "System design and architecture",
    "Previous project experience",
    "Collaboration and communication",
    "Industry knowledge and trends"
  ]

  const topics = roleSpecificTopics[role] || getCustomRoleTopics(role)
  const topicsString = topics.map(topic => `- ${topic}`).join("\n")

  return `${basePrompt}\n${topicsString}\n\nMaintain a professional and constructive tone throughout the interview. For this ${role} position, adapt questions to focus on relevant technical skills and experience while maintaining a balanced assessment of both specific domain knowledge and general software engineering principles.`
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const body = await req.json()
    const { action, message, role } = body

    if (action === "start") {
      const completion = await createChatCompletion(
        [
          { role: "system", content: getSystemPrompt(role) },
          { role: "user", content: "Let's start the interview." }
        ],
        "gpt-4o-mini",
        userId
      )

      return NextResponse.json({
        message: completion.choices[0].message.content
      })
    }

    // Handle ongoing interview conversation
    const completion = await createChatCompletion(
      [
        { role: "system", content: getSystemPrompt(role) },
        { role: "user", content: message }
      ],
      "gpt-4o-mini",
      userId
    )

    return NextResponse.json({
      message: completion.choices[0].message.content
    })

  } catch (error: any) {
    console.error("Interview API error:", error)
    if (error.message === 'Rate limit exceeded. Please try again later.') {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { error: "Failed to process interview request" },
      { status: 500 }
    )
  }
}
