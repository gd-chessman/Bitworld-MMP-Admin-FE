"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Percent, Users, Calendar, Wallet, Activity, Copy, Check, Power, Crown, TrendingUp, BarChart3 } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";
import { getBgAffiliateTreeDetail, updateBgAffiliateNodeStatus } from '@/services/api/BgAffiliateService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from "@/lang/useLang";

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
}

function TreeNode({ 
  node, 
  level, 
  onStatusChange, 
  copiedAddress, 
  onCopyAddress, 
  isUpdating,
  isRoot = false,
  isLastChild = false
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
          className="absolute left-6 top-0 w-px bg-slate-600/50"
          style={{ 
            height: '50%',
            left: `${indent - 12}px`
          }}
        />
      )}

      {/* Node Content */}
      <div 
        className={`
          flex items-center gap-3 p-3 my-2 rounded-lg border transition-all duration-200 hover:bg-slate-800/30 relative
          ${isRoot 
            ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30' 
            : 'bg-slate-800/20 border-slate-700/30'
          }
        `}
        style={{ marginLeft: `${indent}px` }}
      >
        {/* Horizontal connector line for non-root nodes */}
        {!isRoot && (
          <div 
            className="absolute left-0 top-1/2 w-3 h-px bg-slate-600/50 transform -translate-y-1/2"
            style={{ left: '-12px' }}
          />
        )}

        {/* Expand/Collapse Button */}
        <div className="flex-shrink-0">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-slate-700/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            </div>
          )}
        </div>

        {/* User Avatar/Icon */}
        <div className="flex-shrink-0">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
            ${isRoot 
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' 
              : 'bg-slate-700 text-slate-300'
            }
          `}>
            {isRoot ? <Crown className="h-5 w-5" /> : (node.walletInfo?.nickName?.charAt(0) || '?').toUpperCase()}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold truncate ${isRoot ? 'text-blue-400' : 'text-slate-100'}`}>
              {node.walletInfo?.nickName || '-'}
            </h4>
            {isRoot && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {t('ref.root')}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {t('ref.level')} {level}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              <span>{truncateAddress(node.walletInfo?.solanaAddress || '')}</span>
              <button
                className="p-1 rounded hover:bg-slate-700 transition-colors"
                title="Copy address"
                onClick={() => onCopyAddress(node.walletInfo?.solanaAddress || '')}
              >
                {copiedAddress === (node.walletInfo?.solanaAddress || '') ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              <span className="text-emerald-400 font-medium">{node.commissionPercent}%</span>
            </div>

            {node.totalVolume !== undefined && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-slate-400">{t('bg-affiliate.detail.table.volume')}:</span>
                <span className="text-blue-400 font-medium">${node.totalVolume || 0}</span>
              </div>
            )}

            {node.totalTrans !== undefined && (
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span className="text-slate-400">{t('bg-affiliate.detail.table.transactions')}:</span>
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
        </div>

        {/* Status Toggle */}
        <div className="flex-shrink-0">
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
        </div>
      </div>

      {/* Children Container with vertical connector */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical connector line from parent to children */}
          <div 
            className="absolute left-6 top-0 w-px bg-slate-600/50"
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

  // Tất cả hook phải ở đầu
  const { data: treeData, isLoading, error } = useQuery({
    queryKey: ['bg-affiliate-tree-detail', id],
    queryFn: () => getBgAffiliateTreeDetail(Number(id)),
    enabled: !!id,
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

  // Sau đó mới return điều kiện
  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-slate-400">{t('bg-affiliate.detail.loading')}</div>;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t('bg-affiliate.detail.title', { treeId: treeData.treeInfo.treeId })}</h1>
          <p className="text-slate-400 text-sm">
            {t('bg-affiliate.detail.rootInfo', { 
              nickname: treeData.currentWallet.nickName
            })} &bull; &nbsp;
            <span className="items-center gap-1 inline-flex">
              {truncateAddress(treeData.currentWallet.solanaAddress)}
              <button
                className="ml-1 p-1 rounded hover:bg-slate-700 transition-colors"
                title="Copy address"
                onClick={() => copyToClipboard(treeData.currentWallet.solanaAddress)}
              >
                {copiedAddress === treeData.currentWallet.solanaAddress ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
              </button>
            </span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{t('bg-affiliate.detail.stats.rootCommission')}</p>
                <p className="text-2xl font-bold text-emerald-400">{treeData.treeInfo.totalCommissionPercent}%</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Percent className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{t('bg-affiliate.detail.stats.totalMembers')}</p>
                <p className="text-2xl font-bold text-purple-400">{treeData.totalMembers}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{t('bg-affiliate.detail.stats.created')}</p>
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
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">{t('bg-affiliate.detail.treeStructure')}</CardTitle>
              <CardDescription className="text-slate-400">
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
            />
          </div>
          
          {treeData.totalMembers === 0 && (
            <div className="text-center text-slate-400 py-8">
              {t('bg-affiliate.detail.table.noMembers')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
