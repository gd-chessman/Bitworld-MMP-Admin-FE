import axiosClient from "@/utils/axiosClient";

export const getTopRound = async () => {
    try {
        const temp = await axiosClient.get(`/get-top-round`);
        return temp.data;
    } catch (error) {
        console.log(error);
        return { success: false, message: "Error getting top round configuration", data: { count_top: 0, top_rounds: [] } };
    }
};

export const setTopRound = async (data: any) => {
    try {
        const temp = await axiosClient.post(`/set-top-round`, data);
        return temp.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const airdropWithdraw = async () => {
    try {
        const temp = await axiosClient.post(`/airdrop-withdraw`);
        return temp.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
