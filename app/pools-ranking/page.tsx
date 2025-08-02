"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  Eye
} from "lucide-react"
import { useLang } from "@/lang/useLang"

// Mock data for VIP pools ranking
const mockVipPools = [
  {
    id: 1,
    name: "Elite Pool Alpha",
    slug: "elite-pool-alpha",
    logo: "https://via.placeholder.com/60x60?text=VIP7",
    volume: 45000000,
    members: 1250,
    status: "active",
    creator: "CryptoKing",
    creatorAddress: "4HND2bdKBTT5uxmGWTgZLhSn8Xvm4LTP1XXVvXyrGT8N",
    isBittworld: true,
    bittworldUid: "802370",
    creationDate: "2024-01-15T00:00:00Z",
    rank: "v7"
  },
  {
    id: 2,
    name: "Premium Pool Beta",
    slug: "premium-pool-beta", 
    logo: "https://via.placeholder.com/60x60?text=VIP7",
    volume: 38000000,
    members: 980,
    status: "active",
    creator: "BlockchainBaron",
    creatorAddress: "7KJN8mPqRsT2vXyZ9wE3fG5hL6nQ8rT1uI4oP7a",
    isBittworld: false,
    bittworldUid: null,
    creationDate: "2024-01-20T00:00:00Z",
    rank: "v7"
  },
  {
    id: 3,
    name: "Gold Pool Gamma",
    slug: "gold-pool-gamma",
    logo: "https://via.placeholder.com/60x60?text=VIP6",
    volume: 25000000,
    members: 750,
    status: "active",
    creator: "DeFiMaster",
    creatorAddress: "9MNB4kQrSt3wXyZ8vE2fG5hL6nQ7rT0uI3oP6a",
    isBittworld: true,
    bittworldUid: "456789",
    creationDate: "2024-02-01T00:00:00Z",
    rank: "v6"
  },
  {
    id: 4,
    name: "Silver Pool Delta",
    slug: "silver-pool-delta",
    logo: "https://via.placeholder.com/60x60?text=VIP6",
    volume: 22000000,
    members: 680,
    status: "active",
    creator: "TokenTrader",
    creatorAddress: "2LMB5jPsTu4xXyZ9wF3gH6iL7nQ8rT1uI4oP7b",
    isBittworld: false,
    bittworldUid: null,
    creationDate: "2024-02-05T00:00:00Z",
    rank: "v6"
  },
  {
    id: 5,
    name: "Bronze Pool Epsilon",
    slug: "bronze-pool-epsilon",
    logo: "https://via.placeholder.com/60x60?text=VIP6",
    volume: 20000000,
    members: 620,
    status: "active",
    creator: "CryptoQueen",
    creatorAddress: "5KNC6kQtSv5yYz0xG4hI7jL8nQ9rT2uI5oP8c",
    isBittworld: true,
    bittworldUid: "123456",
    creationDate: "2024-02-10T00:00:00Z",
    rank: "v6"
  },
  {
    id: 6,
    name: "Standard Pool Zeta",
    slug: "standard-pool-zeta",
    logo: "https://via.placeholder.com/60x60?text=VIP5",
    volume: 15000000,
    members: 450,
    status: "active",
    creator: "PoolMaster",
    creatorAddress: "8POD7lRuTw6zZ1yH5iJ8kL9nQ0rT3uI6oP9d",
    isBittworld: false,
    bittworldUid: null,
    creationDate: "2024-02-15T00:00:00Z",
    rank: "v5"
  },
  {
    id: 7,
    name: "Basic Pool Eta",
    slug: "basic-pool-eta",
    logo: "https://via.placeholder.com/60x60?text=VIP5",
    volume: 12000000,
    members: 380,
    status: "active",
    creator: "StakeLord",
    creatorAddress: "3QPE8mSvUx7aZ2yI6jK9lL0nQ1rT4uI7oP0e",
    isBittworld: true,
    bittworldUid: "789012",
    creationDate: "2024-02-20T00:00:00Z",
    rank: "v5"
  },
  {
    id: 8,
    name: "Starter Pool Theta",
    slug: "starter-pool-theta",
    logo: "https://via.placeholder.com/60x60?text=VIP5",
    volume: 10000000,
    members: 320,
    status: "active",
    creator: "NewbiePooler",
    creatorAddress: "6RQF9nTwVy8bZ3yJ7kL0mM1nQ2rT5uI8oP1f",
    isBittworld: false,
    bittworldUid: null,
    creationDate: "2024-02-25T00:00:00Z",
    rank: "v5"
  },
  {
    id: 9,
    name: "Advanced Pool Iota",
    slug: "advanced-pool-iota",
    logo: "https://via.placeholder.com/60x60?text=VIP5",
    volume: 9500000,
    members: 280,
    status: "active",
    creator: "AdvancedTrader",
    creatorAddress: "1SQF0mSvUx6aY2xI5jK8kL9nQ0rT3uI6oP9d",
    isBittworld: true,
    bittworldUid: "345678",
    creationDate: "2024-03-01T00:00:00Z",
    rank: "v5"
  },
  {
    id: 10,
    name: "Pro Pool Kappa",
    slug: "pro-pool-kappa",
    logo: "https://via.placeholder.com/60x60?text=VIP5",
    volume: 8500000,
    members: 250,
    status: "active",
    creator: "ProInvestor",
    creatorAddress: "4TQF3nTwVy7bZ3yJ6jK7lL8nQ1rT4uI7oP0e",
    isBittworld: false,
    bittworldUid: null,
    creationDate: "2024-03-05T00:00:00Z",
    rank: "v5"
  }
]

export default function PoolsRankingPage() {
  const { t } = useLang()
  const router = useRouter()

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
      case "end":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Ended</Badge>
      case "error":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'v7':
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 'v6':
        return <Trophy className="h-6 w-6 text-orange-500" />
      case 'v5':
        return <Medal className="h-6 w-6 text-blue-500" />
      default:
        return <Star className="h-6 w-6 text-gray-500" />
    }
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'v7':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 'v6':
        return 'bg-gradient-to-r from-orange-400 to-orange-600'
      case 'v5':
        return 'bg-gradient-to-r from-blue-400 to-blue-600'
      default:
        return 'bg-gray-500'
    }
  }

  const getRankLabel = (rank: string) => {
    switch (rank) {
      case 'v7':
        return 'VIP 7 (30M+)'
      case 'v6':
        return 'VIP 6 (20M-30M)'
      case 'v5':
        return 'VIP 5 (10M-20M)'
      default:
        return rank
    }
  }

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'v7':
        return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">VIP 7</Badge>
      case 'v6':
        return <Badge className="bg-gradient-to-r from-orange-400 to-orange-600 text-white border-0">VIP 6</Badge>
      case 'v5':
        return <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white border-0">VIP 5</Badge>
      default:
        return <Badge variant="secondary">{rank}</Badge>
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">VIP Pools Ranking</h2>
            <p className="text-muted-foreground">Exclusive pools with highest volume and performance</p>
          </div>
        </div>
      </div>

      {/* VIP Pools Table */}
      <Card>
        <CardHeader>
          <CardTitle>VIP Pools Ranking Table</CardTitle>
          <CardDescription>All VIP pools sorted by volume and rank</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Pool</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Bittworld UID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockVipPools.map((pool, index) => (
                  <TableRow key={pool.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        {getRankBadge(pool.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={pool.logo}
                          alt={pool.name}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "https://via.placeholder.com/40x40?text=Pool"
                          }}
                        />
                        <div>
                          <div className="font-medium">{pool.name}</div>
                          <div className="text-sm text-muted-foreground">{pool.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-green-600">{formatVolume(pool.volume)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{pool.members.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(pool.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{pool.creator}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {truncateAddress(pool.creatorAddress)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {pool.isBittworld && pool.bittworldUid ? (
                        <span className="text-sm font-mono text-blue-600">{pool.bittworldUid}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(pool.creationDate)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/pools/${pool.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 