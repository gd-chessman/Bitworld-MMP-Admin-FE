import axiosClient from "@/utils/axiosClient";



export const getOrderHistory = async (search: string = '', page: number = 1, limit: number = 100, isBittworld?: 'all' | 'true' | 'false')=>{
    try {
        const params = new URLSearchParams();
        params.append('search', search);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (isBittworld && isBittworld !== 'all') {
            params.append('isBittworld', isBittworld);
        }
        const temp = await axiosClient.get(`/order-history?${params.toString()}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const getOrderStatistics = async () => {
    try {
        const temp = await axiosClient.get(`/order-statistics?isBittworld=true`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }       
}