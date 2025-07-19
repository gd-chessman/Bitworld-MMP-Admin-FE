"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from "recharts"

const dailyActiveUsers = [
  { day: "Mon", users: 120 },
  { day: "Tue", users: 140 },
  { day: "Wed", users: 180 },
  { day: "Thu", users: 190 },
  { day: "Fri", users: 210 },
  { day: "Sat", users: 170 },
  { day: "Sun", users: 150 },
]

const userRetention = [
  { week: "Week 1", retention: 100 },
  { week: "Week 2", retention: 80 },
  { week: "Week 3", retention: 70 },
  { week: "Week 4", retention: 65 },
  { week: "Week 5", retention: 60 },
  { week: "Week 6", retention: 55 },
  { week: "Week 7", retention: 52 },
  { week: "Week 8", retention: 50 },
]

const userEngagement = [
  { date: "2023-01", newUsers: 500, returningUsers: 200 },
  { date: "2023-02", newUsers: 600, returningUsers: 300 },
  { date: "2023-03", newUsers: 700, returningUsers: 400 },
  { date: "2023-04", newUsers: 800, returningUsers: 500 },
  { date: "2023-05", newUsers: 900, returningUsers: 600 },
  { date: "2023-06", newUsers: 1000, returningUsers: 700 },
]

export function UserActivity() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-3 dashboard-card">
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
          <CardDescription>New vs returning users over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={userEngagement}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="newUsers"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                name="New Users"
              />
              <Area
                type="monotone"
                dataKey="returningUsers"
                stackId="1"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                name="Returning Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Daily Active Users</CardTitle>
          <CardDescription>User activity by day of week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dailyActiveUsers}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="hsl(var(--chart-1))"
                activeDot={{ r: 8 }}
                name="Active Users"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2 dashboard-card">
        <CardHeader>
          <CardTitle>User Retention</CardTitle>
          <CardDescription>Weekly user retention rate</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={userRetention}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                formatter={(value) => [`${value}%`, "Retention Rate"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="retention"
                stroke="hsl(var(--chart-2))"
                activeDot={{ r: 8 }}
                name="Retention Rate"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
