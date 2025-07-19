"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const data = [
  { name: "Jan", users: 400, sessions: 2400, pageViews: 9800 },
  { name: "Feb", users: 300, sessions: 1398, pageViews: 3908 },
  { name: "Mar", users: 500, sessions: 3400, pageViews: 10800 },
  { name: "Apr", users: 450, sessions: 2800, pageViews: 9300 },
  { name: "May", users: 650, sessions: 3900, pageViews: 12100 },
  { name: "Jun", users: 700, sessions: 4200, pageViews: 13200 },
  { name: "Jul", users: 750, sessions: 4500, pageViews: 14500 },
  { name: "Aug", users: 800, sessions: 4800, pageViews: 15000 },
  { name: "Sep", users: 850, sessions: 5100, pageViews: 16200 },
  { name: "Oct", users: 900, sessions: 5400, pageViews: 17800 },
  { name: "Nov", users: 950, sessions: 5700, pageViews: 18500 },
  { name: "Dec", users: 1000, sessions: 6000, pageViews: 20000 },
]

const deviceData = [
  { name: "Desktop", value: 45 },
  { name: "Mobile", value: 40 },
  { name: "Tablet", value: 15 },
]

const locationData = [
  { name: "United States", value: 35 },
  { name: "United Kingdom", value: 15 },
  { name: "Germany", value: 12 },
  { name: "France", value: 8 },
  { name: "Canada", value: 7 },
  { name: "Others", value: 23 },
]

export function AnalyticsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-3 dashboard-card">
        <CardHeader>
          <CardTitle>User Engagement Overview</CardTitle>
          <CardDescription>Monthly user engagement metrics for the current year</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
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
                dataKey="users"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stackId="2"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
              />
              <Area
                type="monotone"
                dataKey="pageViews"
                stackId="3"
                stroke="hsl(var(--chart-3))"
                fill="hsl(var(--chart-3))"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Device Distribution</CardTitle>
          <CardDescription>User access by device type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={deviceData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar dataKey="value" name="Percentage" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2 dashboard-card">
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>User distribution by country</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={locationData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar dataKey="value" name="Percentage" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
