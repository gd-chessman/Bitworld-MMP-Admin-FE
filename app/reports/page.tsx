import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, BarChart, Users, Calendar } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">Generate and download reports for your system.</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="user">User Reports</TabsTrigger>
          <TabsTrigger value="system">System Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "User Activity Report",
                description: "User login and activity statistics",
                icon: Users,
                color: "bg-blue-500/10 text-blue-500",
              },
              {
                title: "System Performance Report",
                description: "Server performance and uptime metrics",
                icon: BarChart,
                color: "bg-purple-500/10 text-purple-500",
              },
              {
                title: "Monthly Summary Report",
                description: "Monthly overview of all system metrics",
                icon: Calendar,
                color: "bg-emerald-500/10 text-emerald-500",
              },
              {
                title: "User Growth Report",
                description: "New user registration trends",
                icon: Users,
                color: "bg-amber-500/10 text-amber-500",
              },
              {
                title: "Error Log Report",
                description: "System errors and exceptions summary",
                icon: FileText,
                color: "bg-rose-500/10 text-rose-500",
              },
              {
                title: "Security Audit Report",
                description: "Security events and authentication logs",
                icon: FileText,
                color: "bg-indigo-500/10 text-indigo-500",
              },
            ].map((report, index) => (
              <Card key={index} className="dashboard-card">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${report.color}`}>
                      <report.icon className="h-5 w-5" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="mt-4">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                    <Button size="sm">Generate</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "User Activity Report",
                description: "User login and activity statistics",
                icon: Users,
                color: "bg-blue-500/10 text-blue-500",
              },
              {
                title: "User Growth Report",
                description: "New user registration trends",
                icon: Users,
                color: "bg-amber-500/10 text-amber-500",
              },
              {
                title: "User Roles Report",
                description: "Distribution of users by role",
                icon: Users,
                color: "bg-emerald-500/10 text-emerald-500",
              },
            ].map((report, index) => (
              <Card key={index} className="dashboard-card">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${report.color}`}>
                      <report.icon className="h-5 w-5" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="mt-4">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                    <Button size="sm">Generate</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "System Performance Report",
                description: "Server performance and uptime metrics",
                icon: BarChart,
                color: "bg-purple-500/10 text-purple-500",
              },
              {
                title: "Error Log Report",
                description: "System errors and exceptions summary",
                icon: FileText,
                color: "bg-rose-500/10 text-rose-500",
              },
              {
                title: "Security Audit Report",
                description: "Security events and authentication logs",
                icon: FileText,
                color: "bg-indigo-500/10 text-indigo-500",
              },
            ].map((report, index) => (
              <Card key={index} className="dashboard-card">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${report.color}`}>
                      <report.icon className="h-5 w-5" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="mt-4">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                    <Button size="sm">Generate</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create a custom report by selecting metrics and date ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use the custom report builder to create tailored reports with specific metrics, date ranges, and
                  visualization options.
                </p>
                <Button>Create Custom Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
