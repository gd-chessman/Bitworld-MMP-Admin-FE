"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const lineData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 500 },
  { name: "Apr", value: 280 },
  { name: "May", value: 590 },
  { name: "Jun", value: 320 },
  { name: "Jul", value: 600 },
  { name: "Aug", value: 420 },
  { name: "Sep", value: 550 },
  { name: "Oct", value: 410 },
  { name: "Nov", value: 530 },
  { name: "Dec", value: 620 },
]

const areaData = [
  { name: "Jan", desktop: 400, mobile: 240, tablet: 180 },
  { name: "Feb", desktop: 300, mobile: 198, tablet: 210 },
  { name: "Mar", desktop: 520, mobile: 380, tablet: 230 },
  { name: "Apr", desktop: 400, mobile: 300, tablet: 250 },
  { name: "May", desktop: 700, mobile: 620, tablet: 350 },
  { name: "Jun", desktop: 500, mobile: 380, tablet: 270 },
  { name: "Jul", desktop: 600, mobile: 420, tablet: 310 },
  { name: "Aug", desktop: 700, mobile: 550, tablet: 330 },
  { name: "Sep", desktop: 800, mobile: 590, tablet: 390 },
  { name: "Oct", desktop: 700, mobile: 480, tablet: 360 },
  { name: "Nov", desktop: 900, mobile: 700, tablet: 420 },
  { name: "Dec", desktop: 1100, mobile: 850, tablet: 500 },
]

const pieData = [
  { name: "Desktop", value: 54.4 },
  { name: "Mobile", value: 32.8 },
  { name: "Tablet", value: 12.8 },
]

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

export function DashboardCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4 dashboard-card">
        <CardHeader className="pb-2">
          <CardTitle>Traffic Analysis</CardTitle>
          <CardDescription>Website traffic by device type over the last year</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="area">
            <TabsList className="mb-4">
              <TabsTrigger value="area">Area</TabsTrigger>
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
            </TabsList>
            <TabsContent value="area">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={areaData}
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
                    dataKey="desktop"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                  />
                  <Area
                    type="monotone"
                    dataKey="mobile"
                    stackId="1"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                  />
                  <Area
                    type="monotone"
                    dataKey="tablet"
                    stackId="1"
                    stroke="hsl(var(--chart-3))"
                    fill="hsl(var(--chart-3))"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="line">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={lineData}
                  margin={{
                    top: 5,
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
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="bar">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={areaData}
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
                  <Bar dataKey="desktop" stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mobile" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tablet" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card className="col-span-3 dashboard-card">
        <CardHeader className="pb-2">
          <CardTitle>Traffic Distribution</CardTitle>
          <CardDescription>Traffic by device type (percentage)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="hsl(var(--chart-1))"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
