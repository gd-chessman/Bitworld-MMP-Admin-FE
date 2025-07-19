import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserTable } from "@/components/user-table"
import { Search } from "lucide-react"

export default function UsersPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
        <p className="text-muted-foreground">Manage your system users, roles and permissions.</p>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>A list of all users in your system.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search users..." className="pl-8 w-full md:max-w-sm" />
            </div>
          </div>
          <UserTable />
        </CardContent>
      </Card>
    </div>
  )
}
