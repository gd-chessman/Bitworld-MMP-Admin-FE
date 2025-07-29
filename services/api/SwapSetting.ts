import axiosClient from "@/utils/axiosClient";

export const getSwapSetting = async ()=>{
    try {
        const temp = await axiosClient.get("/swap-settings")
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const updateSwapSetting = async (data: any)=>{
    try {
        const temp = await axiosClient.put("/swap-settings", data)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}