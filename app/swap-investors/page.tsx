"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Settings, DollarSign, Users, TrendingUp, Gift } from "lucide-react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { createSwapInvestor, getSwapInvestors, getSwapInvestorsStats, getSwapInvestorRewards } from "@/services/api/SwapInvestorService"
import { getSwapSetting, updateSwapSetting } from "@/services/api/SwapSetting"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft } from "lucide-react"
import { useLang } from "@/lang/useLang"

// Mock data
const mockInvestors = [
  {
    swap_investor_id: 1,
    wallet_address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    coin: "SOL",
    amount: 50000,
    active: true,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    swap_investor_id: 2,
    wallet_address: "0x8ba1f109551bD432803012645Hac136c772c3",
    coin: "USDT",
    amount: 75000,
    active: true,
    created_at: "2024-01-16T14:20:00Z"
  },
  {
    swap_investor_id: 3,
    wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
    coin: "SOL",
    amount: 30000,
    active: false,
    created_at: "2024-01-17T09:15:00Z"
  }
];

const mockSettings = {
  swap_fee_percent: 2.5,
  investor_share_percent: 80
};

export default function SwapInvestorsPage() {
  const { t } = useLang()
  const [searchQuery, setSearchQuery] = useState('')
  const [coinFilter, setCoinFilter] = useState('all')
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rewardsPage, setRewardsPage] = useState(1)
  const [rewardsSearchQuery, setRewardsSearchQuery] = useState('')

  // Form states
  const [createForm, setCreateForm] = useState({
    wallet_address: ''
  })

  const [settingsForm, setSettingsForm] = useState({
    swap_fee_percent: '',
    investor_share_percent: ''
  })

  // Fetch investors with useQuery
  const { data: investorsRes, isLoading, refetch } = useQuery({
    queryKey: ["swap-investors", currentPage, searchQuery, coinFilter],
    queryFn: () => getSwapInvestors(currentPage, 10, searchQuery),
  })

  // Fetch settings with useQuery
  const { data: settingsRes, refetch: refetchSettings } = useQuery({
    queryKey: ["swap-settings"],
    queryFn: () => getSwapSetting(),
  })

  // Fetch stats with useQuery
  const { data: statsRes } = useQuery({
    queryKey: ["swap-investors-stats"],
    queryFn: () => getSwapInvestorsStats(),
  })

  // Fetch rewards with useQuery
  const { data: rewardsRes, isLoading: rewardsLoading } = useQuery({
    queryKey: ["swap-investor-rewards", rewardsPage, rewardsSearchQuery],
    queryFn: () => getSwapInvestorRewards(rewardsPage, 10, rewardsSearchQuery),
  })

  // Update settings form when data is loaded
  useEffect(() => {
    if (settingsRes?.data) {
      setSettingsForm({
        swap_fee_percent: settingsRes.data.swap_fee_percent || '',
        investor_share_percent: settingsRes.data.investor_share_percent || ''
      })
    }
  }, [settingsRes])

  const handleCreateInvestor = async () => {
    if (!createForm.wallet_address) {
      toast.error(t('swap-investors.investors.dialog.walletAddressRequired'))
      return
    }

    try {
      await createSwapInvestor(createForm.wallet_address)
      toast.success(t('swap-investors.investors.dialog.createSuccess'))
      setOpenCreateDialog(false)
      setCreateForm({
        wallet_address: ''
      })
      // Refresh data after creating
      refetch()
    } catch (error) {
      toast.error(t('swap-investors.investors.dialog.createError'))
    }
  }

  const handleUpdateSettings = async () => {
    const swapFee = parseFloat(settingsForm.swap_fee_percent)
    const investorShare = parseFloat(settingsForm.investor_share_percent)

    if (isNaN(swapFee) || swapFee < 0 || swapFee > 100) {
      toast.error(t('swap-investors.settings.dialog.validation.swapFeeRange'))
      return
    }

    if (isNaN(investorShare) || investorShare < 0 || investorShare > 100) {
      toast.error(t('swap-investors.settings.dialog.validation.investorShareRange'))
      return
    }

    if (investorShare > swapFee) {
      toast.error(t('swap-investors.settings.dialog.validation.investorShareGreater'))
      return
    }

    try {
      await updateSwapSetting({
        swap_fee_percent: swapFee,
        investor_share_percent: investorShare
      })
      toast.success(t('swap-investors.settings.dialog.updateSuccess'))
      setOpenSettingsDialog(false)
      refetchSettings()
    } catch (error) {
      toast.error(t('swap-investors.settings.dialog.updateError'))
    }
  }

  // Use real data from API
  const investors = investorsRes?.data || []
  const pagination = investorsRes?.pagination || { total: 0, totalPages: 1, currentPage: 1 }
  const stats = statsRes?.data || { totalInvestors: 0, activeInvestors: 0, totalAmount: 0, swapFee: 0 }
  const rewards = rewardsRes?.data || []
  const rewardsPagination = rewardsRes?.pagination || { total: 0, totalPages: 1, currentPage: 1 }

  const filteredInvestors = investors.filter((investor: any) => {
    const matchesSearch = investor.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCoin = coinFilter === 'all' || (Array.isArray(investor.coins) && investor.coins.includes(coinFilter))
    return matchesSearch && matchesCoin
  })

  const handleRewardsPreviousPage = () => {
    if (rewardsPage > 1) {
      setRewardsPage(rewardsPage - 1)
    }
  }

  const handleRewardsNextPage = () => {
    if (rewardsPagination.totalPages && rewardsPage < rewardsPagination.totalPages) {
      setRewardsPage(rewardsPage + 1)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">{t('swap-investors.pageTitle')}</h2>
        <p className="text-muted-foreground">{t('swap-investors.description')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('swap-investors.stats.totalInvestors')}</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalInvestors}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('swap-investors.stats.activeInvestors')}</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.activeInvestors}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('swap-investors.stats.totalAmount')}</p>
                <p className="text-2xl font-bold text-purple-400">${stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('swap-investors.stats.swapFee')}</p>
                <p className="text-2xl font-bold text-orange-400">{stats.swapFee}%</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Settings className="h-4 w-4 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="investors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="investors">{t('swap-investors.tabs.investors')}</TabsTrigger>
          <TabsTrigger value="rewards">{t('swap-investors.tabs.rewards')}</TabsTrigger>
          <TabsTrigger value="settings">{t('swap-investors.tabs.settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-black dark:text-white font-bold">{t('swap-investors.investors.title')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('swap-investors.investors.description')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('swap-investors.investors.addNew')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('swap-investors.investors.dialog.title')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>{t('swap-investors.investors.dialog.walletAddress')} <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Enter wallet address..."
                            value={createForm.wallet_address}
                            onChange={e => setCreateForm(f => ({ ...f, wallet_address: e.target.value }))}
                          />
                        </div>
                        

                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenCreateDialog(false)}>
                          {t('swap-investors.investors.dialog.cancel')}
                        </Button>
                        <Button onClick={handleCreateInvestor} className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                          {t('swap-investors.investors.dialog.create')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('swap-investors.investors.searchPlaceholder')}
                    className="pl-8 w-full md:max-w-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={coinFilter} onValueChange={setCoinFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                                     <SelectContent>
                     <SelectItem value="all">{t('swap-investors.investors.filters.allCoins')}</SelectItem>
                     <SelectItem value="SOL">{t('swap-investors.investors.filters.sol')}</SelectItem>
                     <SelectItem value="USDT">{t('swap-investors.investors.filters.usdt')}</SelectItem>
                   </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-20 border-b">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.id')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.walletAddress')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.coin')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.amount')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.status')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.createdAt')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestors.length > 0 ? (
                      filteredInvestors.map((investor: any) => (
                        <TableRow key={investor.swap_investor_id}>
                          <TableCell className="font-medium">#{investor.swap_investor_id}</TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">
                              {investor.wallet_address.slice(0, 8)}...{investor.wallet_address.slice(-6)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {Array.isArray(investor.coins) ? investor.coins.map((coin: string) => (
                                <Badge key={coin} variant="outline">{coin}</Badge>
                              )) : (
                                <span className="text-muted-foreground">{t('swap-investors.investors.table.noCoins')}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {investor.amount_sol > 0 && (
                                <div className="text-sm">
                                  <span className="font-semibold">{investor.amount_sol}</span> SOL
                                </div>
                              )}
                              {investor.amount_usdt > 0 && (
                                <div className="text-sm">
                                  <span className="font-semibold">{investor.amount_usdt.toLocaleString()}</span> USDT
                                </div>
                              )}
                              {investor.amount_usd > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  ≈ ${investor.amount_usd.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={investor.active ? "default" : "secondary"}>
                              {investor.active ? t('swap-investors.investors.table.active') : t('swap-investors.investors.table.inactive')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(investor.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          {t('swap-investors.investors.table.noResults')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-black dark:text-white font-bold">{t('swap-investors.rewards.title')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('swap-investors.rewards.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('swap-investors.rewards.searchPlaceholder')}
                    className="pl-8 w-full md:max-w-sm"
                    value={rewardsSearchQuery}
                    onChange={(e) => setRewardsSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-20 border-b">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.rewardId')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.investorWallet')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.solAmount')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.swapOrder')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.swapType')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.transactionHash')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.status')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.createdAt')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewardsLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          {t('swap-investors.rewards.table.loading')}
                        </TableCell>
                      </TableRow>
                    ) : rewards.length > 0 ? (
                      rewards.map((reward: any) => (
                        <TableRow key={reward.swap_investor_reward_id}>
                          <TableCell className="font-medium">#{reward.swap_investor_reward_id}</TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">
                              {reward.investor_wallet_address.slice(0, 8)}...{reward.investor_wallet_address.slice(-6)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {reward.reward_sol_amount.toFixed(6)} SOL
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">#{reward.swap_order_id}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {reward.swapOrder?.swap_type || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono text-muted-foreground">
                              {reward.swapOrder?.transaction_hash ? 
                                `${reward.swapOrder.transaction_hash.slice(0, 8)}...${reward.swapOrder.transaction_hash.slice(-6)}` : 
                                'N/A'
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={reward.swapOrder?.status === 'completed' ? "default" : "secondary"}>
                              {reward.swapOrder?.status || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(reward.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          {t('swap-investors.rewards.table.noResults')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-center space-x-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRewardsPreviousPage}
                  disabled={rewardsPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {rewardsPage} / {rewardsPagination.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRewardsNextPage}
                  disabled={!rewardsPagination.totalPages || rewardsPage >= rewardsPagination.totalPages}
                >
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-black dark:text-white font-bold">{t('swap-investors.settings.title')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('swap-investors.settings.description')}</CardDescription>
                </div>
                <Dialog open={openSettingsDialog} onOpenChange={setOpenSettingsDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('swap-investors.settings.editSettings')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('swap-investors.settings.dialog.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>{t('swap-investors.settings.dialog.swapFeeLabel')} <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="3"
                          value={settingsForm.swap_fee_percent}
                          onChange={e => setSettingsForm(f => ({ ...f, swap_fee_percent: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('swap-investors.settings.dialog.swapFeeDescription')}
                        </p>
                      </div>
                      <div>
                        <Label>{t('swap-investors.settings.dialog.investorShareLabel')} <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="2"
                          value={settingsForm.investor_share_percent}
                          onChange={e => setSettingsForm(f => ({ ...f, investor_share_percent: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('swap-investors.settings.dialog.investorShareDescription')}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenSettingsDialog(false)}>
                        {t('swap-investors.settings.dialog.cancel')}
                      </Button>
                      <Button onClick={handleUpdateSettings} className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                        {t('swap-investors.settings.dialog.update')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">{t('swap-investors.settings.currentSwapFee')}</Label>
                    <p className="text-2xl font-bold text-blue-400">{settingsRes?.data?.swap_fee_percent || '0'}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('swap-investors.settings.currentInvestorShare')}</Label>
                    <p className="text-2xl font-bold text-emerald-400">{settingsRes?.data?.investor_share_percent || '0'}%</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">{t('swap-investors.settings.information')}</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>{t('swap-investors.settings.infoPoints.swapFee')}</li>
                      <li>{t('swap-investors.settings.infoPoints.investorShare')}</li>
                      <li>{t('swap-investors.settings.infoPoints.totalPercentage')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 