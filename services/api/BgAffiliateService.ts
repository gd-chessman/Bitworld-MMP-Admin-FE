import axiosClient from '@/utils/axiosClient';

// 1. Tạo BG Affiliate mới
export const createBgAffiliate = async (walletId: number, totalCommissionPercent: number, batAlias?: string) => {
  try {
    const response = await axiosClient.post('/bg-affiliate', {
      walletId,
      totalCommissionPercent,
      batAlias
    });
    return response.data;
  } catch (error) {
    console.log('Error creating BG affiliate:', error);
    throw error;
  }
};

// 2. Cập nhật hoa hồng root BG
export const updateRootBgCommission = async (treeId: number, newPercent: number, rootWalletId: number, batAlias?: string) => {
  try {
    const response = await axiosClient.put('/bg-affiliate/commission', {
      treeId,
      newPercent,
      rootWalletId,
      batAlias
    });
    return response.data;
  } catch (error) {
    console.log('Error updating root BG commission:', error);
    throw error;
  }
};

// 3. Lấy danh sách tất cả BG affiliate trees
export const getBgAffiliateTrees = async (isBittworld?: 'all' | 'true' | 'false') => {
  try {
    const params = new URLSearchParams();
    if (isBittworld && isBittworld !== 'all') {
      params.append('isBittworld', isBittworld);
    }
    const response = await axiosClient.get(`/bg-affiliate/trees?${params.toString()}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// 4. Lấy chi tiết BG affiliate tree
export const getBgAffiliateTreeDetail = async (walletId: number) => {
  try {
    const response = await axiosClient.get(`/bg-affiliate/trees/wallet/${walletId}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching BG affiliate tree detail:', error);
    throw error;
  }
};

// 5. Lấy thống kê BG affiliate của wallet
export const getWalletBgAffiliateStats = async (walletId: number) => {
  try {
    const response = await axiosClient.get(`/bg-affiliate/wallet/${walletId}/stats`);
    return response.data;
  } catch (error) {
    console.log('Error fetching wallet BG affiliate stats:', error);
    return [];
  }
};

// 6. Thêm node mới vào BG affiliate tree
export const addNodeToBgAffiliateTree = async (treeId: number, walletId: number, parentWalletId: number, commissionPercent: number) => {
  try {
    const response = await axiosClient.post('/bg-affiliate/nodes', {
      treeId,
      walletId,
      parentWalletId,
      commissionPercent
    });
    return response.data;
  } catch (error) {
    console.log('Error adding node to BG affiliate tree:', error);
    throw error;
  }
};

// 7. Cập nhật trạng thái BG affiliate node
export const updateBgAffiliateNodeStatus = async (walletId: number, status: boolean) => {
  try {
    const response = await axiosClient.put('/bg-affiliate/nodes/status', {
      walletId,
      status
    });
    return response.data;
  } catch (error) {
    console.log('Error updating BG affiliate node status:', error);
    throw error;
  }
}; 

export const getBgAffiliateStatistics = async () => {
  try {
    const response = await axiosClient.get('/bg-affiliate/statistics');
    return response.data;
  } catch (error) {
    console.log('Error fetching BG affiliate statistics:', error);
    return [];
  }
};

// 8. Thay đổi luồng BG affiliate (change flow)
export const changeBgAffiliateFlow = async (walletId: number, newParentWalletId: number) => {
  try {
    const response = await axiosClient.put('/bg-affiliate/change-flow', {
      walletId,
      newParentWalletId
    });
    return response.data;
  } catch (error) {
    console.log('Error changing BG affiliate flow:', error);
    throw error;
  }
};