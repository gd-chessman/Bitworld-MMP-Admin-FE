"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type User = {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "pending"
  lastActive: string
  avatar: string
}

const data: User[] = [
  {
    id: "1",
    name: "Olivia Martinez",
    email: "olivia.martinez@email.com",
    role: "Admin",
    status: "active",
    lastActive: "Just now",
    avatar: "/diverse-woman-portrait.png",
  },
  {
    id: "2",
    name: "Thomas Lee",
    email: "thomas.lee@email.com",
    role: "User",
    status: "active",
    lastActive: "2 hours ago",
    avatar: "/thoughtful-man.png",
  },
  {
    id: "3",
    name: "Lisa Nguyen",
    email: "lisa.nguyen@email.com",
    role: "Editor",
    status: "active",
    lastActive: "3 hours ago",
    avatar: "/woman-with-glasses.png",
  },
  {
    id: "4",
    name: "Peter Kim",
    email: "peter.kim@email.com",
    role: "User",
    status: "inactive",
    lastActive: "2 days ago",
    avatar: "/bearded-man-portrait.png",
  },
  {
    id: "5",
    name: "Tara Harris",
    email: "tara.harris@email.com",
    role: "User",
    status: "pending",
    lastActive: "1 week ago",
    avatar: "/red-haired-woman.png",
  },
  {
    id: "6",
    name: "Michael Johnson",
    email: "michael.johnson@email.com",
    role: "User",
    status: "active",
    lastActive: "5 hours ago",
    avatar: "",
  },
  {
    id: "7",
    name: "Sarah Williams",
    email: "sarah.williams@email.com",
    role: "Editor",
    status: "active",
    lastActive: "1 day ago",
    avatar: "",
  },
  {
    id: "8",
    name: "David Brown",
    email: "david.brown@email.com",
    role: "User",
    status: "inactive",
    lastActive: "3 days ago",
    avatar: "",
  },
  {
    id: "9",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    role: "User",
    status: "pending",
    lastActive: "2 weeks ago",
    avatar: "",
  },
  {
    id: "10",
    name: "James Wilson",
    email: "james.wilson@email.com",
    role: "User",
    status: "active",
    lastActive: "12 hours ago",
    avatar: "",
  },
]

export function UserTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-primary/10">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return <div>{role}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant={status === "active" ? "default" : status === "inactive" ? "secondary" : "outline"}
            className={status === "active" ? "bg-emerald-500" : status === "inactive" ? "bg-slate-500" : "bg-amber-500"}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "lastActive",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Last Active
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of{" "}
          {data.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
