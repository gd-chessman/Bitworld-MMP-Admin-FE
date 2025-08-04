"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft, 
  Crown, 
  Trophy, 
  Medal, 
  Star,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Copy,
  Check
} from "lucide-react"
import { useLang } from "@/lang/useLang"
import { getAirdropPoolLeaderboard } from "@/services/api/AirdropService"
import Image from "next/image"

// Interface for leaderboard data
interface LeaderboardItem {
  rank: number
  poolId: number
  poolName: string
  poolSlug: string
  poolLogo: string
  totalPoolVolume: number
  memberCount: number
  volumeTier: string
  walletId: number
  solanaAddress: string
  nickName: string
  isBittworld: boolean
  bittworldUid: string
  stakedVolume: number
  percentageOfPool: number
  isCreator: boolean
  stakingDate: string
}

interface LeaderboardResponse {
  success: boolean
  message: string
  data: LeaderboardItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function PoolsRankingPage() {
  const { t } = useLang()
  const router = useRouter()
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<'v7' | 'v6' | 'v5'>('v7')

  // Get volume range based on selected tier
  const getVolumeRange = (tier: string) => {
    switch (tier) {
      case 'v7':
        return { minVolume: 30000000, maxVolume: undefined }
      case 'v6':
        return { minVolume: 20000000, maxVolume: 30000000 }
      case 'v5':
        return { minVolume: 10000000, maxVolume: 20000000 }
      default:
        return { minVolume: 30000000, maxVolume: undefined }
    }
  }

  const volumeRange = getVolumeRange(selectedTier)

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading, error } = useQuery<LeaderboardResponse>({
    queryKey: ['pools-leaderboard', selectedTier],
    queryFn: () => getAirdropPoolLeaderboard(volumeRange.minVolume, volumeRange.maxVolume),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const leaderboardItems = leaderboardData?.data || []


  const formatVolume = (volume: number) => {
    return volume.toLocaleString()
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(text)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'v7':
        return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 whitespace-nowrap">VIP 7</Badge>
      case 'v6':
        return <Badge className="bg-gradient-to-r from-orange-400 to-orange-600 text-white border-0 whitespace-nowrap">VIP 6</Badge>
      case 'v5':
        return <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white border-0 whitespace-nowrap">VIP 5</Badge>
      case 'v4':
        return <Badge className="bg-gradient-to-r from-purple-400 to-purple-600 text-white border-0 whitespace-nowrap">VIP 4</Badge>
      default:
        return <Badge variant="secondary" className="whitespace-nowrap">{rank}</Badge>
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pools-ranking.title')}</h2>
          <p className="text-muted-foreground">{t('pools-ranking.description')}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('common.back')}</span>
        </Button>
      </div>

      {/* VIP Pools Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="whitespace-nowrap">{t('pools-ranking.cardTitle')}</CardTitle>
              <CardDescription>{t('pools-ranking.cardDescription')}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedTier === 'v7' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTier('v7')}
                className={selectedTier === 'v7' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
              >
                {t('pools-ranking.filters.vip7')}
              </Button>
              <Button
                variant={selectedTier === 'v6' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTier('v6')}
                className={selectedTier === 'v6' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                {t('pools-ranking.filters.vip6')}
              </Button>
              <Button
                variant={selectedTier === 'v5' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTier('v5')}
                className={selectedTier === 'v5' ? 'bg-blue-500 hover:bg-blue-600' : ''}
              >
                {t('pools-ranking.filters.vip5')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t('pools-ranking.table.rank')}</TableHead>
                  <TableHead>{t('pools-ranking.table.pool')}</TableHead>
                  <TableHead>{t('pools-ranking.table.volume')}</TableHead>
                  <TableHead>{t('pools-ranking.table.members')}</TableHead>
                  <TableHead>{t('pools-ranking.table.status')}</TableHead>
                  <TableHead>{t('pools-ranking.table.wallet')}</TableHead>
                  <TableHead>{t('pools-ranking.table.bittworldUid')}</TableHead>
                  <TableHead>{t('pools-ranking.table.created')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">{t('pools-ranking.loading')}</div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-red-400">{t('pools-ranking.error')}</div>
                    </TableCell>
                  </TableRow>
                ) : leaderboardItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">{t('pools-ranking.noData')}</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leaderboardItems.map((item) => (
                    <TableRow key={`${item.poolId}-${item.walletId}`} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-muted-foreground">#{item.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden">
                            {item.poolLogo ? (
                              <Image
                                src={item.poolLogo}
                                alt={item.poolName || 'Pool'}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "https://via.placeholder.com/40x40?text=Pool"
                                }}
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {item.poolName?.charAt(0)?.toUpperCase() || 'P'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{item.poolName || 'Unknown Pool'}</div>
                            <div className="text-sm text-muted-foreground">{item.poolSlug || '-'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-green-600">{formatVolume(item.stakedVolume || 0)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{(item.memberCount || 0).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{item.nickName || 'Unknown'}</div>
                          <div className="flex items-center gap-1">
                            <div className="text-xs text-muted-foreground font-mono">
                              {truncateAddress(item.solanaAddress)}
                            </div>
                            <button
                              className="p-0.5 hover:bg-muted rounded"
                              onClick={() => copyToClipboard(item.solanaAddress)}
                              title="Copy address"
                            >
                              {copiedAddress === item.solanaAddress ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            {item.isBittworld && (
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
                      <TableCell>
                        {item.isBittworld && item.bittworldUid ? (
                          <span className="text-sm font-mono text-blue-600">{item.bittworldUid}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{item.stakingDate ? formatDate(item.stakingDate) : '-'}</div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 