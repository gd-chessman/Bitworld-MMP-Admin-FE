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
  Bar,
  BarChart,
} from "recharts"

const serverLoad = [
  { time: "00:00", cpu: 20, memory: 30, disk: 10 },
  { time: "04:00", cpu: 15, memory: 25, disk: 10 },
  { time: "08:00", cpu: 40, memory: 45, disk: 12 },
  { time: "12:00", cpu: 70, memory: 65, disk: 15 },
  { time: "16:00", cpu: 85, memory: 70, disk: 18 },
  { time: "20:00", cpu: 60, memory: 55, disk: 15 },
  { time: "24:00", cpu: 25, memory: 35, disk: 12 },
]

const responseTime = [
  { endpoint: "/api/users", time: 120 },
  { endpoint: "/api/auth", time: 80 },
  { endpoint: "/api/dashboard", time: 200 },
  { endpoint: "/api/analytics", time: 250 },
  { endpoint: "/api/reports", time: 180 },
  { endpoint: "/api/settings", time: 90 },
]

const errorRate = [
  { date: "Mon", rate: 0.5 },
  { date: "Tue", rate: 0.7 },
  { date: "Wed", rate: 0.3 },
  { date: "Thu", rate: 0.2 },
  { date: "Fri", rate: 0.4 },
  { date: "Sat", rate: 0.3 },
  { date: "Sun", rate: 0.2 },
]

export function SystemPerformance() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-3 dashboard-card">
        <CardHeader>
          <CardTitle>Server Load</CardTitle>
          <CardDescription>CPU, memory, and disk usage over 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={serverLoad}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                formatter={(value) => [`${value}%`, ""]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="hsl(var(--chart-1))"
                activeDot={{ r: 8 }}
                name="CPU Usage"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="memory"
                stroke="hsl(var(--chart-2))"
                activeDot={{ r: 8 }}
                name="Memory Usage"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="disk"
                stroke="hsl(var(--chart-3))"
                activeDot={{ r: 8 }}
                name="Disk I/O"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2 dashboard-card">
        <CardHeader>
          <CardTitle>API Response Time</CardTitle>
          <CardDescription>Average response time by endpoint (ms)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={responseTime}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="endpoint" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                formatter={(value) => [`${value} ms`, "Response Time"]}
              />
              <Legend />
              <Bar dataKey="time" name="Response Time (ms)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Error Rate</CardTitle>
          <CardDescription>Daily error rate percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={errorRate}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
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
                formatter={(value) => [`${value}%`, "Error Rate"]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--destructive))"
                fill="hsl(var(--destructive) / 0.2)"
                name="Error Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
