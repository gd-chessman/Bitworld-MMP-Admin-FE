import { LangCodes } from './../../lang/index';
import axiosClient from "@/utils/axiosClient";

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getNormalAffiliateStats = async (params?: PaginationParams) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await axiosClient.get(`/traditional-referrals?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching normal affiliate stats:', error);
    return {};
  }
};

export const getNormalAffiliateStatistics = async () => {
  try {
    const response = await axiosClient.get('/traditional-referrals/statistics');
    return response.data;
  } catch (error) {
    console.log('Error fetching normal affiliate referral relations:', error);
    return {};
  }
};  