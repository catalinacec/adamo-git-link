import axiosInstance from "./axiosInstance";

const apiService = {
  get: async <T>(url: string, signal?: AbortSignal): Promise<T> => {
    const response = await axiosInstance.get(url, { signal });
    return response.data as T;
  },

  post: async <T>(url: string, data: T, signal?: AbortSignal): Promise<T> => {
    const response = await axiosInstance.post(url, data, { signal });
    return response.data;
  },

  delete: async <T>(url: string, signal?: AbortSignal): Promise<T> => {
    const response = await axiosInstance.delete(url, { signal });
    return response.data as T;
  },

  postFormData: async (
    url: string,
    formData: FormData,
    signal?: AbortSignal,
  ): Promise<any> => {
    const response = await axiosInstance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal,
    });
    return response.data;
  },
};

export default apiService;
