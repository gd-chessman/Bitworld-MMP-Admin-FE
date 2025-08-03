import axiosClient from "@/utils/axiosClient";




export const getAirdropPools = async (search: string = '', page: number = 1, limit: number = 10, status: string = '', originator_id: number = 0) => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (originator_id) params.append('originator_id', originator_id.toString());
        const temp = await axiosClient.get(`/airdrop-pools?${params.toString()}`);
        return temp.data;
    } catch (error) {
        console.log(error);
        return { data: [], pagination: { total: 0, totalPages: 0, currentPage: 1 } };
    }
}


export const getAirdropPoolsStats = async () => {
    try {
        const temp = await axiosClient.get(`/airdrop-pools/stats`);
        return temp.data;
    } catch (error) {
        console.log(error);
        return {};
    }
}

export const getAirdropPoolDetail = async (id: number) => {
    try {
        const temp = await axiosClient.get(`/airdrop-pools/detail/${id}`);
        return temp.data;
    } catch (error) {
        console.log(error);
        return {};
    }
}


export const getAirdropPoolLeaderboard = async (minVolume: number = 0, maxVolume?: number) => {
    try {
        const params = new URLSearchParams();
        params.append('minVolume', minVolume.toString());
        if (maxVolume !== undefined) {
            params.append('maxVolume', maxVolume.toString());
        }
        const temp = await axiosClient.get(`/airdrop-pools/leaderboard?${params.toString()}`);
        return temp.data;
    } catch (error) {
        console.log(error);
        return {};
    }
}