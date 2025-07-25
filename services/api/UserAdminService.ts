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


export const createUser = async (user: any) => {
    try {
        const temp = await axiosClient.post(`/users`, user)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const getUsers = async (page: number, limit: number, role?: string, search?: string) => {
    try {
        let url = `/users?page=${page}&limit=${limit}`;
        if (role && role !== "all") {
            url += `&role=${role}`;
        }
        if (search && search.trim() !== "") {
            url += `&search=${encodeURIComponent(search)}`;
        }
        const temp = await axiosClient.get(url);
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const getUserStats = async () => {
    try {
        const temp = await axiosClient.get(`/user-stats`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const deleteUser = async (id: string) => {
    try {
        const temp = await axiosClient.delete(`/users/${id}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}