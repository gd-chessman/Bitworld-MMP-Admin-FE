import axiosClient from "@/utils/axiosClient";


export const getListWallets = async (search: string = '', page: number = 1, limit: number = 10, walletAuth: string = '', walletType: string = '', isBittworld?: boolean, bittworldUid?: string, bgAffiliate?: string) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (walletAuth) params.append('wallet_auth', walletAuth);
    if (walletType) params.append('wallet_type', walletType);
    if (isBittworld !== undefined) params.append('isBittworld', isBittworld.toString());
    if (bittworldUid && bittworldUid !== 'all') params.append('bittworld_uid', bittworldUid);
    if (bgAffiliate && bgAffiliate !== 'all') params.append('bg_affiliate', bgAffiliate);
    const temp = await axiosClient.get(`/list-wallets?${params.toString()}`);
    return temp.data;
  } catch (error) {
    console.log(error);
    return { data: [], pagination: { total: 0, totalPages: 0, currentPage: 1 } };
  }
};

export const updateListWalletsAuth = async (walletId: string, item: any) => {
    try {
        const temp = await axiosClient.put(`/list-wallets/${walletId}/auth`, item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const getWalletStatistics = async () =>{
  try {
    const temp = await axiosClient.get(`/wallet-statistics`)
    return temp.data;
} catch (error) {
    console.log(error)
    return {};
}  
}