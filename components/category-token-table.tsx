"use client"

import { useState, useEffect } from "react"
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
import { ArrowUpDown, Trash, CheckCircle2, XCircle, Eye, EyeOff, Pencil, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditableCell } from "@/components/editable-cell"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getCategoryToken, deleteCategoryToken, updateCategoryToken } from "@/services/api/CategorysTokenService"
import { toast } from "react-toastify"
import { useLang } from "@/lang/useLang"

type CategoryToken = {
  slct_id: number
  slct_name: string
  slct_slug: string
  slct_prioritize: "yes" | "no"
  sltc_status: "active" | "hidden"
  slct_created_at: string
  slct_updated_at: string
}

export function CategoryTokenTable({ searchQuery }: { searchQuery: string }) {
  const { t } = useLang()
  const queryClient = useQueryClient()
  const { data: categoryToken, refetch: refetchCategoryToken } = useQuery({
    queryKey: ["category-token", searchQuery],
    queryFn: () => getCategoryToken(searchQuery, 1, 100),
  });

  const [data, setData] = useState<CategoryToken[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [openAlert, setOpenAlert] = useState<{ [key: string]: boolean }>({})
  const [openEditModal, setOpenEditModal] = useState<{ [key: string]: boolean }>({})
  const [editForm, setEditForm] = useState<{ [key: string]: { name: string; slug: string } }>({})

  // Update data when API response changes
  useEffect(() => {
    if (categoryToken?.data) {
      setData(categoryToken.data)
    }
  }, [categoryToken])

  const updateCategoryField = async (id: number, field: keyof CategoryToken, value: string) => {
    try {
      // Update local state first for optimistic update
      setData((prev) =>
        prev.map((category) => {
          if (category.slct_id === id) {
            return { ...category, [field]: value }
          }
          return category
        }),
      )

      // Call API to update
      await updateCategoryToken({
        slct_id: id.toString(),
        [field]: value
      })

      // Invalidate and refetch the categories query
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
      toast.success(t('categories-token.table.categoryUpdated'))
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error(t('categories-token.table.updateFailed'))
      // Revert local state on error
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
    }
  }

  // Toggle prioritize value between "yes" and "no"
  const togglePrioritize = async (id: number) => {
    try {
      // Update local state first for optimistic update
      setData((prev) =>
        prev.map((category) => {
          if (category.slct_id === id) {
            const newValue = category.slct_prioritize === "yes" ? "no" : "yes"
            return { ...category, slct_prioritize: newValue }
          }
          return category
        }),
      )

      // Get the new value
      const category = data.find((c) => c.slct_id === id)
      if (!category) return

      // Call API to update
      await updateCategoryToken({
        slct_id: id.toString(),
        slct_prioritize: category.slct_prioritize === "yes" ? "no" : "yes"
      })

      // Invalidate and refetch the categories query
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
      toast.success(t('categories-token.table.prioritizeUpdated'))
    } catch (error) {
      console.error("Error updating category prioritize:", error)
      toast.error(t('categories-token.table.prioritizeFailed'))
      // Revert local state on error
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
    }
  }

  // Toggle status value between "active" and "hidden"
  const toggleStatus = async (id: number) => {
    try {
      // Update local state first for optimistic update
      setData((prev) =>
        prev.map((category) => {
          if (category.slct_id === id) {
            const newValue = category.sltc_status === "active" ? "hidden" : "active"
            return { ...category, sltc_status: newValue }
          }
          return category
        }),
      )

      // Get the new value
      const category = data.find((c) => c.slct_id === id)
      if (!category) return

      // Call API to update
      await updateCategoryToken({
        slct_id: id.toString(),
        sltc_status: category.sltc_status === "active" ? "hidden" : "active"
      })

      // Invalidate and refetch the categories query
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
      toast.success(t('categories-token.table.statusUpdated'))
    } catch (error) {
      console.error("Error updating category status:", error)
      toast.error(t('categories-token.table.statusFailed'))
      // Revert local state on error
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
    }
  }

  // Delete a category
  const deleteCategory = async (id: number) => {
    try {
      await deleteCategoryToken(id.toString())
      // Invalidate and refetch the categories query
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
      toast.success(t('categories-token.table.categoryDeleted'))
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error(t('categories-token.table.deleteFailed'))
    }
  }

  // Auto-generate slug from name
  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
  }

  // Add this function to handle edit form changes
  const handleEditFormChange = (id: number, field: 'name' | 'slug', value: string) => {
    setEditForm(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  // Add this function to handle edit submission
  const handleEditSubmit = async (id: number) => {
    try {
      const formData = editForm[id]
      if (!formData) return

      // Update name
      await updateCategoryField(id, "slct_name", formData.name)
      // Update slug
      await updateCategoryField(id, "slct_slug", formData.slug)

      setOpenEditModal(prev => ({ ...prev, [id]: false }))
      toast.success(t('categories-token.table.categoryUpdated'))
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error(t('categories-token.table.updateFailed'))
    }
  }

  const columns: ColumnDef<CategoryToken>[] = [
    {
      accessorKey: "slct_name",
      header: t('categories-token.table.name'),
      cell: ({ row }) => {
        const category = row.original
        return (
          <EditableCell
            value={category.slct_name}
            onSave={async (value) => {
              await updateCategoryField(category.slct_id, "slct_name", value)
            }}
            className="font-medium"
          />
        )
      },
    },
    {
      accessorKey: "slct_slug",
      header: t('categories-token.table.slug'),
      cell: ({ row }) => {
        const category = row.original
        return (
          <EditableCell
            value={category.slct_slug}
            onSave={async (value) => {
              await updateCategoryField(category.slct_id, "slct_slug", value)
            }}
            className="text-muted-foreground"
          />
        )
      },
    },
    {
      accessorKey: "slct_prioritize",
      header: t('categories-token.table.prioritize'),
      cell: ({ row }) => {
        const category = row.original
        const isPrioritized = category.slct_prioritize === "yes"

        return (
          <div className="flex">
            <Badge
              variant="outline"
              className={`cursor-pointer flex items-center gap-1 px-3 py-1 transition-colors duration-200 ${
                isPrioritized
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-500 hover:text-white hover:border-slate-500"
              } dark:${
                isPrioritized
                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                  : "bg-slate-950/30 text-slate-400 border-slate-800/50 hover:bg-slate-600 hover:text-white hover:border-slate-600"
              }`}
              onClick={async () => await togglePrioritize(category.slct_id)}
            >
              {isPrioritized ? (
                <CheckCircle2 className={`h-3.5 w-3.5 ${isPrioritized ? "text-emerald-500" : "text-slate-500"}`} />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span>{isPrioritized ? t('categories-token.table.yes') : t('categories-token.table.no')}</span>
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "sltc_status",
      header: t('categories-token.table.status'),
      cell: ({ row }) => {
        const category = row.original
        const isActive = category.sltc_status === "active"

        return (
          <div className="flex">
            <Badge
              variant="outline"
              className={`cursor-pointer flex items-center gap-1 px-3 py-1 transition-colors duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                  : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500"
              } dark:${
                isActive
                  ? "bg-blue-950/30 text-blue-400 border-blue-800/50 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  : "bg-amber-950/30 text-amber-400 border-amber-800/50 hover:bg-amber-600 hover:text-white hover:border-amber-600"
              }`}
              onClick={async () => await toggleStatus(category.slct_id)}
            >
              {isActive ? (
                <Eye className="h-3.5 w-3.5 text-blue-500" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span>{isActive ? t('categories-token.table.active') : t('categories-token.table.hidden')}</span>
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "slct_created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            {t('categories-token.table.createdAt')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.original.slct_created_at)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original
        const open = openAlert[category.slct_id.toString()] || false
        const openEdit = openEditModal[category.slct_id.toString()] || false

        // Initialize edit form when opening modal
        useEffect(() => {
          if (openEdit && !editForm[category.slct_id]) {
            setEditForm(prev => ({
              ...prev,
              [category.slct_id]: {
                name: category.slct_name,
                slug: category.slct_slug
              }
            }))
          }
        }, [openEdit, category.slct_id])

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-300"
              onClick={() => setOpenEditModal(prev => ({ ...prev, [category.slct_id.toString()]: true }))}
            >
              <Pencil className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
              <span className="sr-only">{t('categories-token.table.edit')}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-300"
              onClick={() => setOpenAlert((prevState) => ({ ...prevState, [category.slct_id.toString()]: true }))}
            >
              <Trash className="h-4 w-4 text-red-500 group-hover:text-red-600" />
              <span className="sr-only">{t('categories-token.table.delete')}</span>
            </Button>

            {/* Edit Modal */}
            <Dialog open={openEdit} onOpenChange={(open) => setOpenEditModal(prev => ({ ...prev, [category.slct_id.toString()]: open }))}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('categories-token.table.editCategory')}</DialogTitle>
                  <DialogDescription>
                    {t('categories-token.table.editDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      {t('categories-token.table.nameLabel')}
                    </Label>
                    <Input
                      id="name"
                      value={editForm[category.slct_id]?.name || ''}
                      onChange={(e) => handleEditFormChange(category.slct_id, 'name', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="slug" className="text-right">
                      {t('categories-token.table.slugLabel')}
                    </Label>
                    <Input
                      id="slug"
                      value={editForm[category.slct_id]?.slug || ''}
                      onChange={(e) => handleEditFormChange(category.slct_id, 'slug', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenEditModal(prev => ({ ...prev, [category.slct_id.toString()]: false }))}>
                    {t('categories-token.table.cancel')}
                  </Button>
                  <Button onClick={() => handleEditSubmit(category.slct_id)}>
                    {t('categories-token.table.save')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog
              open={open}
              onOpenChange={(open) => setOpenAlert((prevState) => ({ ...prevState, [category.slct_id.toString()]: open }))}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('categories-token.table.deleteConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('categories-token.table.deleteConfirmDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setOpenAlert((prevState) => ({ ...prevState, [category.slct_id.toString()]: false }))}
                  >
                    {t('categories-token.table.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      await deleteCategory(category.slct_id)
                      setOpenAlert((prevState) => ({ ...prevState, [category.slct_id.toString()]: false }))
                    }}
                  >
                    {t('categories-token.table.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
            <TableHeader className="sticky top-0 bg-background z-20 border-b">
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
                      <TableCell key={cell.id} className="p-2.5">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {t('categories-token.table.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
      
      {/* Simple Pagination */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
