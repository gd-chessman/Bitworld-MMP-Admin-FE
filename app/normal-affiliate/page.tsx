"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Wallet, Percent, Calendar, Search, Copy, Check, TrendingUp, Activity, UserPlus, Award, ChevronLeft } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { getNormalAffiliateStats, getNormalAffiliateStatistics, PaginationParams } from '@/services/api/NormalAffiliateService';
import { toast } from "sonner";
import { useLang } from "@/lang/useLang";

// Helper function to truncate address
function truncateAddress(address: string, start: number = 4, end: number = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export default function NormalAffiliateAdminPage() {
  const { t } = useLang();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [copiedRefCode, setCopiedRefCode] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch normal affiliate data for table with pagination
  const { data: normalAffiliateData, isLoading: tableLoading, error: tableError } = useQuery({
    queryKey: ['normal-affiliate-stats', currentPage, pageSize, searchTerm],
    queryFn: () => getNormalAffiliateStats({
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined
    }),
  });

  // Fetch statistics data for cards
  const { data: statisticsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['normal-affiliate-statistics'],
    queryFn: getNormalAffiliateStatistics,
  });

  // Get pagination info from API response
  const pagination = normalAffiliateData?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.total || 0;
  const wallets = normalAffiliateData?.data || [];

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (totalPages && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: 'address' | 'refCode') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'address') {
        setCopiedAddress(text);
        toast.success(t('normal-affiliate.copy.addressCopied'));
        setTimeout(() => setCopiedAddress(null), 2000);
      } else {
        setCopiedRefCode(text);
        toast.success(t('normal-affiliate.copy.refCodeCopied'));
        setTimeout(() => setCopiedRefCode(null), 2000);
      }
    } catch (error) {
      toast.error(t('normal-affiliate.copy.copyFailed'));
    }
  };

  // Get level badge color
  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-900/20 text-emerald-400 border-emerald-500/30";
      case 2:
        return "bg-blue-900/20 text-blue-400 border-blue-500/30";
      case 3:
        return "bg-purple-900/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-slate-900/20 text-slate-400 border-slate-500/30";
    }
  };

  // Pagination component
  const Pagination = () => {
    return (
      <div className="flex items-center justify-center space-x-4 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-slate-400">
          {currentPage} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!totalPages || currentPage >= totalPages}
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t('normal-affiliate.title')}</h1>
          <p className="text-slate-400 text-sm">{t('normal-affiliate.description')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Loading...</p>
                    <p className="text-2xl font-bold text-slate-400">...</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
                    <div className="h-4 w-4 bg-slate-400 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsError ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Error</p>
                    <p className="text-2xl font-bold text-red-400">-</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <div className="h-4 w-4 bg-red-400 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{t('normal-affiliate.stats.totalWallets')}</p>
                  <p className="text-2xl font-bold text-cyan-400">{statisticsData?.overview?.totalWallets || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{t('normal-affiliate.stats.totalReferralRelations')}</p>
                  <p className="text-2xl font-bold text-pink-400">{statisticsData?.overview?.totalReferralRelations || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{t('normal-affiliate.stats.totalRewards')}</p>
                  <p className="text-2xl font-bold text-emerald-400">${statisticsData?.overview?.totalRewards || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Award className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{t('normal-affiliate.stats.topReferrer')}</p>
                  <p className="text-lg font-bold text-purple-400">{statisticsData?.topPerformers?.topReferrers?.[0]?.nickName || 'N/A'}</p>
                  <p className="text-xs text-slate-400">${statisticsData?.topPerformers?.topReferrers?.[0]?.totalReferrerReward || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="text-slate-100">{t('normal-affiliate.cardTitle')}</CardTitle>
            <CardDescription className="text-slate-400">
              {t('normal-affiliate.cardDescription')}
            </CardDescription>
          </div>
        </CardHeader>
        
        {/* Search moved down */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t('normal-affiliate.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-full md:max-w-sm bg-slate-700/50 border-slate-600/50 text-slate-300"
              />
            </div>
          </div>
        </div>
        
        <CardContent>
          
          {tableLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-400">{t('normal-affiliate.table.loading')}</div>
            </div>
          ) : tableError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-400">{t('normal-affiliate.table.error')}</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                  <TableRow className="border-slate-700/50">
                    <TableHead className="text-slate-300">{t('normal-affiliate.table.walletId')}</TableHead>
                    <TableHead className="text-slate-300">{t('normal-affiliate.table.userInfo')}</TableHead>
                    <TableHead className="text-slate-300">{t('normal-affiliate.table.stats')}</TableHead>
                    <TableHead className="text-slate-300">{t('normal-affiliate.table.inviteeRelations')}</TableHead>
                    <TableHead className="text-slate-300">{t('normal-affiliate.table.referrerRelations')}</TableHead>
                  </TableRow>
                </TableHeader>
                  <TableBody>
                    {wallets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                          {searchTerm ? t('normal-affiliate.table.noWalletsMatchingSearch') : t('normal-affiliate.table.noWalletsFound')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      wallets.map((wallet: any, index: number) => (
                        <TableRow key={wallet.walletId} className="border-slate-700/30 hover:bg-slate-700/20">
                          <TableCell className="font-medium text-cyan-400">{wallet.walletId}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-100">{wallet.nickName || 'Unknown'}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-400">{truncateAddress(wallet.solanaAddress || '')}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                                  onClick={() => copyToClipboard(wallet.solanaAddress || '', 'address')}
                                  title="Copy address"
                                >
                                  {copiedAddress === wallet.solanaAddress ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500">Ref: {wallet.refCode}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 text-slate-500 hover:text-cyan-300 hover:bg-cyan-900/20"
                                  onClick={() => copyToClipboard(wallet.refCode || '', 'refCode')}
                                  title="Copy referral code"
                                >
                                  {copiedRefCode === wallet.refCode ? (
                                    <Check className="h-2 w-2 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-2 w-2" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{t('normal-affiliate.table.total')}:</span>
                              <span className="font-medium text-emerald-400">${wallet.stats?.totalReward || 0}</span>
                            </div>
                          </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {wallet.asInvitee.filter((ref: any) => ref.level === 1).length > 0 ? (
                                <div className="text-xs text-slate-500">
                                  {wallet.asInvitee
                                    .filter((ref: any) => ref.level === 1)
                                    .map((ref: any) => (
                                      <div key={ref.referralId} className="flex items-center gap-1">
                                        <div>
                                          <div className="font-medium text-slate-100">{ref.referent?.nickName}</div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs text-slate-400">{truncateAddress(ref.referent?.solanaAddress || '')}</span>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-5 w-5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                                              onClick={() => copyToClipboard(ref.referent?.solanaAddress || '', 'address')}
                                              title="Copy address"
                                            >
                                              {copiedAddress === ref.referent?.solanaAddress ? (
                                                <Check className="h-3 w-3 text-emerald-500" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500">{t('normal-affiliate.table.noInviteeRelations')}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {wallet.asReferrer.filter((ref: any) => ref.level === 1).length > 0 ? (
                                <div className="text-xs text-slate-500">
                                  {wallet.asReferrer
                                    .filter((ref: any) => ref.level === 1)
                                    .map((ref: any) => (
                                      <div key={ref.referralId} className="flex items-center gap-1">
                                        <div>
                                          <div className="font-medium text-slate-100">{ref.invitee?.nickName}</div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs text-slate-400">{truncateAddress(ref.invitee?.solanaAddress || '')}</span>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-5 w-5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                                              onClick={() => copyToClipboard(ref.invitee?.solanaAddress || '', 'address')}
                                              title="Copy address"
                                            >
                                              {copiedAddress === ref.invitee?.solanaAddress ? (
                                                <Check className="h-3 w-3 text-emerald-500" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500">{t('normal-affiliate.table.noReferrerRelations')}</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && <Pagination />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
