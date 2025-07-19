import axiosClient from "@/utils/axiosClient";

export const getMyInfor = async ()=>{
    try {
        const temp = await axiosClient.get(`/me`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}
