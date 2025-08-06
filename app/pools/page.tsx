"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  Eye,
  Copy,
  Check,
  TrendingUp,
  Activity,
  Database,
  Crown,
  BarChart3
} from "lucide-react"
import { getAirdropPools, getAirdropPoolsStats } from "@/services/api/AirdropService"
import { useLang } from "@/lang/useLang"



export default function PoolsPage() {
  const { t } = useLang()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [poolsData, setPoolsData] = useState<any>({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  })
  const [poolsStats, setPoolsStats] = useState<any>({
    totalPools: 0,
    activePools: 0,
    totalMembers: 0,
    totalVolume: 0,
    currentlyRunning: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Fetch pools data
  useEffect(() => {
    const fetchPools = async () => {
      try {
        setIsLoading(true)
        const response = await getAirdropPools(searchTerm, 1, 20)
        setPoolsData(response)
      } catch (error) {
        console.error('Failed to fetch pools:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPools()
  }, [searchTerm])

  // Fetch pools statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true)
        const response = await getAirdropPoolsStats()
        setPoolsStats(response)
      } catch (error) {
        console.error('Failed to fetch pools stats:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchStats()
  }, [])

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{t('pools.list.status.active')}</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('pools.list.status.pending')}</Badge>
      case "end":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">{t('pools.list.status.end')}</Badge>
      case "error":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">{t('pools.list.status.error')}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }



  const truncateAddress = (address: string, start: number = 4, end: number = 4) => {
    if (!address) return '-'
    if (address.length <= start + end + 3) return address
    return `${address.slice(0, start)}...${address.slice(-end)}`
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('pools.title')}</h2>
        <p className="text-muted-foreground">{t('pools.description')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card min-h-[140px] flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('pools.stats.totalPools')}</p>
              <p className="stat-value">{isLoadingStats ? '...' : poolsStats.totalPools}</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{isLoadingStats ? '...' : poolsStats.activePools} {t('pools.stats.activePools').toLowerCase()}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
              <Database className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </Card>

        <Card className="stat-card min-h-[140px] flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('pools.stats.totalMembers')}</p>
              <p className="stat-value">{isLoadingStats ? '...' : poolsStats.totalMembers.toLocaleString()}</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{t('pools.stats.acrossAllPools')}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="stat-card min-h-[140px] flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('pools.stats.totalVolume')}</p>
              <p className="stat-value">{isLoadingStats ? '...' : poolsStats.totalVolume?.toLocaleString()}</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <span>{t('pools.stats.combinedVolume')}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <BarChart3 className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="stat-card min-h-[140px] flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('pools.stats.activePools')}</p>
              <p className="stat-value">{isLoadingStats ? '...' : poolsStats.currentlyRunning}</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{t('pools.stats.currentlyRunning')}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full dark:border-white"
              onClick={() => router.push('/pools-ranking')}
            >
              <Crown className="h-4 w-4 mr-2 text-yellow-400" />
              VIP
            </Button>
          </div>
        </Card>
      </div>

      {/* Pools List */}
      <Card className="dashboard-card p-0 md:p-4">
        <CardHeader>
          <CardTitle>{t('pools.list.title')}</CardTitle>
          <CardDescription>{t('pools.list.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('pools.list.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Pools Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pools.list.table.pool')}</TableHead>
                  <TableHead>{t('pools.list.table.members')}</TableHead>
                  <TableHead>{t('pools.list.table.volume')}</TableHead>
                  <TableHead>{t('pools.list.table.status')}</TableHead>
                  <TableHead>{t('pools.list.table.creator')}</TableHead>
                  <TableHead>{t('pools.list.table.bittworldUid')}</TableHead>
                  <TableHead>{t('pools.list.table.dates')}</TableHead>
                  <TableHead className="text-right">{t('pools.list.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {t('pools.list.loading')}
                    </TableCell>
                  </TableRow>
                ) : (
                  poolsData.data.map((pool: any) => (
                    <TableRow key={pool.alp_id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={pool.alp_logo}
                            alt={pool.alp_name}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "https://via.placeholder.com/40x40?text=Pool"
                            }}
                          />
                          <div>
                            <div className="font-medium whitespace-nowrap">{pool.alp_name}</div>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">{pool.alp_slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{pool.alp_member_num.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{pool.apl_total_volume?.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(pool.apl_status)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {pool.originator.nick_name}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-muted-foreground font-mono">
                              {truncateAddress(pool.originator.solana_address)}
                            </span>
                            <button
                              onClick={() => handleCopyAddress(pool.originator.solana_address)}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {copiedAddress === pool.originator.solana_address ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            {pool.originator.isBittworld && (
                              <Image
                                src="/favicon.png"
                                alt="Bittworld"
                                width={16}
                                height={16}
                                className="w-4 h-4 rounded"
                              />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {pool.originator.isBittworld && pool.originator.bittworldUid ? (
                          <span className="font-mono">{pool.originator.bittworldUid}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-xs">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="whitespace-nowrap">{t('pools.list.table.created')}: {formatDate(pool.apl_creation_date)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="whitespace-nowrap">{t('pools.list.table.ends')}: {formatDate(pool.apl_end_date)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/pools/${pool.alp_id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('pools.list.table.view')}
                      </Button>
                    </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && poolsData.data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('pools.list.noResults')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 