import axiosClient from "@/utils/axiosClient";

export const getBittworldRewardsStatistics = async () => {
    try {
        const temp = await axiosClient.get(`/bittworld-rewards/statistics`);
        return temp.data;
    } catch (error) {
        console.log(error);
        return {};
    }
}

export const getBittworldWithdrawalsHistory = async (search: string = '', page: number = 1, limit: number = 20, status: string = '', from_date: string = '', to_date: string = '') => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (status && status !== 'all') params.append('status', status);
        if (from_date) params.append('from_date', from_date);
        if (to_date) params.append('to_date', to_date);
        const temp = await axiosClient.get(`/bittworld-withdraws/history?${params.toString()}`);
        return temp.data;
    } catch (error) {
        console.log(error);
        return { withdraws: [], pagination: { total: 0, totalPages: 0, page: 1 } };
    }
}

export const triggerBittworldWithdrawal = async () => {
    try {
        const temp = await axiosClient.post(`/bittworld-withdraw`);
        return temp.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
} 