import axiosClient from "@/utils/axiosClient";



export const getOrderHistory = async (search: string = '', page: number = 1, limit: number = 100)=>{
    try {
        const temp = await axiosClient.get(`/order-history?search=${search}&page=${page}&limit=${limit}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const getOrderStatistics = async () => {
    try {
        const temp = await axiosClient.get(`/order-statistics`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }       
}