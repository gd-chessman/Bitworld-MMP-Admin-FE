"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {  SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronDown, Percent, Users, Calendar, Wallet, Activity, Copy, Check, Power, Crown, TrendingUp, BarChart3, Route, Plus } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";
import { getBgAffiliateTreeDetail, updateBgAffiliateNodeStatus, changeBgAffiliateFlow } from '@/services/api/BgAffiliateService';
import { getMyInfor } from "@/services/api/UserAdminService";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from "@/lang/useLang";
import Select from "react-select";
import { getListWallets } from '@/services/api/ListWalletsService';
import { selectStyles } from "@/utils/common";

// --- Helper: truncateAddress ---
function truncateAddress(address: string, start: number = 4, end: number = 4): string {
  if (!address) return "";
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// --- Tree Node Component ---
interface TreeNodeProps {
  node: any;
  level: number;
  onStatusChange: (walletId: number, status: boolean) => void;
  copiedAddress: string | null;
  onCopyAddress: (address: string) => void;
  isUpdating: boolean;
  isRoot?: boolean;
  isLastChild?: boolean;
  myInfor?: any;
}

function TreeNode({ 
  node, 
  level, 
  onStatusChange, 
  copiedAddress, 
  onCopyAddress, 
  isUpdating,
  isRoot = false,
  isLastChild = false,
  myInfor
}: TreeNodeProps) {
  const { t } = useLang();
  const [isExpanded, setIsExpanded] = useState(isRoot);
  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 24;

  return (
    <div className="w-full relative">
      {/* Vertical connector line for non-root nodes */}
      {!isRoot && (
        <div 
          className="absolute left-6 top-0 w-px bg-border/50"
          style={{ 
            height: '50%',
            left: `${indent - 12}px`
          }}
        />
      )}

      {/* Node Content */}
      <div 
        className={`
          flex md:flex-row flex-col md:items-center items-start gap-3 p-3 md:p-3 py-2 md:py-4 my-1 md:my-2 rounded-lg border transition-all duration-200 hover:bg-muted/50 relative
          ${isRoot 
            ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30' 
            : 'bg-card/50 border-border'
          }
        `}
        style={{ marginLeft: `${indent}px` }}
      >
        {/* Horizontal connector line for non-root nodes */}
        {!isRoot && (
          <div 
            className="absolute left-0 top-1/2 w-3 h-px bg-border/50 transform -translate-y-1/2"
            style={{ left: '-12px' }}
          />
        )}

        {/* Expand/Collapse Button */}
        <div className="flex-shrink-0">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-muted/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            </div>
          )}
        </div>

        {/* User Avatar/Icon */}
        <div className="flex-shrink-0">
          <div className={`
            w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold
            ${isRoot 
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' 
              : 'bg-muted text-foreground'
            }
          `}>
            {isRoot ? <Crown className="h-4 w-4 md:h-5 md:w-5" /> : (node.walletInfo?.nickName?.charAt(0) || '?').toUpperCase()}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold truncate text-sm md:text-base ${isRoot ? 'text-blue-400' : 'text-foreground'}`}>
              {node.walletInfo?.nickName || '-'}
            </h4>
            {isRoot && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-1 py-0">
                {t('ref.root')}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs px-1 py-0">
              {t('ref.level')} {level}
            </Badge>
          </div>
          
          {/* Desktop: Horizontal layout */}
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              <span>{truncateAddress(node.walletInfo?.solanaAddress || '')}</span>
              <button
                className="p-1 rounded hover:bg-muted/50 transition-colors"
                title="Copy address"
                onClick={() => onCopyAddress(node.walletInfo?.solanaAddress || '')}
              >
                {copiedAddress === (node.walletInfo?.solanaAddress || '') ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </div>
            
            {node.walletInfo?.isBittworld && node.walletInfo?.bittworldUid && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">{t('bg-affiliate.table.bittworldUid')}:</span>
                <span className="font-mono text-blue-400">{node.walletInfo.bittworldUid}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              <span className="text-emerald-400 font-medium">{node.commissionPercent}%</span>
            </div>

            {node.totalVolume !== undefined && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-muted-foreground">{t('bg-affiliate.detail.table.volume')}:</span>
                <span className="text-blue-400 font-medium">${node.totalVolume || 0}</span>
              </div>
            )}

            {node.totalTrans !== undefined && (
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span className="text-muted-foreground">{t('bg-affiliate.detail.table.transactions')}:</span>
                <span className="text-purple-400 font-medium">{node.totalTrans || 0}</span>
              </div>
            )}

            {node.effectiveFrom && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(node.effectiveFrom).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Mobile: Grid layout with 2 columns */}
          <div className="md:hidden">
            {/* Address - Full width */}
            <div className="flex items-center gap-1 text-xs mb-1">
              <Wallet className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{truncateAddress(node.walletInfo?.solanaAddress || '')}</span>
              <button
                className="p-0.5 rounded hover:bg-muted/50 transition-colors flex-shrink-0"
                title="Copy address"
                onClick={() => onCopyAddress(node.walletInfo?.solanaAddress || '')}
              >
                {copiedAddress === (node.walletInfo?.solanaAddress || '') ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Grid for other info - 2 columns */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {/* Commission */}
              <div className="flex items-center gap-1 text-xs">
                <Percent className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-emerald-400 font-medium">{node.commissionPercent}%</span>
              </div>

              {/* Volume */}
              {node.totalVolume !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-blue-400 font-medium">${node.totalVolume || 0}</span>
                </div>
              )}

              {/* Transactions */}
              {node.totalTrans !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  <BarChart3 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-purple-400 font-medium">{node.totalTrans || 0}</span>
                </div>
              )}

              {/* Effective Date */}
              {node.effectiveFrom && (
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span>{new Date(node.effectiveFrom).toLocaleDateString()}</span>
                </div>
              )}

              {/* Bittworld UID - if exists, takes one column */}
              {node.walletInfo?.isBittworld && node.walletInfo?.bittworldUid && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-mono text-blue-400">{node.walletInfo.bittworldUid}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex-shrink-0 md:self-center self-end">
          {!(myInfor?.role === 'partner' && !node.walletInfo?.isBittworld) ? (
            <div className="relative">
              <input
                type="checkbox"
                checked={node.status !== false}
                onChange={(e) => onStatusChange(node.walletId, e.target.checked)}
                disabled={isUpdating}
                className="sr-only"
                id={`toggle-${node.walletId}`}
              />
              <label
                htmlFor={`toggle-${node.walletId}`}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                  node.status !== false 
                    ? 'bg-emerald-500' 
                    : 'bg-slate-600'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    node.status !== false ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </label>
            </div>
          ) : (
            <Badge variant={node.status !== false ? "default" : "secondary"}>
              {node.status !== false ? t('bg-affiliate.table.active') : t('bg-affiliate.table.inactive')}
            </Badge>
          )}
        </div>
      </div>

      {/* Children Container with vertical connector */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical connector line from parent to children */}
          <div 
            className="absolute left-6 top-0 w-px bg-border/50"
            style={{ 
              height: '100%',
              left: `${indent + 12}px`
            }}
          />
          
          <div className="mt-2">
            {node.children.map((child: any, index: number) => (
              <TreeNode
                key={child.nodeId || index}
                node={child}
                level={level + 1}
                onStatusChange={onStatusChange}
                copiedAddress={copiedAddress}
                onCopyAddress={onCopyAddress}
                isUpdating={isUpdating}
                isLastChild={index === node.children.length - 1}
                myInfor={myInfor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Detail Page ---
export default function BgAffiliateTreeDetailPage() {
  const { t } = useLang();
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;
  const queryClient = useQueryClient();

  // Change Flow state
  const [showChangeFlow, setShowChangeFlow] = useState(false);
  const [changeFlowForm, setChangeFlowForm] = useState({
    selectedWallet: null,
    selectedNewParent: null
  });
  const [changeFlowWalletSearchQuery, setChangeFlowWalletSearchQuery] = useState("");

  // Get user info
  const { data: myInfor } = useQuery({
    queryKey: ["my-infor"],
    queryFn: getMyInfor,
    refetchOnMount: true,
  });

  // Tất cả hook phải ở đầu
  const { data: treeData, isLoading, error } = useQuery({
    queryKey: ['bg-affiliate-tree-detail', id],
    queryFn: () => getBgAffiliateTreeDetail(Number(id)),
    enabled: !!id,
  });

  // Fetch wallets for Change Flow dialog
  const { data: changeFlowWallets = [], isLoading: changeFlowWalletsLoading } = useQuery({
    queryKey: ["wallets-for-change-flow-detail", changeFlowWalletSearchQuery, myInfor?.role],
    queryFn: () => {
      const isBittworld = myInfor?.role === 'partner' ? true : undefined;
      return getListWallets(changeFlowWalletSearchQuery, 1, 50, '', 'main', isBittworld, undefined, 'bg');
    },
    enabled: showChangeFlow,
    placeholderData: (previousData) => previousData,
  });

  // Change Flow mutation
  const changeFlowMutation = useMutation({
    mutationFn: ({ walletId, newParentWalletId }: { walletId: number, newParentWalletId: number }) =>
      changeBgAffiliateFlow(walletId, newParentWalletId),
    onSuccess: (data) => {
      console.log('BG affiliate flow changed successfully:', data);
      setShowChangeFlow(false);
      setChangeFlowForm({ selectedWallet: null, selectedNewParent: null });
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-tree-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-trees'] });
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

  // Update node status mutation
  const updateNodeStatusMutation = useMutation({
    mutationFn: ({ walletId, status }: { walletId: number, status: boolean }) =>
      updateBgAffiliateNodeStatus(walletId, status),
    onSuccess: (data) => {
      console.log('Node status updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-tree-detail', id] });
      toast.success(t('bg-affiliate.detail.table.statusUpdated'));
    },
    onError: (error: any) => {
      if (error.response?.data?.message === "Không thể tắt trạng thái của root BG") {
        toast.error(t('bg-affiliate.detail.table.cannotDisableRoot'));
      } else {
        toast.error(t('bg-affiliate.detail.table.statusUpdateFailed'));
      }
    }
  });

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Helper functions
  const handleChangeFlow = () => {
    setChangeFlowForm({ selectedWallet: null, selectedNewParent: null });
    setShowChangeFlow(true);
  };

  // Convert to react-select format for change flow dialog
  const changeFlowWalletOptions = changeFlowWallets?.data?.map((wallet: any) => ({
    value: wallet,
    label: wallet.wallet_solana_address
  }));

  // Sau đó mới return điều kiện
  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">{t('bg-affiliate.detail.loading')}</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center py-12 text-red-400">{t('bg-affiliate.detail.error')}</div>;
  }
  if (!treeData) return notFound();

  // Tạo root node với cấu trúc tree
  const rootNode = {
    nodeId: 0,
    walletId: treeData.currentWallet.walletId,
    commissionPercent: treeData.treeInfo.totalCommissionPercent,
    effectiveFrom: treeData.treeInfo.createdAt,
    walletInfo: treeData.currentWallet,
    status: treeData.currentWallet.status,
    children: treeData.downlineStructure || []
  };

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success(t('list-wallets.table.addressCopied'));
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      toast.error(t('list-wallets.table.copyFailed'));
    }
  };

  const handleStatusChange = (walletId: number, status: boolean) => {
    updateNodeStatusMutation.mutate({ walletId, status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t('bg-affiliate.detail.title', { treeId: treeData.treeInfo.treeId })}</h1>
          <p className="text-muted-foreground text-sm">
            {t('bg-affiliate.detail.rootInfo', { 
              nickname: treeData.currentWallet.nickName
            })} &bull; &nbsp;
            <span className="items-center gap-1 inline-flex">
              {truncateAddress(treeData.currentWallet.solanaAddress)}
              <button
                className="ml-1 p-1 rounded hover:bg-muted/50 transition-colors"
                title="Copy address"
                onClick={() => copyToClipboard(treeData.currentWallet.solanaAddress)}
              >
                {copiedAddress === treeData.currentWallet.solanaAddress ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </span>
            {treeData.currentWallet.isBittworld && treeData.currentWallet.bittworldUid && (
              <>
                &bull; &nbsp;
                <span className="text-blue-400 font-medium">
                  {t('bg-affiliate.table.bittworldUid')}: {treeData.currentWallet.bittworldUid}
                </span>
              </>
            )}
            {treeData.treeInfo.batAlias && (
              <>
                &bull; &nbsp;
                <span className="text-blue-400 font-medium">
                  {t('bg-affiliate.table.batAlias')}: {treeData.treeInfo.batAlias}
                </span>
              </>
            )}
          </p>
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('bg-affiliate.detail.stats.rootCommission')}</p>
                <p className="text-2xl font-bold text-emerald-400">{treeData.treeInfo.totalCommissionPercent}%</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Percent className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('bg-affiliate.detail.stats.totalMembers')}</p>
                <p className="text-2xl font-bold text-purple-400">{treeData.totalMembers}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('bg-affiliate.table.batAlias')}</p>
                <p className="text-2xl font-bold text-blue-400">{treeData.treeInfo.batAlias || '-'}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Crown className="h-4 w-4 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('bg-affiliate.detail.stats.created')}</p>
                <p className="text-2xl font-bold text-cyan-400">{new Date(treeData.treeInfo.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tree View */}
      <Card className="dashboard-card p-0 md:p-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-black dark:text-white font-bold">{t('bg-affiliate.detail.treeStructure')}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('bg-affiliate.detail.treeDescription')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <TreeNode
              node={rootNode}
              level={1}
              onStatusChange={handleStatusChange}
              copiedAddress={copiedAddress}
              onCopyAddress={copyToClipboard}
              isUpdating={updateNodeStatusMutation.isPending}
              isRoot={true}
              myInfor={myInfor}
            />
          </div>
          
          {treeData.totalMembers === 0 && (
            <div className="text-center text-muted-foreground py-8">
              {t('bg-affiliate.detail.table.noMembers')}
            </div>
          )}
        </CardContent>
      </Card>

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