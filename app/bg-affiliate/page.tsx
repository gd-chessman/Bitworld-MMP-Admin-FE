"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, Users, Wallet, Percent, Calendar, ChevronRight, ChevronDown, Search, MoreHorizontal, TrendingUp, Activity, Edit, Copy, Check, Route } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Select from "react-select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListWallets } from '@/services/api/ListWalletsService';
import { createBgAffiliate, getBgAffiliateTrees, updateRootBgCommission, updateBgAffiliateNodeStatus, getBgAffiliateStatistics, changeBgAffiliateFlow } from '@/services/api/BgAffiliateService';
import { selectStyles } from "@/utils/common";
import { toast } from "sonner";
import { useLang } from "@/lang/useLang";
import { getMyInfor } from "@/services/api/UserAdminService";


// Helper function to truncate address
function truncateAddress(address: string, start: number = 4, end: number = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}


export default function BgAffiliateAdminPage() {
  const { t } = useLang();
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdateCommission, setShowUpdateCommission] = useState(false);
  const [showChangeFlow, setShowChangeFlow] = useState(false);
  const [selectedTree, setSelectedTree] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBittworldFilter, setIsBittworldFilter] = useState<'all' | 'true' | 'false'>('true');
  const [walletSearchQuery, setWalletSearchQuery] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get user info
  const { data: myInfor } = useQuery({
    queryKey: ["my-infor"],
    queryFn: getMyInfor,
    refetchOnMount: true,
  });

  // Form states
  const [createForm, setCreateForm] = useState({ 
    selectedWallet: null, 
    totalCommissionPercent: "",
    batAlias: ""
  });

  const [updateCommissionForm, setUpdateCommissionForm] = useState({
    newPercent: "",
    batAlias: ""
  });

  const [changeFlowForm, setChangeFlowForm] = useState({
    selectedWallet: null,
    selectedNewParent: null
  });

  const [changeFlowWalletSearchQuery, setChangeFlowWalletSearchQuery] = useState("");

  // Fetch BG Affiliate trees
  const { data: bgAffiliateTrees = [], isLoading: treesLoading, error: treesError } = useQuery({
    queryKey: ['bg-affiliate-trees', isBittworldFilter],
    queryFn: () => getBgAffiliateTrees(isBittworldFilter),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch BG Affiliate statistics
  const { data: statisticsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['bg-affiliate-statistics'],
    queryFn: getBgAffiliateStatistics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch available wallets when create dialog is open
  const { data: availableWallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ["list-wallets-bg-affiliate", walletSearchQuery, 'all', 1, myInfor?.role],
    queryFn: () => {
      // For partner role, always set isBittworld to true
      const isBittworld = myInfor?.role === 'partner' ? true : undefined;
      return getListWallets(walletSearchQuery, 1, 30, '', 'main', isBittworld);
    },
    enabled: showCreate, // Only fetch when create dialog is open
    placeholderData: (previousData) => previousData,
  });

  // Fetch wallets for Change Flow dialog (only wallets in BG affiliate system)
  const { data: changeFlowWallets = [], isLoading: changeFlowWalletsLoading } = useQuery({
    queryKey: ["wallets-for-change-flow", changeFlowWalletSearchQuery, myInfor?.role],
    queryFn: () => {
      // For partner role, only show Bittworld wallets
      const isBittworld = myInfor?.role === 'partner' ? true : undefined;
      // bgAffiliate: 'true' to get only wallets that are in BG affiliate system
      return getListWallets(changeFlowWalletSearchQuery, 1, 50, '', 'main', isBittworld, undefined, 'bg');
    },
    enabled: showChangeFlow, // Only fetch when change flow dialog is open
    placeholderData: (previousData) => previousData,
  });

  // Create BG Affiliate mutation
  const createBgAffiliateMutation = useMutation({
    mutationFn: ({ walletId, totalCommissionPercent, batAlias }: { walletId: number, totalCommissionPercent: number, batAlias?: string }) =>
      createBgAffiliate(walletId, totalCommissionPercent, batAlias),
    onSuccess: (data) => {
      console.log('BG Affiliate created successfully:', data);
      // Close dialog and reset form
      setShowCreate(false);
      setCreateForm({ selectedWallet: null, totalCommissionPercent: "", batAlias: "" });
      // Invalidate and refetch trees list
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-trees'] });
      // Show success toast
      toast.success(t('bg-affiliate.dialogs.create.success'));
    },
    onError: (error: any) => {
      console.error('Error creating BG Affiliate:', error);
      if (error.response?.data?.message == "Wallet already has a BG affiliate tree, cannot create another one") {
        // Show error toast
        toast.error(t('bg-affiliate.dialogs.create.walletExists'));
      } else {
        // Show error toast
        toast.error(t('bg-affiliate.dialogs.create.error'));
      }
    }
  });

  // Update Root BG Commission mutation
  const updateCommissionMutation = useMutation({
    mutationFn: ({ treeId, newPercent, rootWalletId, batAlias }: { treeId: number, newPercent: number, rootWalletId: number, batAlias?: string }) =>
      updateRootBgCommission(treeId, newPercent, rootWalletId, batAlias),
    onSuccess: (data) => {
      console.log('Commission updated successfully:', data);
      // Close dialog and reset form
      setShowUpdateCommission(false);
      setSelectedTree(null);
      setUpdateCommissionForm({ newPercent: "", batAlias: "" });
      // Invalidate and refetch trees list
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-trees'] });
      // Show success toast
      toast.success(t('bg-affiliate.dialogs.updateCommission.success'));
    },
    onError: (error: any) => {
      console.error('Error updating commission:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('bg-affiliate.dialogs.updateCommission.error'));
      }
    }
  });

  // Update Tree Status mutation
  const updateTreeStatusMutation = useMutation({
    mutationFn: ({ walletId, status }: { walletId: number, status: boolean }) =>
      updateBgAffiliateNodeStatus(walletId, status),
    onSuccess: (data) => {
      console.log('Tree status updated successfully:', data);
      // Invalidate and refetch trees list
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-trees'] });
      // Show success toast
      toast.success(t('bg-affiliate.table.statusUpdated'));
    },
    onError: (error: any) => {
      console.error('Error updating tree status:', error);
      toast.error(t('bg-affiliate.table.statusUpdateFailed'));
    }
  });

  // Change Flow mutation
  const changeFlowMutation = useMutation({
    mutationFn: ({ walletId, newParentWalletId }: { walletId: number, newParentWalletId: number }) =>
      changeBgAffiliateFlow(walletId, newParentWalletId),
    onSuccess: (data) => {
      console.log('BG affiliate flow changed successfully:', data);
      // Close dialog and reset form
      setShowChangeFlow(false);
      setChangeFlowForm({ selectedWallet: null, selectedNewParent: null });
      // Invalidate and refetch trees list
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-trees'] });
      // Show success toast
      toast.success(t('bg-affiliate.dialogs.changeFlow.success'));
    },
    onError: (error: any) => {
      console.error('Error changing BG affiliate flow:', error);
      const rawMsg = error?.response?.data?.message || error?.message || "";
      if (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("circular reference")) {
        toast.error(t('bg-affiliate.dialogs.changeFlow.circularReferenceError'));
      } else if (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("cannot change flow of root")) {
        toast.error(t('bg-affiliate.dialogs.changeFlow.cannotChangeRootError'));
      } else {
        toast.error(t('bg-affiliate.dialogs.changeFlow.error'));
      }
    }
  });

  // Filter trees based on search term
  const filteredTrees = bgAffiliateTrees.filter((tree: any) =>
    tree.rootWallet?.nickName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.rootWallet?.solanaAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.treeId?.toString().includes(searchTerm)
  );

  // Convert to react-select format for create dialog
  const walletOptions = availableWallets?.data?.map((wallet: any) => ({
    value: wallet,
    label: wallet.wallet_solana_address
  }));

  // Convert to react-select format for change flow dialog
  const changeFlowWalletOptions = changeFlowWallets?.data?.map((wallet: any) => ({
    value: wallet,
    label: wallet.wallet_solana_address
  }));

  // Use statistics data instead of manual calculation
  const totalMembers = statisticsData?.totalMembers || 0;


  const handleUpdateCommission = (tree: any) => {
    setSelectedTree(tree);
    setUpdateCommissionForm({ 
      newPercent: Number(tree.totalCommissionPercent).toString(),
      batAlias: tree.batAlias || ""
    });
    setShowUpdateCommission(true);
  };

  const handleChangeFlow = () => {
    setChangeFlowForm({ selectedWallet: null, selectedNewParent: null });
    setShowChangeFlow(true);
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast.success(t('list-wallets.table.addressCopied'));
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast.error(t('list-wallets.table.copyFailed'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t('bg-affiliate.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('bg-affiliate.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleChangeFlow}
            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300"
          >
            <Route className="h-4 w-4 mr-2" />
            {t('bg-affiliate.changeFlow')}
          </Button>
          <Button 
            className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('bg-affiliate.newBg')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="dashboard-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Loading...</p>
                    <p className="text-2xl font-bold text-muted-foreground">...</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-muted/10 flex items-center justify-center">
                    <div className="h-4 w-4 bg-muted-foreground rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsError ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="dashboard-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Error</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black dark:text-white font-semibold text-sm">{t('bg-affiliate.stats.totalTrees')}</p>
                  <p className="text-2xl font-bold text-cyan-400">{statisticsData?.totalTrees || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black dark:text-white font-semibold text-sm">{t('bg-affiliate.stats.totalMembers')}</p>
                  <p className="text-2xl font-bold text-emerald-400">{statisticsData?.totalMembers || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black dark:text-white font-semibold text-sm">{t('bg-affiliate.stats.totalCommissionDistributed')}</p>
                  <p className="text-2xl font-bold text-pink-400">${statisticsData?.totalCommissionDistributed || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black dark:text-white font-semibold text-sm">{t('bg-affiliate.stats.totalVolume')}</p>
                  <p className="text-2xl font-bold text-purple-400">${statisticsData?.totalVolume || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card className="dashboard-card p-0 md:p-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground font-bold">{t('bg-affiliate.cardTitle')}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('bg-affiliate.cardDescription')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder={t('bg-affiliate.searchPlaceholder')} 
                className="pl-8 w-full md:max-w-sm min-w-[140px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* <UISelect 
              value={isBittworldFilter} 
              onValueChange={(value: 'all' | 'true' | 'false') => setIsBittworldFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('bg-affiliate.filters.all')}</SelectItem>
                <SelectItem value="true">{t('bg-affiliate.filters.bittworld')}</SelectItem>
                <SelectItem value="false">{t('bg-affiliate.filters.memepump')}</SelectItem>
              </SelectContent>
            </UISelect> */}
          </div>
          {treesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('bg-affiliate.table.loading')}</div>
            </div>
          ) : treesError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-400">{t('bg-affiliate.table.error')}</div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">{t('bg-affiliate.table.number')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('bg-affiliate.table.batAlias')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('bg-affiliate.table.rootWallet')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('bg-affiliate.table.bittworldUid')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('bg-affiliate.table.commission')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('bg-affiliate.table.members')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('bg-affiliate.table.created')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('bg-affiliate.table.status')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('bg-affiliate.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrees.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {t('bg-affiliate.table.noTrees')}
                    </TableCell>
                  </TableRow>
                  ) : (
                    filteredTrees.map((tree: any, index: number) => (
                      <TableRow key={tree.treeId} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-cyan-400">{index + 1}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {tree.batAlias || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tree.rootWallet?.nickName || 'Unknown'}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">{truncateAddress(tree.rootWallet?.solanaAddress || '')}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-cyan-300 hover:bg-muted/50"
                                onClick={() => copyToClipboard(tree.rootWallet?.solanaAddress || '')}
                                title={t('bg-affiliate.table.copyAddress')}
                              >
                                {copiedAddress === tree.rootWallet?.solanaAddress ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                              {tree.rootWallet?.isBittworld && (
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
                          {tree.rootWallet?.isBittworld && tree.rootWallet?.bittworldUid ? (
                            <span className="font-mono">{tree.rootWallet.bittworldUid}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400 border-emerald-500/30">
                            {tree.totalCommissionPercent || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-purple-400">{tree.totalMembers || 0}</span>
                            <span className="text-xs text-muted-foreground">{t('bg-affiliate.table.membersCount')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {tree.createdAt ? new Date(tree.createdAt).toLocaleDateString() : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {!(myInfor?.role === 'partner' && !tree.rootWallet?.isBittworld) ? (
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={tree.status !== false}
                                  onChange={(e) => {
                                    updateTreeStatusMutation.mutate({
                                      walletId: tree.rootWallet.walletId,
                                      status: e.target.checked
                                    });
                                  }}
                                  disabled={updateTreeStatusMutation.isPending}
                                  className="sr-only"
                                  id={`toggle-tree-${tree.treeId}`}
                                />
                                <label
                                  htmlFor={`toggle-tree-${tree.treeId}`}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                                    tree.status !== false 
                                      ? 'bg-emerald-500' 
                                      : 'bg-slate-600'
                                  } ${updateTreeStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                      tree.status !== false ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <Badge variant={tree.status !== false ? "default" : "secondary"}>
                              {tree.status !== false ? t('bg-affiliate.table.active') : t('bg-affiliate.table.inactive')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/bg-affiliate/${tree.rootWallet.walletId}`} passHref legacyBehavior>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-cyan-300 hover:bg-muted/50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {!(myInfor?.role === 'partner' && !tree.rootWallet?.isBittworld) && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-300 hover:bg-muted/50"
                                onClick={() => handleUpdateCommission(tree)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Tree Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-bold">{t('bg-affiliate.dialogs.create.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">{t('bg-affiliate.dialogs.create.selectWallet')}</label>
              <Select
                options={walletOptions as any}
                value={createForm.selectedWallet ? {
                  value: createForm.selectedWallet,
                  label: truncateAddress((createForm.selectedWallet as any).wallet_solana_address)
                } : null}
                onChange={(option: any) => setCreateForm(prev => ({ 
                  ...prev, 
                  selectedWallet: option ? option.value : null 
                }))}
                onInputChange={(newValue) => setWalletSearchQuery(newValue)}
                placeholder={t('bg-affiliate.dialogs.create.selectWalletPlaceholder')}
                isClearable
                isSearchable
                styles={selectStyles}

                noOptionsMessage={() => t('bg-affiliate.dialogs.changeFlow.noWalletsAvailable')}
                loadingMessage={() => t('bg-affiliate.dialogs.changeFlow.loadingWallets')}
                isLoading={walletsLoading}
                isDisabled={createBgAffiliateMutation.isPending}
                filterOption={() => true}
                isOptionDisabled={() => false}
              />
              <p className="text-xs text-muted-foreground">
                {availableWallets?.pagination?.total || 0} {t('bg-affiliate.dialogs.create.availableWallets')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('bg-affiliate.dialogs.create.commission')}</label>
              <Input 
                type="number" 
                placeholder={t('bg-affiliate.dialogs.create.commissionPlaceholder')} 
                value={createForm.totalCommissionPercent} 
                onChange={e => setCreateForm(f => ({ ...f, totalCommissionPercent: e.target.value }))} 
                disabled={createBgAffiliateMutation.isPending}
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('bg-affiliate.dialogs.create.commissionHelp')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('bg-affiliate.dialogs.create.batAlias')}</label>
              <Input 
                type="text" 
                placeholder={t('bg-affiliate.dialogs.create.batAliasPlaceholder')} 
                value={createForm.batAlias} 
                onChange={e => setCreateForm(f => ({ ...f, batAlias: e.target.value }))} 
                disabled={createBgAffiliateMutation.isPending}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('bg-affiliate.dialogs.create.batAliasHelp')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium" 
              disabled={!createForm.selectedWallet || !createForm.totalCommissionPercent || !createForm.batAlias.trim() || createBgAffiliateMutation.isPending || parseFloat(createForm.totalCommissionPercent) < 0 || parseFloat(createForm.totalCommissionPercent) > 100}
              onClick={() => {
                if (createForm.selectedWallet && createForm.totalCommissionPercent && createForm.batAlias.trim()) {
                  createBgAffiliateMutation.mutate({
                    walletId: (createForm.selectedWallet as any).wallet_id,
                    totalCommissionPercent: parseFloat(createForm.totalCommissionPercent),
                    batAlias: createForm.batAlias.trim()
                  });
                }
              }}
            >
              {createBgAffiliateMutation.isPending ? t('bg-affiliate.dialogs.create.creating') : t('bg-affiliate.dialogs.create.createButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Commission Dialog */}
      <Dialog open={showUpdateCommission} onOpenChange={setShowUpdateCommission}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground font-bold">{t('bg-affiliate.dialogs.updateCommission.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTree && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  {t('bg-affiliate.dialogs.updateCommission.rootInfo', { 
                    nickname: selectedTree.rootWallet?.nickName || 'Unknown', 
                    address: truncateAddress(selectedTree.rootWallet?.solanaAddress || '') 
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('bg-affiliate.dialogs.updateCommission.currentCommission', { 
                    percent: selectedTree.totalCommissionPercent 
                  })}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">{t('bg-affiliate.dialogs.updateCommission.newCommission')}</label>
              <Input 
                type="number" 
                placeholder={t('bg-affiliate.dialogs.updateCommission.newCommissionPlaceholder')} 
                value={updateCommissionForm.newPercent} 
                onChange={e => setUpdateCommissionForm(f => ({ ...f, newPercent: e.target.value }))} 
                disabled={updateCommissionMutation.isPending}
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('bg-affiliate.dialogs.updateCommission.newCommissionHelp')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('bg-affiliate.dialogs.updateCommission.batAlias')}</label>
              <Input 
                type="text" 
                placeholder={t('bg-affiliate.dialogs.updateCommission.batAliasPlaceholder')} 
                value={updateCommissionForm.batAlias} 
                onChange={e => setUpdateCommissionForm(f => ({ ...f, batAlias: e.target.value }))} 
                disabled={updateCommissionMutation.isPending}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('bg-affiliate.dialogs.updateCommission.batAliasHelp')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowUpdateCommission(false)}
              disabled={updateCommissionMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium" 
              disabled={!updateCommissionForm.newPercent || !updateCommissionForm.batAlias.trim() || updateCommissionMutation.isPending || parseFloat(updateCommissionForm.newPercent) < 0 || parseFloat(updateCommissionForm.newPercent) > 100}
              onClick={() => {
                if (selectedTree && updateCommissionForm.newPercent && updateCommissionForm.batAlias.trim()) {
                  updateCommissionMutation.mutate({
                    treeId: selectedTree.treeId,
                    newPercent: parseFloat(updateCommissionForm.newPercent),
                    rootWalletId: selectedTree.rootWallet.walletId,
                    batAlias: updateCommissionForm.batAlias.trim()
                  });
                }
              }}
            >
              {updateCommissionMutation.isPending ? t('bg-affiliate.dialogs.updateCommission.updating') : t('bg-affiliate.dialogs.updateCommission.updateButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Flow Dialog */}
      <Dialog open={showChangeFlow} onOpenChange={setShowChangeFlow}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-bold flex items-center gap-2">
              <Route className="h-5 w-5 text-orange-400" />
              {t('bg-affiliate.dialogs.changeFlow.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">{t('bg-affiliate.dialogs.changeFlow.selectWallet')}</label>
              <Select
                options={changeFlowWalletOptions as any}
                value={changeFlowForm.selectedWallet ? {
                  value: changeFlowForm.selectedWallet,
                  label: truncateAddress((changeFlowForm.selectedWallet as any).wallet_solana_address)
                } : null}
                onChange={(option: any) => setChangeFlowForm(prev => ({ 
                  ...prev, 
                  selectedWallet: option ? option.value : null 
                }))}
                onInputChange={(newValue) => setChangeFlowWalletSearchQuery(newValue)}
                placeholder={t('bg-affiliate.dialogs.changeFlow.selectWalletPlaceholder')}
                isClearable
                isSearchable
                styles={selectStyles}
                noOptionsMessage={() => t('bg-affiliate.dialogs.changeFlow.noWalletsInSystem')}
                loadingMessage={() => t('bg-affiliate.dialogs.changeFlow.loadingWallets')}
                isLoading={changeFlowWalletsLoading}
                isDisabled={changeFlowMutation.isPending}
                filterOption={() => true}
                isOptionDisabled={() => false}
              />
              <p className="text-xs text-muted-foreground">
                {t('bg-affiliate.dialogs.changeFlow.walletHelp')}
              </p>
              <p className="text-xs text-muted-foreground">
                {changeFlowWallets?.pagination?.total || 0} {t('bg-affiliate.dialogs.changeFlow.walletsInSystem')}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">{t('bg-affiliate.dialogs.changeFlow.selectNewParent')}</label>
              <Select
                options={changeFlowWalletOptions as any}
                value={changeFlowForm.selectedNewParent ? {
                  value: changeFlowForm.selectedNewParent,
                  label: truncateAddress((changeFlowForm.selectedNewParent as any).wallet_solana_address)
                } : null}
                onChange={(option: any) => setChangeFlowForm(prev => ({ 
                  ...prev, 
                  selectedNewParent: option ? option.value : null 
                }))}
                onInputChange={(newValue) => setChangeFlowWalletSearchQuery(newValue)}
                placeholder={t('bg-affiliate.dialogs.changeFlow.selectNewParentPlaceholder')}
                isClearable
                isSearchable
                styles={selectStyles}
                noOptionsMessage={() => t('bg-affiliate.dialogs.changeFlow.noWalletsInSystem')}
                loadingMessage={() => t('bg-affiliate.dialogs.changeFlow.loadingWallets')}
                isLoading={changeFlowWalletsLoading}
                isDisabled={changeFlowMutation.isPending}
                filterOption={() => true}
                isOptionDisabled={() => false}
              />
              <p className="text-xs text-muted-foreground">
                {t('bg-affiliate.dialogs.changeFlow.newParentHelp')}
              </p>
            </div>

            {changeFlowForm.selectedWallet && changeFlowForm.selectedNewParent && (
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <p className="text-sm text-orange-400 font-medium">
                  {t('bg-affiliate.dialogs.changeFlow.confirmMessage')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('bg-affiliate.dialogs.changeFlow.warningMessage')}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowChangeFlow(false)}
              disabled={changeFlowMutation.isPending}
            >
              {t('bg-affiliate.dialogs.changeFlow.cancel')}
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium" 
              disabled={!changeFlowForm.selectedWallet || !changeFlowForm.selectedNewParent || changeFlowMutation.isPending || changeFlowForm.selectedWallet === changeFlowForm.selectedNewParent}
              onClick={() => {
                if (changeFlowForm.selectedWallet && changeFlowForm.selectedNewParent) {
                  changeFlowMutation.mutate({
                    walletId: (changeFlowForm.selectedWallet as any).wallet_id,
                    newParentWalletId: (changeFlowForm.selectedNewParent as any).wallet_id
                  });
                }
              }}
            >
              {changeFlowMutation.isPending ? t('bg-affiliate.dialogs.changeFlow.changing') : t('bg-affiliate.dialogs.changeFlow.changeButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 