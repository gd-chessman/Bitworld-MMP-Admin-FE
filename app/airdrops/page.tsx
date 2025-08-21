"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Search, Gift, Plus, Copy, Check, Loader2, Edit, Download, ChevronLeft } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation } from "@tanstack/react-query"
import { getAirdropTokens, createAirdropToken, updateAirdropToken, calculateAirdropRewards, getAirdropRewards } from "@/services/api/AirdropAdminService"
import { airdropWithdraw } from "@/services/api/TopRoundService"
import { useLang } from "@/lang/useLang"
import { getMyInfor } from "@/services/api/UserAdminService"

// Use implicit any-shaped objects from API

export default function AirdropAdminPage() {
  const { t } = useLang()
  const { data: myInfor } = useQuery({
    queryKey: ["my-infor"],
    queryFn: getMyInfor,
    refetchOnMount: true,
  });

  // Check if user is partner (hide create, edit, calculate buttons)
  const isPartner = myInfor?.role === "partner"

  // UI state for tokens
  const [searchToken, setSearchToken] = useState("")
  const [status1, setStatus1] = useState<"all" | any>("all")
  const [status2, setStatus2] = useState<"all" | any>("all")

  // Create token form state
  const [newTokenName, setNewTokenName] = useState("")
  const [newTokenMint, setNewTokenMint] = useState("")
  const [newAmount1, setNewAmount1] = useState<string>("")
  const [newAmount2, setNewAmount2] = useState<string>("")

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingToken, setEditingToken] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isConfirmDistributeOpen, setIsConfirmDistributeOpen] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Edit form state
  const [editTokenName, setEditTokenName] = useState("")
  const [editTokenMint, setEditTokenMint] = useState("")
  const [editAmount1, setEditAmount1] = useState<string>("")
  const [editAmount2, setEditAmount2] = useState<string>("")
  const [editStatus1, setEditStatus1] = useState<any>("active")
  const [editStatus2, setEditStatus2] = useState<any>("active")

  // UI state for rewards
  const [searchReward, setSearchReward] = useState("")
  const [rewardStatus, setRewardStatus] = useState<"can_withdraw" | "withdrawn" | "all">("can_withdraw")
  const [rewardTokenMint, setRewardTokenMint] = useState<string>("all")

  // Server data: Tokens
  const [tokensPage, setTokensPage] = useState(1)
  const tokensLimit = 10
  const { data: tokensResp, isLoading: tokensLoading, refetch: refetchTokens } = useQuery({
    queryKey: ["airdrop-tokens", tokensPage, searchToken, status1, status2],
    queryFn: () =>
      getAirdropTokens({
        page: tokensPage,
        limit: tokensLimit,
        search: searchToken || undefined,
        status_1: (status1 === "all" ? undefined : status1) as any,
        status_2: (status2 === "all" ? undefined : status2) as any,
      }),
    placeholderData: (prev) => prev,
  })
  const tokens: any[] = tokensResp?.data ?? []

  // Server data: Ended Tokens (for filter dropdown)
  const { data: endedTokensResp } = useQuery({
    queryKey: ["airdrop-tokens-ended"],
    queryFn: () =>
      getAirdropTokens({
        page: 1,
        limit: 100, // Get more items for dropdown
        status_1: "end",
      }),
    placeholderData: (prev) => prev,
  })
  const allEndedTokens: any[] = endedTokensResp?.data ?? []
  
  // Remove duplicate tokens by alt_token_mint
  const endedTokens: any[] = allEndedTokens.filter((token, index, arr) => 
    arr.findIndex(t => t.alt_token_mint === token.alt_token_mint) === index
  )

  // Server data: Rewards
  const [rewardsPage, setRewardsPage] = useState(1)
  const rewardsLimit = 10
  const { data: rewardsResp, isLoading: rewardsLoading, refetch: refetchRewards } = useQuery({
    queryKey: ["airdrop-rewards", rewardsPage, searchReward, rewardStatus, rewardTokenMint],
    queryFn: () =>
      getAirdropRewards({
        page: rewardsPage,
        limit: rewardsLimit,
        status: (rewardStatus === "all" ? undefined : rewardStatus) as any,
        search: searchReward || undefined,
        token_mint: (rewardTokenMint === "all" ? undefined : rewardTokenMint),
      }),
    placeholderData: (prev) => prev,
  })
  const rewards: any[] = rewardsResp?.rewards ?? []

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: airdropWithdraw,
    onSuccess: (data) => {
      if (data.success) {
        if (data.processed === 0) {
          toast.success(t("airdrops.rewards.withdraw.messages.noRewards"))
        } else {
          toast.success(t("airdrops.rewards.withdraw.messages.completed", { 
            success: data.success_count, 
            errors: data.error_count 
          }))
        }
        refetchRewards()
      } else {
        toast.error(t("airdrops.rewards.withdraw.messages.failed"))
      }
    },
    onError: (error: any) => {
      toast.error(t("airdrops.rewards.withdraw.messages.failed"))
    },
    onSettled: () => {
      setIsWithdrawing(false)
    }
  })

  useEffect(() => {
    setTokensPage(1)
  }, [searchToken, status1, status2])

  useEffect(() => {
    setRewardsPage(1)
  }, [searchReward, rewardStatus, rewardTokenMint])

  // Handlers (call services directly like other pages)

  async function handleCreateToken() {
    const amount1 = Number(newAmount1) || 0
    const amount2 = Number(newAmount2) || 0

    if (!newTokenName.trim() || !newTokenMint.trim() || amount1 <= 0) {
      toast.error(t("airdrops.tokens.create.validation.fillRequired"))
      return
    }

    try {
      setIsCreating(true)
      const res = await createAirdropToken({
        token_name: newTokenName.trim(),
        token_mint: newTokenMint.trim(),
        amount_round_1: amount1,
      })
      if (!(res && res.success)) {
        throw new Error(res?.message || t("airdrops.tokens.create.error"))
      }
      toast.success(t("airdrops.tokens.create.success"))
      setIsCreateOpen(false)
      refetchTokens()
      setNewTokenName("")
      setNewTokenMint("")
      setNewAmount1("")
      setNewAmount2("")
    } catch (e: any) {
      const rawMsg = e?.response?.data?.message || e?.message || ""
      if (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("airdrop program for this token already exists")) {
        toast.error(t("airdrops.tokens.create.tokenExists"))
      } else {
        toast.error(t("airdrops.tokens.create.error"))
      }
    } finally {
      setIsCreating(false)
    }
  }

  function handleOpenEdit(token: any) {
    setEditingToken(token)
    setEditTokenName(token.alt_token_name)
    setEditTokenMint(token.alt_token_mint)
    setEditAmount1(String(token.alt_amount_airdrop_1))
    setEditAmount2(String(token.alt_amount_airdrop_2))
    setEditStatus1(token.alt_status_1)
    setEditStatus2(token.alt_status_2)
    setIsEditOpen(true)
  }

  async function handleUpdateToken() {
    if (!editingToken) return
    const amount1 = Number(editAmount1)
    if (!editTokenName.trim() || !editTokenMint.trim() || isNaN(amount1) || amount1 <= 0) {
      toast.error(t("airdrops.tokens.edit.validation.fillRequired"))
      return
    }
    try {
      setIsUpdating(true)
      const res = await updateAirdropToken(editingToken.alt_id, {
        token_name: editTokenName.trim(),
        token_mint: editTokenMint.trim(),
        amount_round_1: amount1,
        status_round_1: editStatus1,
      })
      if (!(res && res.success)) {
        throw new Error(res?.message || t("airdrops.tokens.edit.error"))
      }
      toast.success(t("airdrops.tokens.edit.success"))
      setIsEditOpen(false)
      setEditingToken(null)
      refetchTokens()
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t("airdrops.tokens.edit.error")
      toast.error(msg)
    } finally {
      setIsUpdating(false)
    }
  }

  function formatNumber(value: any): string {
    const num = typeof value === "number" ? value : Number(value ?? 0)
    if (!isFinite(num)) return "0"
    return num.toLocaleString()
  }

  function truncateMiddle(value: any, head: number = 6, tail: number = 6) {
    const str = String(value || "")
    if (str.length <= head + tail + 3) return str
    return `${str.slice(0, head)}...${str.slice(-tail)}`
  }

  const [copiedText, setCopiedText] = useState<string | null>(null)
  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 1500)
    } catch (e) {
      toast.error(t("airdrops.common.copyFailed"))
    }
  }

  function getStatusBadge(status: any) {
    const map: Record<string, string> = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      end: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      pause: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      cancel: "bg-red-500/10 text-red-500 border-red-500/20",
    }
    const className = map[status] || ""
    const translatedStatus = t(`airdrops.tokens.status.${status}`)
    return <Badge className={className}>{translatedStatus}</Badge>
  }

  async function handleCalculateRewards(forceRecalculate: boolean) {
    try {
      setIsCalculating(true)
      const res = await calculateAirdropRewards(forceRecalculate)
      if (!(res && res.success)) {
        throw new Error(res?.message || t("airdrops.tokens.calculate.error"))
      }
      toast.success(t("airdrops.tokens.calculate.success"))
      refetchTokens()
      refetchRewards()
    } catch (e: any) {
      const rawMsg = e?.response?.data?.message || e?.message || ""
      if (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("no active airdrop tokens found")) {
        toast.error(t("airdrops.tokens.calculate.noActiveTokens"))
      } else {
        toast.error(t("airdrops.tokens.calculate.error"))
      }
    } finally {
      setIsCalculating(false)
    }
  }

  async function handleWithdraw() {
    try {
      setIsWithdrawing(true)
      withdrawMutation.mutate()
    } catch (error) {
      console.error(t('airdrops.rewards.withdraw.messages.error'), error)
      setIsWithdrawing(false)
    }
  }



  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">{t("airdrops.title")}</h2>
        <p className="text-muted-foreground">{t("airdrops.description")}</p>
      </div>

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList>
          <TabsTrigger value="tokens">{t("airdrops.tabs.tokens")}</TabsTrigger>
          <TabsTrigger value="rewards">{t("airdrops.tabs.rewards")}</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-6">
          
          <Card className="dashboard-card p-0 md:p-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle>{t("airdrops.tokens.title")}</CardTitle>
                  <CardDescription>{t("airdrops.tokens.description")}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {!isPartner && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />{t("airdrops.tokens.newToken")}
                        </Button>
                      </DialogTrigger>
                     <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("airdrops.tokens.create.title")}</DialogTitle>
                         <DialogDescription>{t("airdrops.tokens.create.description")}</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <Label>{t("airdrops.tokens.create.tokenName")}</Label>
                          <Input placeholder={t("airdrops.tokens.create.tokenName")} value={newTokenName} onChange={(e) => setNewTokenName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>{t("airdrops.tokens.create.tokenMint")}</Label>
                          <Input placeholder={t("airdrops.tokens.create.tokenMint")} value={newTokenMint} onChange={(e) => setNewTokenMint(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>{t("airdrops.tokens.create.amountRound")}</Label>
                          <Input placeholder={t("airdrops.tokens.create.amountRound")} type="number" value={newAmount1} onChange={(e) => setNewAmount1(e.target.value)} />
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>{t("airdrops.tokens.create.cancel")}</Button>
                        <Button onClick={handleCreateToken} disabled={isCreating}>
                          {isCreating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("airdrops.tokens.create.creating")}
                            </>
                          ) : (
                            t("airdrops.tokens.create.create")
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  )}
                  {!isPartner && (
                    <Dialog open={isConfirmDistributeOpen} onOpenChange={setIsConfirmDistributeOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          disabled={isCalculating}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg"
                        >
                          {isCalculating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("airdrops.tokens.calculate.calculating")}
                            </>
                          ) : (
                            <>
                              <Gift className="h-4 w-4 mr-2" />
                              {t("airdrops.tokens.calculate.button")}
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-foreground font-bold flex items-center gap-2">
                            <Gift className="h-5 w-5 text-emerald-400" />
                            {t("airdrops.tokens.calculate.confirmTitle")}
                          </DialogTitle>
                          <DialogDescription>
                            {t("airdrops.tokens.calculate.confirmDescription")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <p className="text-sm text-amber-600 font-medium">
                              {t("airdrops.tokens.calculate.confirmWarning")}
                            </p>
                            <ul className="mt-2 text-xs text-amber-700/80 space-y-1 list-disc list-inside">
                              <li>{t("airdrops.tokens.calculate.confirmWarning1")}</li>
                              <li>{t("airdrops.tokens.calculate.confirmWarning2")}</li>
                              <li>{t("airdrops.tokens.calculate.confirmWarning3")}</li>
                            </ul>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline"
                            onClick={() => setIsConfirmDistributeOpen(false)}
                            disabled={isCalculating}
                          >
                            {t("airdrops.tokens.calculate.confirmCancel")}
                          </Button>
                          <Button 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                            disabled={isCalculating}
                            onClick={() => {
                              setIsConfirmDistributeOpen(false)
                              handleCalculateRewards(false)
                            }}
                          >
                            {isCalculating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("airdrops.tokens.calculate.calculating")}
                              </>
                            ) : (
                              <>
                                <Gift className="h-4 w-4 mr-2" />
                                {t("airdrops.tokens.calculate.confirmProceed")}
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8 w-full md:max-w-sm min-w-[140px]" placeholder={t("airdrops.tokens.searchPlaceholder")} value={searchToken} onChange={(e) => setSearchToken(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 ml-auto w-full md:w-auto justify-end">
                  <Select value={status1} onValueChange={(v) => setStatus1(v as any)}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("airdrops.placeholders.roundStatus")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("airdrops.tokens.filters.roundAll")}</SelectItem>
                      <SelectItem value="active">{t("airdrops.tokens.filters.roundActive")}</SelectItem>
                      <SelectItem value="pause">{t("airdrops.tokens.filters.roundPause")}</SelectItem>
                      <SelectItem value="end">{t("airdrops.tokens.filters.roundEnd")}</SelectItem>
                      <SelectItem value="cancel">{t("airdrops.tokens.filters.roundCancel")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-20 border-b">
                    <TableRow>
                      <TableHead>{t("airdrops.tokens.table.name")}</TableHead>
                      <TableHead>{t("airdrops.tokens.table.mint")}</TableHead>
                      <TableHead>{t("airdrops.tokens.table.amountRound")}</TableHead>
                      <TableHead>{t("airdrops.tokens.table.statusRound")}</TableHead>
                      
                      <TableHead>{t("airdrops.tokens.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokensLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">{t("airdrops.tokens.table.loading")}</TableCell>
                      </TableRow>
                    ) : tokens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">{t("airdrops.tokens.table.noData")}</TableCell>
                      </TableRow>
                    ) : (
                      tokens.map((token) => (
                        <TableRow key={token.alt_id}>
                          <TableCell>{token.alt_token_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs whitespace-nowrap">{truncateMiddle(token.alt_token_mint, 6, 6)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopy(String(token.alt_token_mint || ""))}
                                aria-label={t("airdrops.labels.copyTokenMint")}
                              >
                                {copiedText === token.alt_token_mint ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{formatNumber(token.alt_amount_airdrop_1)}</TableCell>
                          <TableCell className="whitespace-nowrap">{getStatusBadge(token.alt_status_1)}</TableCell>
                          
                          <TableCell>
                            {!isPartner && (
                              <Dialog open={isEditOpen && editingToken?.alt_id === token.alt_id} onOpenChange={(open) => {
                                if (!open) { setIsEditOpen(false); setEditingToken(null) }
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-8 w-8 p-0 ${token.alt_status_1 === 'end' || token.alt_status_1 === 'cancel' 
                                      ? 'text-muted-foreground/50 cursor-not-allowed' 
                                      : 'text-muted-foreground hover:text-emerald-300 hover:bg-muted/50'}`}
                                    onClick={() => handleOpenEdit(token)}
                                    aria-label={t("airdrops.labels.editToken")}
                                    disabled={token.alt_status_1 === 'end' || token.alt_status_1 === 'cancel'}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t("airdrops.tokens.edit.title")}</DialogTitle>
                                  <DialogDescription>{t("airdrops.tokens.edit.description")}</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 gap-3">
                                  <div className="space-y-1">
                                    <Label>{t("airdrops.tokens.edit.tokenName")}</Label>
                                    <Input value={editTokenName} onChange={(e) => setEditTokenName(e.target.value)} />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>{t("airdrops.tokens.edit.tokenMint")}</Label>
                                    <Input value={editTokenMint} onChange={(e) => setEditTokenMint(e.target.value)} />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>{t("airdrops.tokens.edit.amountRound")}</Label>
                                    <Input type="number" value={editAmount1} onChange={(e) => setEditAmount1(e.target.value)} />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>{t("airdrops.tokens.edit.statusRound")}</Label>
                                    <Select value={editStatus1} onValueChange={(v) => setEditStatus1(v as any)}>
                                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">{t("airdrops.tokens.status.active")}</SelectItem>
                                        <SelectItem value="pause">{t("airdrops.tokens.status.pause")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter className="gap-2">
                                  <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingToken(null) }} disabled={isUpdating}>{t("airdrops.tokens.edit.cancel")}</Button>
                                  <Button onClick={handleUpdateToken} disabled={isUpdating}>
                                    {isUpdating ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t("airdrops.tokens.edit.saving")}
                                      </>
                                    ) : (
                                      t("airdrops.tokens.edit.save")
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("airdrops.rewards.title")}</CardTitle>
                  <CardDescription>{t("airdrops.rewards.description")}</CardDescription>
                </div>
                {!isPartner && (
                  <Button 
                    onClick={handleWithdraw} 
                    disabled={isWithdrawing}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("airdrops.rewards.withdraw.processing")}
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        {t("airdrops.rewards.withdraw.processButton")}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8 w-full md:max-w-sm min-w-[140px]" placeholder={t("airdrops.rewards.searchPlaceholder")} value={searchReward} onChange={(e) => setSearchReward(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 ml-auto w-full md:w-auto justify-end">
                  <Select value={rewardTokenMint} onValueChange={(v) => setRewardTokenMint(v)}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder={t("airdrops.placeholders.token")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("airdrops.rewards.filters.allTokens")}</SelectItem>
                      {endedTokens.map((token) => (
                        <SelectItem key={token.alt_id} value={token.alt_token_mint}>
                          {token.alt_token_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={rewardStatus} onValueChange={(v) => setRewardStatus(v as any)}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder={t("airdrops.placeholders.status")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="can_withdraw">{t("airdrops.rewards.filters.canWithdraw")}</SelectItem>
                      <SelectItem value="withdrawn">{t("airdrops.rewards.filters.withdrawn")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-20 border-b">
                    <TableRow>
                      <TableHead>{t("airdrops.rewards.table.token")}</TableHead>
                      <TableHead>{t("airdrops.rewards.table.mint")}</TableHead>
                      <TableHead>{t("airdrops.rewards.table.walletAddress")}</TableHead>
                      <TableHead>{t("airdrops.rewards.table.email")}</TableHead>
                      <TableHead>{t("airdrops.rewards.table.amount")}</TableHead>
                      <TableHead>{t("airdrops.rewards.table.status")}</TableHead>
                      <TableHead>{t("airdrops.rewards.table.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewardsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">{t("airdrops.rewards.table.loading")}</TableCell>
                      </TableRow>
                    ) : rewards.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">{t("airdrops.rewards.table.noResults")}</TableCell>
                      </TableRow>
                    ) : (
                      rewards.map((r) => (
                        <TableRow key={r.ar_id}>
                          <TableCell>{r.token_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs whitespace-nowrap">{truncateMiddle(r.token_mint, 6, 6)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopy(String(r.token_mint || ""))}
                                aria-label={t("airdrops.labels.copyTokenMint")}
                              >
                                {copiedText === r.token_mint ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs whitespace-nowrap">{truncateMiddle(r.ar_wallet_address, 6, 6)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopy(String(r.ar_wallet_address || ""))}
                                aria-label={t("airdrops.labels.copyWalletAddress")}
                              >
                                {copiedText === r.ar_wallet_address ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{r.wallet_email}</TableCell>
                          <TableCell>{formatNumber(r.ar_amount)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className={r.ar_status === "can_withdraw" ? "text-emerald-600 border-emerald-300" : "text-blue-600 border-blue-300"}>
                              {t(`airdrops.rewards.status.${r.ar_status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(r.ar_date).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination for rewards */}
              {rewardsResp?.pagination && (
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRewardsPage(p => Math.max(1, p - 1))}
                    disabled={rewardsPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {rewardsPage} / {rewardsResp.pagination.totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRewardsPage(p => Math.min(rewardsResp.pagination.totalPages, p + 1))}
                    disabled={!rewardsResp.pagination.totalPages || rewardsPage >= rewardsResp.pagination.totalPages}
                  >
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
