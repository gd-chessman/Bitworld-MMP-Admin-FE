// "use client"

// import { Fragment, useState, useEffect } from "react"
// import {
//   type ColumnDef,
//   type ColumnFiltersState,
//   type SortingState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table"
// import { ChevronDown, ChevronRight, Wallet, CheckCircle2, XCircle, Copy, Check, ChevronLeft } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useQuery, useQueryClient } from "@tanstack/react-query"
// import { getListWallets, updateListWalletsAuth } from "@/services/api/ListWalletsService"
// import { truncateString } from "@/utils/format"
// import { toast } from "react-toastify"
// import { useLang } from "@/lang/useLang"

// // Define types based on the provided JSON structure
// interface WalletAuth {
//   wa_id: number
//   wa_user_id: number
//   wa_wallet_id: number
//   wa_type: string
//   wa_name: string | null
// }

// interface UserWallet {
//   wallet_id: number
//   wallet_solana_address: string
//   wallet_eth_address: string
//   wallet_auth: string
//   wallet_stream: string | null
//   wallet_status: boolean
//   wallet_nick_name: string | null
//   wallet_country: string | null
//   wallet_auths: WalletAuth[]
// }

// interface UserWalletResponse {
//   data: UserWallet[]
//   pagination: {
//     page: number
//     limit: number
//     total: number
//     totalPages: number
//   }
// }

// export function ListWalletsTable({ searchQuery }: { searchQuery: string }) {
//   const { t } = useLang()
//   const queryClient = useQueryClient()
//   const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
//   const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
//   const [currentPage, setCurrentPage] = useState(1)
//   const pageSize = 10

//   // Reset to page 1 when search changes
//   useEffect(() => {
//     setCurrentPage(1)
//   }, [searchQuery])

//   const toggleRow = (walletId: number) => {
//     setExpandedRows(prev => ({
//       ...prev,
//       [walletId]: !prev[walletId]
//     }))
//   }

//   const handleUpdateAuth = async (walletId: number, newAuth: string) => {
//     try {
//       await updateListWalletsAuth(walletId.toString(), { auth_type: newAuth })
//       toast.success(t('list-wallets.table.authUpdated'))
//       queryClient.invalidateQueries({ queryKey: ['listWallets'] })
//     } catch (error) {
//       toast.error(t('list-wallets.table.authUpdateFailed'))
//     }
//   }

//   const copyToClipboard = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text)
//       setCopiedAddress(text)
//       toast.success(t('list-wallets.table.addressCopied'))
//       setTimeout(() => setCopiedAddress(null), 2000)
//     } catch (error) {
//       toast.error(t('list-wallets.table.copyFailed'))
//     }
//   }

//   const { data: listWallets, isLoading } = useQuery<UserWalletResponse>({
//     queryKey: ['listWallets', searchQuery, currentPage],
//     queryFn: () => getListWallets(searchQuery, currentPage, pageSize),
//     placeholderData: (previousData) => previousData,
//   })

//   const [sorting, setSorting] = useState<SortingState>([])
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

//   const columns: ColumnDef<UserWallet>[] = [
//     // {
//     //   id: "expand",
//     //   cell: ({ row }) => {
//     //     const userWallet = row.original
//     //     const isExpanded = expandedRows[userWallet.wallet_id] || false

//     //     return (
//     //       <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => toggleRow(userWallet.wallet_id)}>
//     //         {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//     //       </Button>
//     //     )
//     //   },
//     // },
//     {
//       accessorKey: "wallet_id",
//       header: t('list-wallets.table.walletId'),
//       cell: ({ row }) => <div className="font-medium">{row.getValue("wallet_id")}</div>,
//     },
//     {
//       id: "wallet_solana_address",
//       header: t('list-wallets.table.solanaAddress'),
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <span className="text-xs break-all">{truncateString(row.original.wallet_solana_address, 14)}</span>
//           <Button
//             variant="ghost"
//             size="icon"
//             className="h-6 w-6"
//             onClick={() => copyToClipboard(row.original.wallet_solana_address)}
//           >
//             {copiedAddress === row.original.wallet_solana_address ? (
//               <Check className="h-3.5 w-3.5 text-emerald-500" />
//             ) : (
//               <Copy className="h-3.5 w-3.5" />
//             )}
//           </Button>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "wallet_nick_name",
//       header: t('list-wallets.table.nickname'),
//       cell: ({ row }) => <div>{row.getValue("wallet_nick_name") || t('list-wallets.table.na')}</div>,
//     },
//     {
//       accessorKey: "wallet_auth",
//       header: t('list-wallets.table.authType'),
//       cell: ({ row }) => {
//         const authType = row.getValue("wallet_auth") as string

//         return (
//           <div className="flex">
//             <Select value={authType} onValueChange={(value) => handleUpdateAuth(row.original.wallet_id, value)}>
//               <SelectTrigger className="w-28 h-8 text-xs bg-slate-800 border-slate-600 text-slate-200">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="master">{t('list-wallets.table.master')}</SelectItem>
//                 <SelectItem value="member">{t('list-wallets.table.member')}</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         )
//       },
//     },
//     {
//       accessorKey: "wallet_stream",
//       header: t('list-wallets.table.stream'),
//       cell: ({ row }) => {
//         const stream = row.getValue("wallet_stream") as string | null
//         return stream ? (
//           <Badge
//             variant="outline"
//             className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
//           >
//             {stream}
//           </Badge>
//         ) : (
//           t('list-wallets.table.na')
//         )
//       },
//     },
//     {
//       accessorKey: "wallet_country",
//       header: t('list-wallets.table.country'),
//       cell: ({ row }) => <div>{row.getValue("wallet_country") || t('list-wallets.table.na')}</div>,
//     },
//   ]

//   const table = useReactTable({
//     data: listWallets?.data ?? [],
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     manualPagination: true,
//     pageCount: listWallets?.pagination.totalPages ?? 0,
//     state: {
//       sorting,
//       columnFilters,
//       pagination: {
//         pageIndex: currentPage - 1,
//         pageSize,
//       },
//     },
//   })

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1)
//     }
//   }

//   const handleNextPage = () => {
//     if (listWallets?.pagination.totalPages && currentPage < listWallets.pagination.totalPages) {
//       setCurrentPage(currentPage + 1)
//     }
//   }

//   if (isLoading) {
//     return <div>{t('list-wallets.table.loading')}</div>
//   }

//   return (
//     <div className="space-y-4">
//       <div className="rounded-md border">
//         <Table>
//             <TableHeader className="sticky top-0 bg-background z-20 border-b">
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <TableRow key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => {
//                     return (
//                       <TableHead key={header.id}>
//                         {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
//                       </TableHead>
//                     )
//                   })}
//                 </TableRow>
//               ))}
//             </TableHeader>
//             <TableBody>
//               {table.getRowModel().rows?.length ? (
//                 table.getRowModel().rows.map((row, index) => (
//                   <Fragment key={index}>
//                     <TableRow data-state={row.getIsSelected() && "selected"}>
//                       {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id} className="p-2.5">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
//                     ))}
//                     </TableRow>
//                     {/* Removed expand/collapse functionality */}
//                     {/**
//                     {expandedRows[row.original.wallet_id] && (
//                       <TableRow>
//                         <TableCell colSpan={columns.length} className="p-0">
//                           <div className="p-4 bg-muted/30">
//                             <h4 className="text-sm font-medium mb-2">{t('list-wallets.table.walletDetails')}</h4>
//                             <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
//                               <Card className="overflow-hidden">
//                                 <CardContent className="p-4">
//                                   <div className="space-y-2">
//                                     <div>
//                                       <span className="text-sm font-medium">{t('list-wallets.table.solanaAddress')}</span>
//                                       <div className="flex items-center gap-2">
//                                         <p className="text-sm text-muted-foreground break-all">{truncateString(row.original.wallet_solana_address, 14)}</p>
//                                         <Button
//                                           variant="ghost"
//                                           size="icon"
//                                           className="h-6 w-6"
//                                           onClick={() => copyToClipboard(row.original.wallet_solana_address)}
//                                         >
//                                           {copiedAddress === row.original.wallet_solana_address ? (
//                                             <Check className="h-3.5 w-3.5 text-emerald-500" />
//                                           ) : (
//                                             <Copy className="h-3.5 w-3.5" />
//                                           )}
//                                         </Button>
//                                       </div>
//                                     </div>
//                                     <div>
//                                       <span className="text-sm font-medium">{t('list-wallets.table.status')}</span>
//                                       <Badge
//                                         variant="outline"
//                                         className={`ml-2 ${
//                                           row.original.wallet_status
//                                             ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
//                                             : "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50"
//                                         }`}
//                                       >
//                                         {row.original.wallet_status ? t('list-wallets.table.active') : t('list-wallets.table.inactive')}
//                                       </Badge>
//                                     </div>
//                                   </div>
//                                 </CardContent>
//                               </Card>
//                             </div>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     )}
//                     */}
//                   </Fragment>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={columns.length} className="h-24 text-center">
//                     {t('list-wallets.table.noResults')}
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//       </div>
      
//       {/* Server-side Pagination */}
//       <div className="flex items-center justify-center space-x-4">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={handlePreviousPage}
//           disabled={currentPage <= 1}
//         >
//           <ChevronLeft className="h-4 w-4" />
//         </Button>
//         <span className="text-sm text-muted-foreground">
//           {currentPage} / {listWallets?.pagination.totalPages || 1}
//         </span>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={handleNextPage}
//           disabled={!listWallets?.pagination.totalPages || currentPage >= listWallets.pagination.totalPages}
//         >
//           <ChevronRight className="h-4 w-4" />
//         </Button>
//       </div>
//     </div>
//   )
// }
