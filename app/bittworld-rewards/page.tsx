"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, DollarSign, Coins, TrendingUp, Clock, CheckCircle, ChevronLeft, ArrowUpRight } from "lucide-react"
import { getBittworldRewardsStatistics, getBittworldWithdrawalsHistory, triggerBittworldWithdrawal } from "@/services/api/BittworldService"
import { getMyInfor } from "@/services/api/UserAdminService"
import { toast } from "sonner"
import { useLang } from "@/lang/useLang"

export default function BittworldRewardsPage() {
  const { t } = useLang()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false)
  const limit = 20
  
  useEffect(() => { setPage(1) }, [search, statusFilter])
  
  // Query for statistics (cards)
  const { data: statisticsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["bittworld-rewards-statistics"],
    queryFn: getBittworldRewardsStatistics,
  })

  // Query for withdrawals history (table)
  const { data: withdrawalsData, isLoading: isLoadingWithdrawals } = useQuery({
    queryKey: ["bittworld-withdrawals", search, statusFilter, page],
    queryFn: () => getBittworldWithdrawalsHistory(search, page, limit, statusFilter),
  })

  const overview = (statisticsData && typeof statisticsData === 'object' && 'overview' in statisticsData) ? (statisticsData as any).overview || {} : {}
  const withdraws = (withdrawalsData && typeof withdrawalsData === 'object' && 'withdraws' in withdrawalsData) ? (withdrawalsData as any).withdraws || [] : []
  const totalPages = (withdrawalsData && typeof withdrawalsData === 'object' && 'pagination' in withdrawalsData) ? (withdrawalsData as any).pagination?.totalPages || 1 : 1

  // Lấy thông tin user hiện tại để check role
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: getMyInfor
  });

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true)
      await triggerBittworldWithdrawal()
      toast.success("Withdrawal triggered successfully!")
      setOpenWithdrawDialog(false)
      window.location.reload()
    } catch (error: any) {
      if(error.response.data.message.includes('Minimum $5 required')) {
        toast.error(t('bittworld-rewards.dialog.minimumAmount'))
      }else{
        toast.error(error.response.data.message)
      }
    } finally {
      setIsWithdrawing(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString()
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
            <Clock className="h-3 w-3" />
            {t('bittworld-rewards.status.pending')}
          </span>
        )
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
            <CheckCircle className="h-3 w-3" />
            {t('bittworld-rewards.status.success')}
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
            <CheckCircle className="h-3 w-3" />
            {t('bittworld-rewards.status.error')}
          </span>
        )
      case 'cancel':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
            <CheckCircle className="h-3 w-3" />
            {t('bittworld-rewards.status.cancel')}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('bittworld-rewards.title')}</h2>
        <p className="text-muted-foreground">{t('bittworld-rewards.description')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-medium">{t('bittworld-rewards.statistics.totalRewards')}</CardTitle>
              <CardDescription className="text-xs">{t('bittworld-rewards.statistics.totalRewardsDesc')}</CardDescription>
            </div>
            <Coins className="h-5 w-5 text-blue-400/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStats ? '...' : overview?.totalRewards ?? 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-medium">{t('bittworld-rewards.statistics.totalAmountUSD')}</CardTitle>
              <CardDescription className="text-xs">{t('bittworld-rewards.statistics.totalAmountUSDDesc')}</CardDescription>
            </div>
            <DollarSign className="h-5 w-5 text-green-400/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoadingStats ? '...' : (overview?.totalAmountUSD.toFixed(2) ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-medium">{t('bittworld-rewards.statistics.canWithdraw')}</CardTitle>
              <CardDescription className="text-xs">{t('bittworld-rewards.statistics.canWithdrawDesc')}</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-orange-400/80" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{isLoadingStats ? '...' : overview?.canWithdrawRewards ?? 0}</div>
              <Dialog open={openWithdrawDialog} onOpenChange={setOpenWithdrawDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      {t('bittworld-rewards.dialog.confirm')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('bittworld-rewards.dialog.title')}</DialogTitle>
                      <DialogDescription>
                        <div className="space-y-2">
                          <p>{t('bittworld-rewards.dialog.description')}</p>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm font-medium">{t('bittworld-rewards.dialog.currentStatus')}</p>
                            <ul className="text-sm space-y-1 mt-1">
                              <li>• {t('bittworld-rewards.dialog.canWithdraw', { count: overview?.canWithdrawRewards ?? 0 })}</li>
                              <li>• {t('bittworld-rewards.dialog.totalRewards', { count: overview?.totalRewards ?? 0 })}</li>
                              <li>• {t('bittworld-rewards.dialog.totalAmount', { amount: (overview?.totalAmountUSD ?? 0).toLocaleString() })}</li>
                            </ul>
                          </div>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenWithdrawDialog(false)}>
                        {t('bittworld-rewards.dialog.cancel')}
                      </Button>
                      <Button 
                        onClick={handleWithdraw} 
                        disabled={isWithdrawing || (overview?.canWithdrawRewards ?? 0) <= 0}
                      >
                        {isWithdrawing ? t('bittworld-rewards.dialog.processing') : t('bittworld-rewards.dialog.confirm')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-medium">{t('bittworld-rewards.statistics.averageReward')}</CardTitle>
              <CardDescription className="text-xs">{t('bittworld-rewards.statistics.averageRewardDesc')}</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-purple-400/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoadingStats ? '...' : (overview?.averageRewardPerTransaction.toFixed(4) ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-card p-0 md:p-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('bittworld-rewards.withdrawals.title')}</CardTitle>
              <CardDescription>{t('bittworld-rewards.withdrawals.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('bittworld-rewards.withdrawals.searchPlaceholder')}
                className="pl-8 w-full md:max-w-sm min-w-[140px]"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('bittworld-rewards.withdrawals.filters.all')}</SelectItem>
                <SelectItem value="pending">{t('bittworld-rewards.withdrawals.filters.pending')}</SelectItem>
                <SelectItem value="success">{t('bittworld-rewards.withdrawals.filters.success')}</SelectItem>
                <SelectItem value="error">{t('bittworld-rewards.withdrawals.filters.error')}</SelectItem>
                <SelectItem value="cancel">{t('bittworld-rewards.withdrawals.filters.cancel')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('bittworld-rewards.table.id')}</TableHead>
                  <TableHead>{t('bittworld-rewards.table.amountSOL')}</TableHead>
                  <TableHead>{t('bittworld-rewards.table.amountUSD')}</TableHead>
                  <TableHead>{t('bittworld-rewards.table.address')}</TableHead>
                  <TableHead>{t('bittworld-rewards.table.date')}</TableHead>
                  <TableHead>{t('bittworld-rewards.table.status')}</TableHead>
                  <TableHead>{t('bittworld-rewards.table.txHash')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingWithdrawals ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : withdraws.length ? (
                  withdraws.map((withdraw: any) => (
                    <TableRow key={withdraw.bw_id}>
                      <TableCell className="font-mono text-xs">#{withdraw.bw_id}</TableCell>
                      <TableCell className="font-mono">{withdraw.bw_amount_sol} SOL</TableCell>
                      <TableCell>${withdraw.bw_amount_usd.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{withdraw.bw_address}</TableCell>
                      <TableCell className="text-xs">{formatDate(withdraw.bw_date)}</TableCell>
                      <TableCell>{getStatusBadge(withdraw.bw_status)}</TableCell>
                      <TableCell className="font-mono text-xs">{withdraw.bw_tx_hash || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">{t('bittworld-rewards.withdrawals.noData')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-center space-x-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 