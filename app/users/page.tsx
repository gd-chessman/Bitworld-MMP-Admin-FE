"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogFooter as ConfirmDialogFooter } from "@/components/ui/dialog"
import { 
  Users, 
  UserPlus, 
  Trash, 
  Search, 
  ChevronLeft,
  Shield,
  Clock,
  Mail
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createUser, getUsers, getUserStats, deleteUser } from "@/services/api/UserAdminService"
import { toast } from "sonner"
import { useLang } from "@/lang/useLang"



export default function UsersPage() {
  const { t } = useLang()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  // Form dialog state
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    role: "partner"
  })
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simple validation
    if (!form.username || !form.password || !form.email || !form.role) {
      setFormError("Please fill all fields.");
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    setFormError("")
    setIsSubmitting(true)
    try {
      const res = await createUser(form)
      toast.success("User created successfully!")
      setOpenDialog(false)
      setForm({ username: "", password: "", email: "", role: "partner" })
    } catch (err) {
      toast.error("Failed to create user!")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch users with useQuery
  const {
    data: usersRes,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["users", currentPage, itemsPerPage, roleFilter, searchTerm],
    queryFn: () => {
      if (roleFilter === "all" && !searchTerm) {
        return getUsers(currentPage, itemsPerPage);
      } else if (roleFilter === "all") {
        return getUsers(currentPage, itemsPerPage, undefined, searchTerm);
      } else if (!searchTerm) {
        return getUsers(currentPage, itemsPerPage, roleFilter);
      } else {
        return getUsers(currentPage, itemsPerPage, roleFilter, searchTerm);
      }
    }
  })

  // Lấy dữ liệu thống kê user
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["user-stats"],
    queryFn: getUserStats
  });

  // Dùng trực tiếp dữ liệu trả về từ API
  const filteredUsers: any[] = (usersRes && (usersRes as any).data) ? (usersRes as any).data : [];

  // Pagination info
  const paginationData = usersRes && (usersRes as any).pagination ? (usersRes as any).pagination : { page: 1, limit: itemsPerPage, total: filteredUsers.length, totalPages: 1 };
  const totalUsers = paginationData.total;
  const totalPages = paginationData.totalPages;
  const startIndex = ((paginationData.page || 1) - 1) * (paginationData.limit || itemsPerPage);
  const endIndex = startIndex + filteredUsers.length;


  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">{t('users.roles.admin')}</Badge>;
      case "member":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">{t('users.roles.member')}</Badge>;
      case "partner":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">{t('users.roles.partner')}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">{t('users.title')}</h2>
        <p className="text-muted-foreground">{t('users.description')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.stats.totalUsers')}</p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {statsLoading ? '...' : stats?.total ?? '--'}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.roles.admin')}</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {statsLoading ? '...' : stats?.byRole?.admin ?? '--'}
                </p>
              </div>
              <Shield className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.roles.member')}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {statsLoading ? '...' : stats?.byRole?.member ?? '--'}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.roles.partner')}</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {statsLoading ? '...' : stats?.byRole?.partner ?? '--'}
                </p>
              </div>
              <Users className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.stats.newThisWeek')}</p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {statsLoading ? '...' : stats?.createdLast7Days ?? '--'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="dashboard-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-black dark:text-white font-bold">{t('users.cardTitle')}</CardTitle>
              <CardDescription>{t('users.cardDescription')}</CardDescription>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('users.addUser.addButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('users.addUser.title')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">{t('users.addUser.username')}</label>
                    <Input
                      value={form.username}
                      onChange={e => handleFormChange("username", e.target.value)}
                      placeholder={t('users.addUser.usernamePlaceholder')}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">{t('users.addUser.password')}</label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={e => handleFormChange("password", e.target.value)}
                      placeholder={t('users.addUser.passwordPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">{t('users.addUser.email')}</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={e => handleFormChange("email", e.target.value)}
                      placeholder={t('users.addUser.emailPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">{t('users.addUser.role')}</label>
                    <Select value={form.role} onValueChange={v => handleFormChange("role", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('users.addUser.rolePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">{t('users.roles.member')}</SelectItem>
                        <SelectItem value="partner">{t('users.roles.partner')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formError && <div className="text-red-500 text-sm">{formError}</div>}
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium" disabled={isSubmitting}>
                      {isSubmitting ? t('users.addUser.adding') : t('users.addUser.addButton')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder={t('users.searchPlaceholder')} 
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <Shield className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('users.table.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('users.table.role')}</SelectItem>
                <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                <SelectItem value="member">{t('users.roles.member')}</SelectItem>
                <SelectItem value="partner">{t('users.roles.partner')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-20 border-b">
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{t('users.table.username')}</TableHead>
                  <TableHead>{t('users.table.email')}</TableHead>
                  <TableHead>{t('users.table.role')}</TableHead>
                  <TableHead>{t('users.table.createdAt')}</TableHead>
                  <TableHead>{t('users.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">{t('users.table.loading')}</TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">{t('users.table.noUsersFound')}</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: any, idx: number) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{startIndex + idx + 1}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-black dark:text-white">{user.username}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-muted-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}</TableCell>
                      <TableCell>
                        {user.role !== "admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-destructive"
                            disabled={deletingId === user.id}
                            onClick={() => setConfirmDeleteId(user.id)}
                            title={t('users.deleteUser.title')}
                          >
                            <Trash className="h-5 w-5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog xác nhận xoá user */}
      <ConfirmDialog open={!!confirmDeleteId} onOpenChange={open => { if (!open) setConfirmDeleteId(null); }}>
        <ConfirmDialogContent>
          <ConfirmDialogHeader>
            <ConfirmDialogTitle>{t('users.deleteUser.title')}</ConfirmDialogTitle>
          </ConfirmDialogHeader>
          <div className="py-2 text-muted-foreground">{t('users.deleteUser.description')}</div>
          <ConfirmDialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={!!deletingId}>{t('users.deleteUser.cancel')}</Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                if (!confirmDeleteId || deletingId) return;
                setDeletingId(confirmDeleteId);
                try {
                  await deleteUser(confirmDeleteId);
                  toast.success(t('users.deleteUser.success'));
                  setConfirmDeleteId(null);
                  refetch();
                } catch (err) {
                  toast.error(t('users.deleteUser.error'));
                } finally {
                  setDeletingId(null);
                }
              }}
              disabled={!!deletingId}
            >
              {deletingId ? t('users.deleteUser.deleting') : t('users.deleteUser.deleteButton')}
            </Button>
          </ConfirmDialogFooter>
        </ConfirmDialogContent>
      </ConfirmDialog>
    </div>
  )
}
