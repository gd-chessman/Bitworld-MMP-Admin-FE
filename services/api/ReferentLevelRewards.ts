import axiosClient from "@/utils/axiosClient";


export const getReferentLevelRewards = async () => {
    try {
        const temp = await axiosClient.get(`/referent-level-rewards`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const updateReferentLevelRewards = async ( id: any, data: any) => {
    try {
        const temp = await axiosClient.put(`/referent-level-rewards/${id}`, data)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}