import axiosClient from "@/utils/axiosClient";

// Swap Investors API
export const getSwapInvestors = async (page: number = 1, limit: number = 10, search?: string) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    const response = await axiosClient.get(`/swap-investors?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return { data: [], pagination: { total: 0, totalPages: 0, currentPage: 1 } };
  }
};

export const createSwapInvestor = async (wallet_address: string) => {
  try {
    const response = await axiosClient.post('/swap-investors', { wallet_address });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getSwapInvestorsStats = async ()=>{
  try {
    const response = await axiosClient.get('/swap-investors/stats');
    return response.data;
  } catch (error) {
    console.log(error);
    return {};
  }
}

export const getSwapInvestorRewards = async (page: number = 1, limit: number = 10, search?: string) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    const response = await axiosClient.get(`/swap-investor-rewards?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return { data: [], pagination: { total: 0, totalPages: 0, currentPage: 1 } };
  }
};