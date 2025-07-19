import axiosClient from "@/utils/axiosClient";


export const login = async (item: any) => {
    try {
        const temp = await axiosClient.post(`/login`, item);
        localStorage.setItem("user", JSON.stringify(temp.data));
        return temp;
    } catch (e) {
        throw e;
    }
}

export const logout = async () => {
    try {
        await axiosClient.post('/logout');
        localStorage.removeItem('user');
        return true;
    } catch (e) {
        throw e;
    }
}