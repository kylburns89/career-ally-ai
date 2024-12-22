"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Database } from "../../types/database"
import { ApplicationAnalytics } from "../../types/application"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

interface ApplicationTrend {
  month: string
  count: number
  offers: number
  rejections: number
}

export function ApplicationAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null)
  const [applicationTrends, setApplicationTrends] = useState<ApplicationTrend[]>([])
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchApplicationsAndCalculateAnalytics = async () => {
      // Fetch all applications
      const { data: applications, error } = await supabase
        .from("applications")
        .select("*")
        .order("applied_date", { ascending: true })

      if (error) {
        console.error("Error fetching applications:", error)
        return
      }

      // Calculate analytics
      const total = applications.length
      const offers = applications.filter(app => app.status === "offer").length
      const rejections = applications.filter(app => app.status === "rejected").length
      const interviewing = applications.filter(app => app.status === "interviewing").length
      
      // Calculate average response time
      const responseTimes = applications
        .filter(app => app.response_date)
        .map(app => {
          const appliedDate = new Date(app.applied_date)
          const responseDate = new Date(app.response_date!)
          return (responseDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24) // Convert to days
        })
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : null

      // Calculate average salary offered
      const salaries = applications
        .filter(app => app.salary_offered)
        .map(app => app.salary_offered!)
      const avgSalary = salaries.length > 0
        ? salaries.reduce((a, b) => a + b, 0) / salaries.length
        : null

      // Calculate average interview rounds
      const interviewRounds = applications
        .filter(app => app.interview_rounds > 0)
        .map(app => app.interview_rounds)
      const avgInterviewRounds = interviewRounds.length > 0
        ? interviewRounds.reduce((a, b) => a + b, 0) / interviewRounds.length
        : null

      // Calculate rates
      const interviewRate = total > 0 ? (interviewing + offers + rejections) / total * 100 : 0
      const offerRate = total > 0 ? (offers / total) * 100 : 0

      setAnalytics({
        user_id: "", // Not needed for display
        total_applications: total,
        offers_received: offers,
        rejections: rejections,
        in_interview_process: interviewing,
        avg_response_time_days: avgResponseTime,
        avg_salary_offered: avgSalary,
        avg_interview_rounds: avgInterviewRounds,
        interview_rate: interviewRate,
        offer_conversion_rate: offerRate
      })

      // Calculate trends
      const trends = applications.reduce((acc: ApplicationTrend[], curr) => {
        const month = new Date(curr.applied_date).toLocaleString("default", {
          month: "short",
          year: "numeric",
        })
        const existing = acc.find((x) => x.month === month)
        if (existing) {
          existing.count++
          if (curr.status === "offer") existing.offers++
          if (curr.status === "rejected") existing.rejections++
        } else {
          acc.push({
            month,
            count: 1,
            offers: curr.status === "offer" ? 1 : 0,
            rejections: curr.status === "rejected" ? 1 : 0,
          })
        }
        return acc
      }, [])

      setApplicationTrends(trends)
    }

    fetchApplicationsAndCalculateAnalytics()
  }, [supabase])

  if (!analytics) {
    return <div>Loading analytics...</div>
  }

  const statusData = [
    { name: "Applied", value: analytics.total_applications - analytics.in_interview_process - analytics.offers_received - analytics.rejections },
    { name: "Interviewing", value: analytics.in_interview_process },
    { name: "Offers", value: analytics.offers_received },
    { name: "Rejected", value: analytics.rejections },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_applications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.offer_conversion_rate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.interview_rate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avg_response_time_days?.toFixed(1) || "N/A"} days
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={applicationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    name="Applications"
                  />
                  <Line
                    type="monotone"
                    dataKey="offers"
                    stroke="#82ca9d"
                    name="Offers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Average Interview Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avg_interview_rounds?.toFixed(1) || "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Salary Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avg_salary_offered
                ? `$${analytics.avg_salary_offered.toLocaleString()}`
                : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.in_interview_process}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
