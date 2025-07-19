import axiosClient from "@/utils/axiosClient";


export const getReferentSettings = async ()=>{
    try {
        const temp = await axiosClient.get(`/referent-settings`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const updatReferentSettings = async (item: any)=>{
    try {
        const temp = await axiosClient.put(`/referent-settings`, item)
        return temp.data;
    } catch (error) {
        console.log(error)
        return false;
    }
}
