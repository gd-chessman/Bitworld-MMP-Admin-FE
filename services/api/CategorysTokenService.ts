import axiosClient from "@/utils/axiosClient";


export const getCategoryToken = async (search: string = '', page: number = 1, limit: number = 100)=>{
    try {
        const temp = await axiosClient.get(`/categories-token?search=${search}&page=${page}&limit=${limit}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const createCategoryToken = async (data: any)=>{
    try {
        const temp = await axiosClient.post("/categories-token", data)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const updateCategoryToken = async (data: any)=>{
    try {
        const temp = await axiosClient.put(`/categories-token/${data.slct_id}`, data)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const deleteCategoryToken = async (id: string)=>{
    try {
        const temp = await axiosClient.delete(`/categories-token/${id}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}