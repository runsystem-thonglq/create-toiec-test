import axios, { AxiosInstance } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://www.thongledeptrai.click/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Thêm interceptor để gắn token (nếu có)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Xử lý response (ví dụ log lỗi)
axiosInstance.interceptors.response.use(
  (response) => response.data, // chỉ trả về phần data
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
