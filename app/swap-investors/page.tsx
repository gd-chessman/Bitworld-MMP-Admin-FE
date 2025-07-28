"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, Plus, Settings, DollarSign, Users, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { createSwapInvestor, getSwapInvestors } from "@/services/api/SwapInvestorService"
import { useQuery } from "@tanstack/react-query"

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
  const [searchQuery, setSearchQuery] = useState('')
  const [coinFilter, setCoinFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Form states
  const [createForm, setCreateForm] = useState({
    wallet_address: ''
  })

  const [settingsForm, setSettingsForm] = useState({
    swap_fee_percent: mockSettings.swap_fee_percent.toString(),
    investor_share_percent: mockSettings.investor_share_percent.toString()
  })

  // Fetch investors with useQuery
  const { data: investorsRes, isLoading, refetch } = useQuery({
    queryKey: ["swap-investors", currentPage, searchQuery, coinFilter],
    queryFn: () => getSwapInvestors(currentPage, 10, searchQuery),
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("Data refreshed successfully!")
    }, 1000)
  }

  const handleCreateInvestor = async () => {
    if (!createForm.wallet_address) {
      toast.error("Please fill in wallet address")
      return
    }

    try {
      await createSwapInvestor(createForm.wallet_address)
      toast.success("Investor created successfully!")
      setOpenCreateDialog(false)
      setCreateForm({
        wallet_address: ''
      })
      // Refresh data after creating
      handleRefresh()
    } catch (error) {
      toast.error("Failed to create investor. Please try again.")
    }
  }

  const handleUpdateSettings = () => {
    const swapFee = parseFloat(settingsForm.swap_fee_percent)
    const investorShare = parseFloat(settingsForm.investor_share_percent)

    if (isNaN(swapFee) || swapFee < 0 || swapFee > 100) {
      toast.error("Swap fee must be between 0 and 100")
      return
    }

    if (isNaN(investorShare) || investorShare < 0 || investorShare > 100) {
      toast.error("Investor share must be between 0 and 100")
      return
    }

    // Simulate API call
    toast.success("Settings updated successfully!")
    setOpenSettingsDialog(false)
  }

  const handleDeleteInvestor = (id: number) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = () => {
    if (confirmDeleteId) {
      // Simulate API call
      toast.success("Investor deleted successfully!")
      setConfirmDeleteId(null)
    }
  }

  // Use real data from API
  const investors = investorsRes?.data || []
  const pagination = investorsRes?.pagination || { total: 0, totalPages: 1, currentPage: 1 }

  const filteredInvestors = investors.filter((investor: any) => {
    const matchesSearch = investor.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCoin = coinFilter === 'all' || (Array.isArray(investor.coins) && investor.coins.includes(coinFilter))
    return matchesSearch && matchesCoin
  })

  const stats = {
    total: pagination.total,
    active: investors.filter((i: any) => i.active).length,
    totalAmount: investors.reduce((sum: number, i: any) => sum + (i.amount_usd || 0), 0),
    byCoin: investors.reduce((acc: any, i: any) => {
      if (Array.isArray(i.coins)) {
        i.coins.forEach((coin: string) => {
          acc[coin] = (acc[coin] || 0) + 1
        })
      }
      return acc
    }, {} as Record<string, number>)
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">Swap Investors Management</h2>
        <p className="text-muted-foreground">Manage swap investors and configure reward settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">Total Investors</p>
                <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
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
                <p className="text-black dark:text-white font-semibold text-sm">Active Investors</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
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
                <p className="text-black dark:text-white font-semibold text-sm">Total Amount</p>
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
                <p className="text-black dark:text-white font-semibold text-sm">Swap Fee</p>
                <p className="text-2xl font-bold text-orange-400">{mockSettings.swap_fee_percent}%</p>
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
          <TabsTrigger value="investors">Investors</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-black dark:text-white font-bold">Swap Investors</CardTitle>
                  <CardDescription className="text-muted-foreground">Manage and monitor swap investors</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Investor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Swap Investor</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Wallet Address <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Enter wallet address..."
                            value={createForm.wallet_address}
                            onChange={e => setCreateForm(f => ({ ...f, wallet_address: e.target.value }))}
                          />
                        </div>
                        

                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenCreateDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateInvestor} className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                          Create
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
                    placeholder="Search by wallet address..."
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
                     <SelectItem value="all">All Coins</SelectItem>
                     <SelectItem value="SOL">SOL</SelectItem>
                     <SelectItem value="USDT">USDT</SelectItem>
                   </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-20 border-b">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">ID</TableHead>
                      <TableHead className="font-semibold text-foreground">Wallet Address</TableHead>
                      <TableHead className="font-semibold text-foreground">Coin</TableHead>
                      <TableHead className="font-semibold text-foreground">Amount</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Created At</TableHead>
                      <TableHead className="font-semibold text-foreground">Actions</TableHead>
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
                                <span className="text-muted-foreground">No coins</span>
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
                              {investor.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(investor.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => handleDeleteInvestor(investor.swap_investor_id)}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No investors found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-black dark:text-white font-bold">Reward Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">Configure swap fees and investor share percentages</CardDescription>
                </div>
                <Dialog open={openSettingsDialog} onOpenChange={setOpenSettingsDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Reward Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Swap Fee Percentage <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="2.5"
                          value={settingsForm.swap_fee_percent}
                          onChange={e => setSettingsForm(f => ({ ...f, swap_fee_percent: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Percentage of swap fee charged on transactions
                        </p>
                      </div>
                      <div>
                        <Label>Investor Share Percentage <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="80"
                          value={settingsForm.investor_share_percent}
                          onChange={e => setSettingsForm(f => ({ ...f, investor_share_percent: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Percentage of fees shared with investors
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenSettingsDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateSettings} className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                        Update
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
                    <Label className="text-sm font-medium">Current Swap Fee</Label>
                    <p className="text-2xl font-bold text-blue-400">{mockSettings.swap_fee_percent}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Investor Share</Label>
                    <p className="text-2xl font-bold text-emerald-400">{mockSettings.investor_share_percent}%</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Information</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Swap fee is charged on all swap transactions</li>
                      <li>• Investor share determines how much of fees go to investors</li>
                      <li>• Total percentage should not exceed 100%</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this investor? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 