"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  Copy,
  Check,
  TrendingUp,
  Activity,
  Database,
  ExternalLink,
  Crown
} from "lucide-react"
import { getAirdropPoolDetail } from "@/services/api/AirdropService"
import { useLang } from "@/lang/useLang"

// API response structure matches the provided JSON format

interface Member {
  memberId: number
  solanaAddress: string
  bittworldUid: string
  nickname: string
  isCreator: boolean
  joinDate: string
  totalStaked: number
  stakeCount: number
  status: string
}

interface Transaction {
  transactionId: number
  memberId: number
  solanaAddress: string
  bittworldUid: string
  nickname: string
  isCreator: boolean
  stakeAmount: string
  transactionDate: string
  status: string
  transactionHash: string
}

interface PoolData {
  poolId: number
  name: string
  slug: string
  logo: string
  describe: string
  memberCount: number
  totalVolume: string
  creationDate: string
  endDate: string
  status: string
  transactionHash: string
  creatorAddress: string
  creatorBittworldUid: string
  members: Member[]
  transactions: Transaction[]
}

export default function PoolDetailPage() {
  const { t } = useLang()
  const params = useParams()
  const router = useRouter()
  const poolId = params.id as string
  
  const [poolData, setPoolData] = useState<PoolData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchPoolData = async () => {
      if (!poolId) return
      
      try {
        setIsLoading(true)
        const response = await getAirdropPoolDetail(parseInt(poolId))
        setPoolData(response)
      } catch (error) {
        console.error('Failed to fetch pool details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPoolData()
  }, [poolId])

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedHash(hash)
      setTimeout(() => setCopiedHash(null), 2000)
    } catch (error) {
      console.error('Failed to copy hash:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{t('pool-detail.status.active')}</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('pool-detail.status.pending')}</Badge>
      case "end":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">{t('pool-detail.status.end')}</Badge>
      case "error":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">{t('pool-detail.status.error')}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }



  const truncateAddress = (address: string, start: number = 4, end: number = 4) => {
    if (!address) return '-'
    if (address.length <= start + end + 3) return address
    return `${address.slice(0, start)}...${address.slice(-end)}`
  }

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div></div>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('pool-detail.back')}
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t('pool-detail.loading')}</p>
        </div>
      </div>
    )
  }

  if (!poolData) {
    return (
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div></div>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          {t('pool-detail.notFound')}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{poolData.name}</h2>
          <p className="text-muted-foreground">{t('pool-detail.poolId')}: {poolData.poolId}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      {/* Pool Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card min-h-[140px] flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('pool-detail.stats.totalMembers')}</p>
              <p className="stat-value">{poolData.memberCount}</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{t('pool-detail.stats.activeParticipants')}</span>
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
              <p className="stat-label">{t('pool-detail.stats.totalVolume')}</p>
              <p className="stat-value">{poolData.totalVolume?.toLocaleString()}</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>{t('pool-detail.stats.combinedStakes')}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="stat-card min-h-[140px] flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('pool-detail.stats.status')}</p>
              <div className="stat-value">
                {getStatusBadge(poolData.status)}
              </div>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{t('pool-detail.stats.poolStatus')}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="stat-card min-h-[140px] flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('pool-detail.stats.transactions')}</p>
              <p className="stat-value">{poolData.transactions.length}</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <Database className="h-3 w-3" />
                <span>{t('pool-detail.stats.totalTransactions')}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <Database className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t('pool-detail.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="members">{t('pool-detail.tabs.members')}</TabsTrigger>
          <TabsTrigger value="transactions">{t('pool-detail.tabs.transactions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Pool Details */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pool Information */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>{t('pool-detail.overview.poolInfo.title')}</CardTitle>
                <CardDescription>{t('pool-detail.overview.poolInfo.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={poolData.logo}
                    alt={poolData.name}
                    className="h-16 w-16 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "https://via.placeholder.com/64x64?text=Pool"
                    }}
                  />
                  <div>
                    <h3 className="font-semibold">{poolData.name}</h3>
                    <p className="text-sm text-muted-foreground">{poolData.slug}</p>
                    {getStatusBadge(poolData.status)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('pool-detail.overview.poolInfo.description')}</label>
                    <p className="text-sm">{poolData.describe}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('pool-detail.overview.poolInfo.creationDate')}</label>
                      <p className="text-sm">{formatDate(poolData.creationDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('pool-detail.overview.poolInfo.endDate')}</label>
                      <p className="text-sm">{formatDate(poolData.endDate)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creator Information */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>{t('pool-detail.overview.creatorInfo.title')}</CardTitle>
                <CardDescription>{t('pool-detail.overview.creatorInfo.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">{t('pool-detail.overview.creatorInfo.poolCreator')}</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('pool-detail.overview.creatorInfo.bittworldUid')}</label>
                    <p className="text-sm font-mono">{poolData.creatorBittworldUid}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('pool-detail.overview.creatorInfo.solanaAddress')}</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">{truncateAddress(poolData.creatorAddress)}</span>
                      <button
                        onClick={() => handleCopyHash(poolData.creatorAddress)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {copiedHash === poolData.creatorAddress ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('pool-detail.overview.creatorInfo.transactionHash')}</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">{truncateAddress(poolData.transactionHash)}</span>
                      <button
                        onClick={() => handleCopyHash(poolData.transactionHash)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {copiedHash === poolData.transactionHash ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
                 </TabsContent>

         <TabsContent value="members" className="space-y-4">
           {/* Members List */}
           <Card className="dashboard-card p-0 md:p-4">
             <CardHeader>
               <CardTitle>{t('pool-detail.members.title')}</CardTitle>
               <CardDescription>{t('pool-detail.members.description')}</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="rounded-md border">
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>{t('pool-detail.members.table.member')}</TableHead>
                       <TableHead>{t('pool-detail.members.table.bittworldUid')}</TableHead>
                       <TableHead>{t('pool-detail.members.table.totalStaked')}</TableHead>
                       <TableHead>{t('pool-detail.members.table.stakeCount')}</TableHead>
                       <TableHead>{t('pool-detail.members.table.status')}</TableHead>
                       <TableHead>{t('pool-detail.members.table.joinDate')}</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {poolData.members.map((member) => (
                       <TableRow key={member.memberId}>
                         <TableCell>
                           <div className="flex items-center space-x-3">
                             {member.isCreator && (
                               <Crown className="h-4 w-4 text-yellow-500" />
                             )}
                             <div>
                               <div className="font-medium">{member.nickname}</div>
                               <div className="text-sm text-muted-foreground">
                                 {truncateAddress(member.solanaAddress)}
                               </div>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="text-sm font-mono">{member.bittworldUid}</div>
                         </TableCell>
                         <TableCell>
                           <div className="font-medium">{member.totalStaked?.toLocaleString()}</div>
                         </TableCell>
                         <TableCell>
                           <div className="text-sm">{member.stakeCount}</div>
                         </TableCell>
                         <TableCell>
                           {getStatusBadge(member.status)}
                         </TableCell>
                         <TableCell>
                           <div className="text-sm">{formatDate(member.joinDate)}</div>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>
             </CardContent>
           </Card>
         </TabsContent>

         <TabsContent value="transactions" className="space-y-4">
          {/* Transactions List */}
          <Card className="dashboard-card p-0 md:p-4">
            <CardHeader>
              <CardTitle>{t('pool-detail.transactions.title')}</CardTitle>
              <CardDescription>{t('pool-detail.transactions.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                    <TableHeader>
                     <TableRow>
                       <TableHead>{t('pool-detail.transactions.table.member')}</TableHead>
                       <TableHead>{t('pool-detail.transactions.table.bittworldUid')}</TableHead>
                       <TableHead>{t('pool-detail.transactions.table.stakeAmount')}</TableHead>
                       <TableHead>{t('pool-detail.transactions.table.status')}</TableHead>
                       <TableHead>{t('pool-detail.transactions.table.date')}</TableHead>
                       <TableHead>{t('pool-detail.transactions.table.transactionHash')}</TableHead>
                     </TableRow>
                   </TableHeader>
                  <TableBody>
                    {poolData.transactions.map((transaction) => (
                      <TableRow key={transaction.transactionId}>
                        <TableCell>
                           <div className="flex items-center space-x-3">
                             {transaction.isCreator && (
                               <Crown className="h-4 w-4 text-yellow-500" />
                             )}
                             <div>
                               <div className="font-medium">{transaction.nickname}</div>
                               <div className="text-sm text-muted-foreground">
                                 {truncateAddress(transaction.solanaAddress)}
                               </div>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="text-sm font-mono">{transaction.bittworldUid}</div>
                         </TableCell>
                         <TableCell>
                           <div className="font-medium">{transaction.stakeAmount?.toLocaleString()}</div>
                         </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(transaction.transactionDate)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono">{truncateAddress(transaction.transactionHash)}</span>
                            <button
                              onClick={() => handleCopyHash(transaction.transactionHash)}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {copiedHash === transaction.transactionHash ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 