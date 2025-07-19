"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Users, CreditCard, Activity, Monitor, Smartphone, Tablet, CheckCircle, Wallet as WalletIcon, Copy, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/lang/useLang"
import { useQuery } from "@tanstack/react-query"
import { getDashboardStatistics } from "@/services/api/DashboardService"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"


const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

// Define types for analytics data
interface AnalyticsData {
  total: number
  master: number
  member: number
  vip: number
  normal: number
  anonymous: number
  devices: {
    deviceTypes: Record<string, number>
    browsers: Record<string, number>
    os: Record<string, number>
  }
  connections: Array<{
    clientId: string
    walletId: number
    solAddress?: string
    lastActive: number
    device?: {
      browser: string
      os: string
      device: string
    }
  }>
}

export default function AdminDashboard() {
  const { t } = useLang()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    total: 0,
    master: 0,
    member: 0,
    vip: 0,
    normal: 0,
    anonymous: 0,
    devices: {
      deviceTypes: {},
      browsers: {},
      os: {}
    },
    connections: []
  })
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null)
  const { data: dashboardStats, isLoading: isLoadingDashboardStats } = useQuery({
    queryKey: ["dashboard-statistics"],
    queryFn: getDashboardStatistics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/admin`, {
      query: {
        keyAdmin: 'ws-admin-key'
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io'
    })

    socket.on('onlineStats', (stats: AnalyticsData) => {
      setAnalyticsData(stats)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Helper function to get device icon
  function getDeviceIcon(type: string) {
    switch (type.toLowerCase()) {
      case "desktop":
        return <Monitor className="h-4 w-4" />
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  // Transform device data for charts
  const deviceDistributionData = Object.entries(analyticsData.devices.deviceTypes).map(([name, value]) => ({
    name,
    value: (value / analyticsData.total) * 100 || 0
  }))

  // Transform browser data for charts
  const browserData = Object.entries(analyticsData.devices.browsers).map(([name, value]) => ({
    name,
    value
  }))

  // Transform OS data for charts
  const osData = Object.entries(analyticsData.devices.os).map(([name, value]) => ({
    name,
    value
  }))

  function truncateMiddle(str: string, start: number = 4, end: number = 4) {
    if (!str) return '-';
    if (str.length <= start + end + 3) return str;
    return `${str.slice(0, start)}...${str.slice(-end)}`;
  }

  const handleCopyWallet = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedWallet(text)
      setTimeout(() => setCopiedWallet(null), 2000)
    } catch {}
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.hello')}</h2>
        <p className="text-muted-foreground">{t('dashboard.overview')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Wallets Card */}
        <Card className="stat-card min-h-[140px] flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('dashboard.wallets.title')}</p>
              <p className="stat-value">{isLoadingDashboardStats ? '...' : dashboardStats?.wallets?.totalWallets ?? 0}</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{dashboardStats?.wallets?.activeWallets ?? 0} {t('dashboard.wallets.active')}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
              <WalletIcon className="h-6 w-6 text-cyan-500" />
            </div>
          </div>
        </Card>

        {/* Orders Card */}
        <Card className="stat-card min-h-[140px] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span className="text-emerald-500 font-semibold text-base">{t('dashboard.orders.title')}</span>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="flex justify-between px-2">
              <span className="text-black dark:text-white font-medium text-xs">{t('dashboard.orders.executed').charAt(0).toUpperCase() + t('dashboard.orders.executed').slice(1)}:</span>
              <span className="text-emerald-600 dark:text-emerald-300 font-bold text-sm">{dashboardStats?.orders?.executedOrders ?? 0}</span>
            </div>
            <div className="flex justify-between px-2">
              <span className="text-black dark:text-white font-medium text-xs">{t('dashboard.orders.totalVolume').charAt(0).toUpperCase() + t('dashboard.orders.totalVolume').slice(1)}:</span>
              <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">${dashboardStats?.orders?.totalVolume ?? 0}</span>
            </div>
            {dashboardStats?.orders?.mostActiveWallet && (
              <div className="flex flex-col gap-1 px-2 mt-2">
                <span className="text-black dark:text-white font-medium text-xs">{t('dashboard.orders.mostActiveWallet')}</span>
                <span className="text-black dark:text-white font-bold text-sm">{dashboardStats.orders.mostActiveWallet.nickName || '-'} ({dashboardStats.orders.mostActiveWallet.solanaAddress?.slice(0,4)}...{dashboardStats.orders.mostActiveWallet.solanaAddress?.slice(-4)})</span>
                <span className="text-black dark:text-white text-xs">{t('dashboard.orders.orderCount', { count: dashboardStats.orders.mostActiveWallet.orderCount })}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Normal Affiliate Card */}
        {/* <Card className="stat-card min-h-[180px] flex flex-col justify-between border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-emerald-400 font-semibold text-base">{t('dashboard.referrals.normal')}</span>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="flex justify-between px-2">
              <span className="text-slate-400 font-medium text-xs">{t('dashboard.referrals.wallets').charAt(0).toUpperCase() + t('dashboard.referrals.wallets').slice(1)}:</span>
              <span className="text-slate-200 font-bold text-sm">{dashboardStats?.referrals?.traditionalReferrals?.totalWallets ?? 0}</span>
            </div>
            <div className="flex justify-between px-2">
              <span className="text-slate-400 font-medium text-xs">{t('dashboard.referrals.relations').charAt(0).toUpperCase() + t('dashboard.referrals.relations').slice(1)}:</span>
              <span className="text-slate-200 font-bold text-sm">{dashboardStats?.referrals?.traditionalReferrals?.totalRelations ?? 0}</span>
            </div>
            <div className="flex justify-between px-2">
              <span className="text-slate-400 font-medium text-xs">{t('dashboard.referrals.rewards').charAt(0).toUpperCase() + t('dashboard.referrals.rewards').slice(1)}:</span>
              <span className="text-emerald-300 font-bold text-sm">${dashboardStats?.referrals?.traditionalReferrals?.totalRewards ?? 0}</span>
            </div>
            <div className="flex justify-between px-2">
              <span className="text-slate-400 font-medium text-xs">{t('dashboard.referrals.volume').charAt(0).toUpperCase() + t('dashboard.referrals.volume').slice(1)}:</span>
              <span className="text-orange-300 font-bold text-sm">${dashboardStats?.referrals?.traditionalReferrals?.totalVolume ?? 0}</span>
            </div>
          </div>
        </Card> */}

        {/* BG Affiliate Card */}
        <Card className="stat-card min-h-[180px] flex flex-col justify-between border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-blue-400 font-semibold text-base">{t('dashboard.referrals.bg')}</span>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="flex justify-between px-2">
              <span className="text-black dark:text-white font-medium text-xs">{t('dashboard.referrals.trees').charAt(0).toUpperCase() + t('dashboard.referrals.trees').slice(1)}:</span>
              <span className="text-black dark:text-white font-bold text-sm">{dashboardStats?.referrals?.bgAffiliate?.totalTrees ?? 0}</span>
            </div>
            <div className="flex justify-between px-2">
              <span className="text-black dark:text-white font-medium text-xs">{t('dashboard.referrals.members').charAt(0).toUpperCase() + t('dashboard.referrals.members').slice(1)}:</span>
              <span className="text-black dark:text-white font-bold text-sm">{dashboardStats?.referrals?.bgAffiliate?.totalMembers ?? 0}</span>
            </div>
            <div className="flex justify-between px-2">
              <span className="text-black dark:text-white font-medium text-xs">{t('dashboard.referrals.commission').charAt(0).toUpperCase() + t('dashboard.referrals.commission').slice(1)}:</span>
              <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">${dashboardStats?.referrals?.bgAffiliate?.totalCommissionDistributed ?? 0}</span>
            </div>
            <div className="flex justify-between px-2">
              <span className="text-black dark:text-white font-medium text-xs">{t('dashboard.referrals.volume').charAt(0).toUpperCase() + t('dashboard.referrals.volume').slice(1)}:</span>
              <span className="text-orange-600 dark:text-orange-300 font-bold text-sm">${dashboardStats?.referrals?.bgAffiliate?.totalVolume ?? 0}</span>
            </div>
          </div>
        </Card>

        {/* Active Users Card */}
        <Card className="stat-card min-h-[140px] flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('dashboard.activeUsers')}</p>
              <p className="stat-value">{analyticsData.total}</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{t('dashboard.onlineNow')}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 lg:w-auto">
          <TabsTrigger value="analytics">{t('dashboard.tabs.analytics')}</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="space-y-4">
          {/* 3 New Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Chart 1: Wallets */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>{t('dashboard.walletsOverview.title')}</CardTitle>
                <CardDescription>{t('dashboard.walletsOverview.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: t('dashboard.walletsOverview.totalWallets'), value: dashboardStats?.wallets?.totalWallets ?? 0 },
                    { name: t('dashboard.walletsOverview.activeWallets'), value: dashboardStats?.wallets?.activeWallets ?? 0 },
                    { name: t('dashboard.walletsOverview.newToday'), value: dashboardStats?.wallets?.newWalletsToday ?? 0 },
                    { name: t('dashboard.walletsOverview.newThisWeek'), value: dashboardStats?.wallets?.newWalletsThisWeek ?? 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 2: Orders */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>{t('dashboard.ordersOverview.title')}</CardTitle>
                <CardDescription>{t('dashboard.ordersOverview.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: t('dashboard.ordersOverview.totalOrders'), value: dashboardStats?.orders?.totalOrders ?? 0 },
                    { name: t('dashboard.ordersOverview.executed'), value: dashboardStats?.orders?.executedOrders ?? 0 },
                    { name: t('dashboard.ordersOverview.pending'), value: dashboardStats?.orders?.pendingOrders ?? 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 3: Referrals */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>{t('dashboard.referralsOverview.title')}</CardTitle>
                <CardDescription>{t('dashboard.referralsOverview.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { 
                      name: t('dashboard.referralsOverview.normalRewards'), 
                      value: dashboardStats?.referrals?.traditionalReferrals?.totalRewards ?? 0 
                    },
                    { 
                      name: t('dashboard.referralsOverview.bgCommission'), 
                      value: dashboardStats?.referrals?.bgAffiliate?.totalCommissionDistributed ?? 0 
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Existing Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 dashboard-card">
              <CardHeader className="pb-2">
                <CardTitle>{t('dashboard.trafficAnalysis.title')}</CardTitle>
                <CardDescription>{t('dashboard.trafficAnalysis.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="area">
                  <TabsList className="mb-4">
                    <TabsTrigger value="area">{t('dashboard.trafficAnalysis.area')}</TabsTrigger>
                    <TabsTrigger value="line">{t('dashboard.trafficAnalysis.line')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="area">
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart
                        data={browserData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <defs>
                          <linearGradient id="browserGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="osGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                        <XAxis 
                          dataKey="name" 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                          }}
                          cursor={{ fill: "hsl(var(--muted))" }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--chart-1))"
                          fill="url(#browserGradient)"
                          strokeWidth={2}
                          animationDuration={1500}
                          animationBegin={0}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  <TabsContent value="line">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={osData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                        <XAxis 
                          dataKey="name" 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                          }}
                          cursor={{ fill: "hsl(var(--muted))" }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={{ 
                            fill: "hsl(var(--chart-2))",
                            strokeWidth: 2,
                            r: 4
                          }}
                          activeDot={{ 
                            fill: "hsl(var(--chart-2))",
                            stroke: "hsl(var(--background))",
                            strokeWidth: 2,
                            r: 6
                          }}
                          animationDuration={1500}
                          animationBegin={0}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <Card className="col-span-4 md:col-span-3 dashboard-card">
              <CardHeader className="pb-2">
                <CardTitle>{t('dashboard.deviceDistribution.title')}</CardTitle>
                <CardDescription>{t('dashboard.deviceDistribution.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        {COLORS.map((color, index) => (
                          <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0.2}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={deviceDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent ?? 0 * 100).toFixed(1)}%`}
                        outerRadius={100}
                        innerRadius={60}
                        fill="hsl(var(--chart-1))"
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={0}
                      >
                        {deviceDistributionData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#gradient-${index % COLORS.length})`}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        formatter={(value, entry) => (
                          <span style={{ color: "hsl(var(--foreground))" }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t('dashboard.activeConnections.title')}</CardTitle>
              <CardDescription>{t('dashboard.activeConnections.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left font-medium">{t('dashboard.activeConnections.clientId')}</th>
                        <th className="h-12 px-4 text-left font-medium">{t('dashboard.activeConnections.solAddress')}</th>
                        <th className="h-12 px-4 text-left font-medium">{t('dashboard.activeConnections.device')}</th>
                        <th className="h-12 px-4 text-left font-medium">{t('dashboard.activeConnections.lastActive')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.connections.map((connection) => (
                        <tr key={connection.clientId} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-mono text-xs">{connection.clientId}</td>
                          <td className="p-4 align-middle">
                            {connection.solAddress ? (
                              <span className="font-mono text-xs break-all flex items-center gap-1">
                                {truncateMiddle(connection.solAddress)}
                                <button
                                  className="p-0.5 hover:bg-muted rounded"
                                  onClick={() => handleCopyWallet(connection.solAddress!)}
                                  title={t("orders.solAddress")}
                                >
                                  {copiedWallet === connection.solAddress ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            {connection.device && (
                              <div className="flex items-center gap-2">
                                {getDeviceIcon(connection.device.device)}
                                <span>{connection.device.browser}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 align-middle text-muted-foreground">
                            {new Date(connection.lastActive).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
