import axiosClient from "@/utils/axiosClient";

export const getSwapInvestorRewards = async (page: number, limit: number, search: string)=>{
    try {
        const temp = await axiosClient.get(`/swap-investor-rewards?page=${page}&limit=${limit}&search=${search}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}