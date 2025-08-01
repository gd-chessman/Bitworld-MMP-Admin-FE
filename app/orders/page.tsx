"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getOrderHistory, getOrderStatistics } from "@/services/api/OrderService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Copy, Check, ChevronLeft, ExternalLink, ArrowDownLeft, ArrowUpRight, BarChart3, CheckCircle, Wallet as WalletIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLang } from "@/lang/useLang"
import Image from "next/image"

export default function OrdersPage() {
  const { t } = useLang()
  const [search, setSearch] = useState('')
  const [isBittworldFilter, setIsBittworldFilter] = useState<'all' | 'true' | 'false'>('all')
  const [page, setPage] = useState(1)
  const limit = 10
  const [copiedTxHash, setCopiedTxHash] = useState<string | null>(null)
  
  useEffect(() => { setPage(1) }, [search, isBittworldFilter])
  const { data, isLoading } = useQuery({
    queryKey: ["orders-history", search, isBittworldFilter, page],
    queryFn: () => getOrderHistory(search, page, limit, isBittworldFilter),
  })
  const { data: statistics, isLoading: isLoadingStats } = useQuery({
    queryKey: ["orders-statistics"],
    queryFn: getOrderStatistics,
  })

  const orders = (data && typeof data === 'object' && 'data' in data) ? (data as any).data || [] : []
  const totalPages = (data && typeof data === 'object' && 'totalPages' in data) ? (data as any).totalPages || 1 : 1

  function formatDate(dateStr?: string) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString()
  }

  function truncateMiddle(str: string, start: number = 4, end: number = 4) {
    if (!str) return '-';
    if (str.length <= start + end + 3) return str;
    return `${str.slice(0, start)}...${str.slice(-end)}`;
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTxHash(text)
      setTimeout(() => setCopiedTxHash(null), 2000)
    } catch {}
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-medium">{t("orders.statistics.total")}</CardTitle>
              <CardDescription className="text-xs">{t("orders.statistics.totalDesc")}</CardDescription>
            </div>
            <BarChart3 className="h-5 w-5 text-blue-400/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStats ? '...' : statistics?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-medium">{t("orders.statistics.executed")}</CardTitle>
              <CardDescription className="text-xs">{t("orders.statistics.executedDesc")}</CardDescription>
            </div>
            <CheckCircle className="h-5 w-5 text-emerald-500/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStats ? '...' : statistics?.executed ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-medium">{t("orders.statistics.mostActiveWallet")}</CardTitle>
              <CardDescription className="text-xs">{t("orders.statistics.mostActiveWalletDesc")}</CardDescription>
            </div>
            <WalletIcon className="h-5 w-5 text-orange-400/80" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? '...' : statistics?.mostActiveWallet ? (
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm break-all flex items-center gap-1">
                  {statistics.mostActiveWallet.solAddress
                    ? truncateMiddle(statistics.mostActiveWallet.solAddress)
                    : ''}
                  {statistics.mostActiveWallet.solAddress && (
                    <button
                      className="p-0.5 hover:bg-muted rounded"
                      onClick={() => handleCopy(statistics.mostActiveWallet.solAddress)}
                      title={t("orders.solAddress")}
                    >
                      {copiedTxHash === statistics.mostActiveWallet.solAddress ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </span>
                <span className="text-sm text-muted-foreground">{t("orders.statistics.orderCount", { count: statistics.mostActiveWallet.orderCount })}</span>
              </div>
            ) : (
              <span>-</span>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("orders.title")}</h2>
        <p className="text-muted-foreground">{t("orders.description")}</p>
      </div>
      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("orders.listTitle")}</CardTitle>
              <CardDescription>{t("orders.listDescription")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("orders.searchPlaceholder")}
                className="pl-8 w-full md:max-w-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select 
              value={isBittworldFilter} 
              onValueChange={(value: 'all' | 'true' | 'false') => setIsBittworldFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("orders.filters.all")}</SelectItem>
                <SelectItem value="true">{t("orders.filters.bittworld")}</SelectItem>
                <SelectItem value="false">{t("orders.filters.nonBittworld")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.stt")}</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.solAddress")}</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.bittworldUid")}</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.trade")}</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.token")}</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.quantity")}</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.price")}</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.total")}</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.status")}</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.createdAt")}</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">{t("orders.txHash")}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={12} className="text-center py-8">Loading...</td></tr>
                ) : orders.length ? (
                  orders.map((order: any, idx: number) => (
                    <tr key={order.order_id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2 text-xs text-center">{(page - 1) * limit + idx + 1}</td>
                      <td className="px-4 py-2 font-mono text-xs">
                        <div className="flex items-center gap-1">
                          <span>{truncateMiddle(order.solAddress)}</span>
                          {order.solAddress && (
                            <button
                              className="p-0.5 hover:bg-muted rounded"
                              onClick={() => handleCopy(order.solAddress)}
                              title={t("orders.solAddress")}
                            >
                              {copiedTxHash === order.solAddress ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                          {order.isBittworld && (
                            <Image
                              src="/favicon.png"
                              alt="Bittworld"
                              width={16}
                              height={16}
                              className="w-4 h-4 rounded"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {order.isBittworld && order.bittworldUid ? (
                          <span className="font-mono">{order.bittworldUid}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            order.order_trade_type === 'buy'
                              ? 'inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-sm border border-emerald-200'
                              : 'inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-sm border border-red-200'
                          }
                        >
                          {order.order_trade_type === 'buy' ? (
                            <ArrowDownLeft className="h-2.5 w-2.5 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="h-2.5 w-2.5 text-red-500" />
                          )}
                          {t(`orders.${order.order_trade_type}`)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-semibold">{order.order_token_name || '-'}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground break-all">
                          <span>{truncateMiddle(order.order_token_address)}</span>
                          {order.order_token_address && (
                            <button
                              className="p-0.5 hover:bg-muted rounded"
                              onClick={() => handleCopy(order.order_token_address)}
                              title={t("orders.token")}
                            >
                              {copiedTxHash === order.order_token_address ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">{order.order_qlty}</td>
                      <td className="px-4 py-2">{order.order_price}</td>
                      <td className="px-4 py-2">{order.order_total_value}</td>
                      <td className="px-4 py-2">
                        <span className={
                          order.order_status === 'executed'
                            ? 'bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs'
                            : 'bg-red-100 text-red-700 px-2 py-1 rounded text-xs'
                        }>
                          {t(`orders.${order.order_status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">{formatDate(order.order_created_at)}</td>
                      <td className="px-4 py-2 font-mono text-xs break-all max-w-[180px]">
                        {order.order_tx_hash ? (
                          <a
                            href={`https://solscan.io/tx/${order.order_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            title={t("orders.viewOnSolscan")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={12} className="text-center py-8">{t("orders.noData")}</td></tr>
                )}
              </tbody>
            </table>
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
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
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
