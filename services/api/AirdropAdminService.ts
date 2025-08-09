import axiosClient from "@/utils/axiosClient";

export const getAirdropTokens = async (paramsIn: any = {}) => {
  try {
    const { page = 1, limit = 20, status_1, status_2, search } = paramsIn;
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (status_1) params.append("status_1", status_1);
    if (status_2) params.append("status_2", status_2);
    if (search) params.append("search", search);
    const temp = await axiosClient.get(`/airdrop-tokens?${params.toString()}`);
    return temp.data;
  } catch (error) {
    console.log(error);
    return { success: false, message: "error", data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
};

export const createAirdropToken = async (data: any) => {
  try {
    const temp = await axiosClient.post(`/airdrop-tokens`, data);
    return temp.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateAirdropToken = async (id: number, data: any) => {
  try {
    const temp = await axiosClient.put(`/airdrop-tokens/${id}`, data);
    return temp.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const calculateAirdropRewards = async (forceRecalculate: boolean) => {
  try {
    const temp = await axiosClient.post(`/airdrop-calculate`, { forceRecalculate });
    return temp.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAirdropRewards = async (paramsIn: any = {}) => {
  try {
    const { page = 1, limit = 20, token_mint, alt_id, status, search } = paramsIn;
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (token_mint) params.append("token_mint", token_mint);
    if (alt_id) params.append("alt_id", String(alt_id));
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    const temp = await axiosClient.get(`/airdrop-rewards?${params.toString()}`);
    return temp.data;
  } catch (error) {
    console.log(error);
    return { rewards: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
};
