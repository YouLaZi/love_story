import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse, ApiError } from '@/types';

const TOKEN_KEY = 'admin_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

// 创建axios实例
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  client.interceptors.request.use(
    (config) => {
      // 添加认证token
      const token = Cookies.get(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 添加请求ID用于追踪
      config.headers['X-Request-ID'] = generateRequestId();

      // 添加时间戳
      config.headers['X-Timestamp'] = Date.now().toString();

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  client.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // 处理401错误（未认证）
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // 尝试刷新token
          const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
          if (refreshToken) {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
              { refreshToken }
            );

            if (response.data.success) {
              const { token, refreshToken: newRefreshToken } = response.data.data;
              
              // 更新token
              Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
              if (newRefreshToken) {
                Cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, { expires: 30, secure: true, sameSite: 'strict' });
              }

              // 重试原请求
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }

        // 刷新失败，清除token并重定向到登录页
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // 处理403错误（无权限）
      if (error.response?.status === 403) {
        console.error('Access denied:', error.response.data);
        // 可以显示权限不足的提示
      }

      // 处理500错误（服务器错误）
      if (error.response?.status === 500) {
        console.error('Server error:', error.response.data);
        // 可以显示服务器错误的提示
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// 生成请求ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 创建API客户端实例
export const apiClient = createApiClient();

// 通用API响应处理器
export const handleApiResponse = <T>(response: AxiosResponse): ApiResponse<T> => {
  return response.data;
};

// 通用API错误处理器
export const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // 服务器返回错误响应
    const { status, data } = error.response;
    return {
      code: `HTTP_${status}`,
      message: data?.message || error.message || 'Request failed',
      details: data,
    };
  } else if (error.request) {
    // 网络错误
    return {
      code: 'NETWORK_ERROR',
      message: '网络连接失败，请检查网络设置',
      details: error.request,
    };
  } else {
    // 其他错误
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || '未知错误',
      details: error,
    };
  }
};

// 扩展的API客户端，包含常用方法
export const apiClientExtended = {
  // GET请求
  get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.get(url, { params });
      return handleApiResponse<T>(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // POST请求
  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.post(url, data);
      return handleApiResponse<T>(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // PUT请求
  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.put(url, data);
      return handleApiResponse<T>(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // PATCH请求
  patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.patch(url, data);
      return handleApiResponse<T>(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // DELETE请求
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.delete(url);
      return handleApiResponse<T>(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // 文件上传
  upload: async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return handleApiResponse<T>(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // 文件下载
  download: async (url: string, filename?: string): Promise<void> => {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });

      // 创建下载链接
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// 重新导出扩展的客户端作为默认客户端
export { apiClientExtended as apiClient };

export default apiClient;
