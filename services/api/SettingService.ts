import axiosClient from "@/utils/axiosClient";


export const getSetting = async ()=>{
    try {
        const temp = await axiosClient.get(`/setting`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const updateSetting = async (data: any)=>{
    try {
        const temp = await axiosClient.put(`/setting`, data)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
        const temp = await axiosClient.put(`/change-password`, data)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}
