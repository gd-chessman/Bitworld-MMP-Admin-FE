import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const axiosClient = axios.create({
  baseURL: `${apiUrl}/api/v1/admin`,
    withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Lỗi 401: Unauthorized');
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
        localStorage.removeItem('user')
      }
    }else if(error.code === "ERR_NETWORK"){
      console.warn("Máy chủ đang gặp sự cố !");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;