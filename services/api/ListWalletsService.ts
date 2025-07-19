import axiosClient from "@/utils/axiosClient";


export const getListWallets = async (search: string = '', page: number = 1, limit: number = 10, walletAuth: string = '', walletType: string = '') => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (walletAuth) params.append('wallet_auth', walletAuth);
    if (walletType) params.append('wallet_type', walletType);
    const temp = await axiosClient.get(`/list-wallets?${params.toString()}`);
    return temp.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

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