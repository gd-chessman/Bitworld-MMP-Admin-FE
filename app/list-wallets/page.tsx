"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw } from "lucide-react"
import { getListWallets } from "@/services/api/ListWalletsService"
import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useLang } from "@/lang/useLang"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQueryClient } from "@tanstack/react-query"
import { updateListWalletsAuth } from "@/services/api/ListWalletsService"
import { truncateString } from "@/utils/format"
import { toast } from "react-toastify"
import { Fragment } from "react"
import { ChevronLeft, Copy, Check } from "lucide-react"

export default function UserWalletsPage() {
  const { t } = useLang()
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [walletAuthType, setWalletAuthType] = useState('all')
  const pageSize = 10
  const queryClient = useQueryClient()

  // Reset to page 1 when search hoặc loại ví thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, walletAuthType])

  const { data: listWallets, refetch: refetchListWallets, isLoading } = useQuery({
    queryKey: ["list-wallets", searchQuery, walletAuthType, currentPage],
    queryFn: () => getListWallets(searchQuery, currentPage, pageSize, walletAuthType === 'all' ? '' : walletAuthType, 'main'),
    placeholderData: (previousData) => previousData,
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchListWallets()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleUpdateAuth = async (walletId: number, newAuth: string) => {
    try {
      await updateListWalletsAuth(walletId.toString(), { wallet_auth: newAuth })
      toast.success(t('list-wallets.table.authUpdated'))
      queryClient.invalidateQueries({ queryKey: ['listWallets'] })
      refetchListWallets()
    } catch (error) {
      toast.error(t('list-wallets.table.authUpdateFailed'))
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(text)
      toast.success(t('list-wallets.table.addressCopied'))
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (error) {
      toast.error(t('list-wallets.table.copyFailed'))
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (listWallets?.pagination.totalPages && currentPage < listWallets.pagination.totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('list-wallets.pageTitle')}</h2>
        <p className="text-muted-foreground">{t('list-wallets.description')}</p>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('list-wallets.cardTitle')}</CardTitle>
              <CardDescription>{t('list-wallets.cardDescription')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder={t('list-wallets.searchPlaceholder')} className="pl-8 w-full md:max-w-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={walletAuthType} onValueChange={value => setWalletAuthType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('list-wallets.selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('list-wallets.allTypes')}</SelectItem>
                <SelectItem value="member">{t('list-wallets.table.member')}</SelectItem>
                <SelectItem value="master">{t('list-wallets.table.master')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-20 border-b">
                  <TableRow>
                    <TableHead>{t('list-wallets.table.walletId')}</TableHead>
                    <TableHead>{t('list-wallets.table.solanaAddress')}</TableHead>
                    <TableHead>{t('list-wallets.table.nickname')}</TableHead>
                    <TableHead>{t('list-wallets.table.authType')}</TableHead>
                    <TableHead>{t('list-wallets.table.stream')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {t('list-wallets.table.loading')}
                      </TableCell>
                    </TableRow>
                  ) : listWallets?.data?.length ? (
                    listWallets.data.map((row: any) => (
                      <TableRow key={row.wallet_id}>
                        <TableCell className="font-medium">{row.wallet_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs break-all">{truncateString(row.wallet_solana_address, 14)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(row.wallet_solana_address)}
                            >
                              {copiedAddress === row.wallet_solana_address ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{row.wallet_nick_name || t('list-wallets.table.na')}</TableCell>
                        <TableCell>
                          <div className="flex">
                            <Select value={row.wallet_auth} onValueChange={(value) => handleUpdateAuth(row.wallet_id, value)}>
                              <SelectTrigger className="w-28 h-8 text-xs bg-slate-800 border-slate-600 text-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="master">{t('list-wallets.table.master')}</SelectItem>
                                <SelectItem value="member">{t('list-wallets.table.member')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          {row.wallet_stream ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
                            >
                              {row.wallet_stream}
                            </Badge>
                          ) : (
                            t('list-wallets.table.na')
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {t('list-wallets.table.noResults')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {listWallets?.pagination?.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!listWallets?.pagination?.totalPages || currentPage >= listWallets?.pagination?.totalPages}
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
