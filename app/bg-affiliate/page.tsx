"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Users, Wallet, Percent, Calendar, ChevronRight, ChevronDown, Search, MoreHorizontal, TrendingUp, Activity, Edit, Copy, Check } from "lucide-react";
import Link from "next/link";
import Select from "react-select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListWallets } from '@/services/api/ListWalletsService';
import { createBgAffiliate, getBgAffiliateTrees, updateRootBgCommission, updateBgAffiliateNodeStatus, getBgAffiliateStatistics } from '@/services/api/BgAffiliateService';
import { selectStyles } from "@/utils/common";
import { toast } from "sonner";
import { useLang } from "@/lang/useLang";


// Helper function to truncate address
function truncateAddress(address: string, start: number = 4, end: number = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}


export default function BgAffiliateAdminPage() {
  const { t } = useLang();
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdateCommission, setShowUpdateCommission] = useState(false);
  const [selectedTree, setSelectedTree] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [walletSearchQuery, setWalletSearchQuery] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Form states
  const [createForm, setCreateForm] = useState({ 
    selectedWallet: null, 
    totalCommissionPercent: "" 
  });

  const [updateCommissionForm, setUpdateCommissionForm] = useState({
    newPercent: ""
  });

  // Fetch BG Affiliate trees
  const { data: bgAffiliateTrees = [], isLoading: treesLoading, error: treesError } = useQuery({
    queryKey: ['bg-affiliate-trees'],
    queryFn: getBgAffiliateTrees,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch BG Affiliate statistics
  const { data: statisticsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['bg-affiliate-statistics'],
    queryFn: getBgAffiliateStatistics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch available wallets when dialog is open
  const { data: availableWallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ["list-wallets-bg-affiliate", walletSearchQuery, 'all', 1],
    queryFn: () => getListWallets(walletSearchQuery, 1, 30, '', 'main'),
    enabled: showCreate, // Only fetch when dialog is open
    placeholderData: (previousData) => previousData,
  });

  // Create BG Affiliate mutation
  const createBgAffiliateMutation = useMutation({
    mutationFn: ({ walletId, totalCommissionPercent }: { walletId: number, totalCommissionPercent: number }) =>
      createBgAffiliate(walletId, totalCommissionPercent),
    onSuccess: (data) => {
      console.log('BG Affiliate created successfully:', data);
      // Close dialog and reset form
      setShowCreate(false);
      setCreateForm({ selectedWallet: null, totalCommissionPercent: "" });
      // Invalidate and refetch trees list
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-trees'] });
      // Show success toast
      toast.success(t('bg-affiliate.dialogs.create.success'));
    },
    onError: (error: any) => {
      console.error('Error creating BG Affiliate:', error);
      if (error.response?.data?.message === "Wallet đã có cây affiliate") {
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
    mutationFn: ({ treeId, newPercent, rootWalletId }: { treeId: number, newPercent: number, rootWalletId: number }) =>
      updateRootBgCommission(treeId, newPercent, rootWalletId),
    onSuccess: (data) => {
      console.log('Commission updated successfully:', data);
      // Close dialog and reset form
      setShowUpdateCommission(false);
      setSelectedTree(null);
      setUpdateCommissionForm({ newPercent: "" });
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

  // Filter trees based on search term
  const filteredTrees = bgAffiliateTrees.filter((tree: any) =>
    tree.rootWallet?.nickName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.rootWallet?.solanaAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.treeId?.toString().includes(searchTerm)
  );

  // Convert to react-select format
  const walletOptions = availableWallets?.data?.map((wallet: any) => ({
    value: wallet,
    label: wallet.wallet_solana_address
  }));

  // Use statistics data instead of manual calculation
  const totalMembers = statisticsData?.totalMembers || 0;


  const handleUpdateCommission = (tree: any) => {
    setSelectedTree(tree);
    setUpdateCommissionForm({ newPercent: Number(tree.totalCommissionPercent).toString() });
    setShowUpdateCommission(true);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t('bg-affiliate.title')}</h1>
          <p className="text-slate-400 text-sm">{t('bg-affiliate.description')}</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('bg-affiliate.newBg')}
        </Button>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{t('bg-affiliate.stats.totalTrees')}</p>
                  <p className="text-2xl font-bold text-cyan-400">{statisticsData?.totalTrees || 0}</p>
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
                  <p className="text-slate-400 text-sm">{t('bg-affiliate.stats.totalMembers')}</p>
                  <p className="text-2xl font-bold text-emerald-400">{statisticsData?.totalMembers || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{t('bg-affiliate.stats.totalCommissionDistributed')}</p>
                  <p className="text-2xl font-bold text-pink-400">${statisticsData?.totalCommissionDistributed || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{t('bg-affiliate.stats.totalVolume')}</p>
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
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">{t('bg-affiliate.cardTitle')}</CardTitle>
              <CardDescription className="text-slate-400">
                {t('bg-affiliate.cardDescription')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="search" 
                placeholder={t('bg-affiliate.searchPlaceholder')} 
                className="pl-8 w-full md:max-w-sm bg-slate-700/50 border-slate-600/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {treesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-400">{t('bg-affiliate.table.loading')}</div>
            </div>
          ) : treesError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-400">{t('bg-affiliate.table.error')}</div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50">
                    <TableHead className="text-slate-300">{t('bg-affiliate.table.number')}</TableHead>
                    <TableHead className="text-slate-300">{t('bg-affiliate.table.rootWallet')}</TableHead>
                    <TableHead className="text-slate-300">{t('bg-affiliate.table.commission')}</TableHead>
                    <TableHead className="text-slate-300">{t('bg-affiliate.table.members')}</TableHead>
                    <TableHead className="text-slate-300">{t('bg-affiliate.table.created')}</TableHead>
                    <TableHead className="text-slate-300">{t('bg-affiliate.table.status')}</TableHead>
                    <TableHead className="text-slate-300">{t('bg-affiliate.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrees.length === 0 ? (
                                      <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      {t('bg-affiliate.table.noTrees')}
                    </TableCell>
                  </TableRow>
                  ) : (
                    filteredTrees.map((tree: any, index: number) => (
                      <TableRow key={tree.treeId} className="border-slate-700/30 hover:bg-slate-700/20">
                        <TableCell className="font-medium text-cyan-400">{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-100">{tree.rootWallet?.nickName || 'Unknown'}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-slate-400">{truncateAddress(tree.rootWallet?.solanaAddress || '')}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                                onClick={() => copyToClipboard(tree.rootWallet?.solanaAddress || '')}
                                title="Copy address"
                              >
                                {copiedAddress === tree.rootWallet?.solanaAddress ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400 border-emerald-500/30">
                            {tree.totalCommissionPercent || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-purple-400">{tree.totalMembers || 0}</span>
                            <span className="text-xs text-slate-400">{t('bg-affiliate.table.membersCount')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {tree.createdAt ? new Date(tree.createdAt).toLocaleDateString() : 'Unknown'}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/bg-affiliate/${tree.rootWallet.walletId}`} passHref legacyBehavior>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-300 hover:bg-emerald-900/20"
                              onClick={() => handleUpdateCommission(tree)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
        <DialogContent className="bg-slate-900 border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-slate-100">{t('bg-affiliate.dialogs.create.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">{t('bg-affiliate.dialogs.create.selectWallet')}</label>
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
                className="text-slate-100"
                noOptionsMessage={() => "No wallets available"}
                loadingMessage={() => "Loading wallets..."}
                isLoading={walletsLoading}
                isDisabled={createBgAffiliateMutation.isPending}
                filterOption={() => true}
                isOptionDisabled={() => false}
              />
              <p className="text-xs text-slate-400">
                {availableWallets?.pagination?.total || 0} {t('bg-affiliate.dialogs.create.availableWallets')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('bg-affiliate.dialogs.create.commission')}</label>
              <Input 
                type="number" 
                placeholder={t('bg-affiliate.dialogs.create.commissionPlaceholder')} 
                value={createForm.totalCommissionPercent} 
                onChange={e => setCreateForm(f => ({ ...f, totalCommissionPercent: e.target.value }))} 
                className="bg-slate-800/50 border-slate-600/50" 
                disabled={createBgAffiliateMutation.isPending}
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-slate-400 mt-1">
                {t('bg-affiliate.dialogs.create.commissionHelp')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700" 
              disabled={!createForm.selectedWallet || !createForm.totalCommissionPercent || createBgAffiliateMutation.isPending || parseFloat(createForm.totalCommissionPercent) < 0 || parseFloat(createForm.totalCommissionPercent) > 100}
              onClick={() => {
                if (createForm.selectedWallet && createForm.totalCommissionPercent) {
                  createBgAffiliateMutation.mutate({
                    walletId: (createForm.selectedWallet as any).wallet_id,
                    totalCommissionPercent: parseFloat(createForm.totalCommissionPercent)
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
        <DialogContent className="bg-slate-900/95 border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-slate-100">{t('bg-affiliate.dialogs.updateCommission.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTree && (
              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-600/30">
                <p className="text-sm text-slate-400">
                  {t('bg-affiliate.dialogs.updateCommission.rootInfo', { 
                    nickname: selectedTree.rootWallet?.nickName || 'Unknown', 
                    address: truncateAddress(selectedTree.rootWallet?.solanaAddress || '') 
                  })}
                </p>
                <p className="text-sm text-slate-400">
                  {t('bg-affiliate.dialogs.updateCommission.currentCommission', { 
                    percent: selectedTree.totalCommissionPercent 
                  })}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('bg-affiliate.dialogs.updateCommission.newCommission')}</label>
              <Input 
                type="number" 
                placeholder={t('bg-affiliate.dialogs.updateCommission.newCommissionPlaceholder')} 
                value={updateCommissionForm.newPercent} 
                onChange={e => setUpdateCommissionForm(f => ({ ...f, newPercent: e.target.value }))} 
                className="bg-slate-800/50 border-slate-600/50" 
                disabled={updateCommissionMutation.isPending}
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-slate-400 mt-1">
                {t('bg-affiliate.dialogs.updateCommission.newCommissionHelp')}
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
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700" 
              disabled={!updateCommissionForm.newPercent || updateCommissionMutation.isPending || parseFloat(updateCommissionForm.newPercent) < 0 || parseFloat(updateCommissionForm.newPercent) > 100}
              onClick={() => {
                if (selectedTree && updateCommissionForm.newPercent) {
                  updateCommissionMutation.mutate({
                    treeId: selectedTree.treeId,
                    newPercent: parseFloat(updateCommissionForm.newPercent),
                    rootWalletId: selectedTree.rootWallet.walletId
                  });
                }
              }}
            >
              {updateCommissionMutation.isPending ? t('bg-affiliate.dialogs.updateCommission.updating') : t('bg-affiliate.dialogs.updateCommission.updateButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 