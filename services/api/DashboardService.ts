import axiosClient from "@/utils/axiosClient";

export const getDashboardStatistics = async () => {
    try {
        const response = await axiosClient.get('/dashboard/statistics');
        return response.data;
    } catch (error) {
        console.log('Error fetching dashboard statistics:', error);
    }
}