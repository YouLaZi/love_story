import { ApiResponse, Admin } from '@/types';
import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  admin: Admin;
  token: string;
  refreshToken?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  // 管理员登录
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post('/auth/login', { email, password });
  },

  // 管理员登出
  logout: async (): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/logout');
  },

  // 获取当前管理员信息
  getProfile: async (): Promise<ApiResponse<Admin>> => {
    return apiClient.get('/auth/profile');
  },

  // 更新管理员信息
  updateProfile: async (data: Partial<Admin>): Promise<ApiResponse<Admin>> => {
    return apiClient.put('/auth/profile', data);
  },

  // 修改密码
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/change-password', data);
  },

  // 刷新Token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken?: string }>> => {
    return apiClient.post('/auth/refresh-token', { refreshToken });
  },

  // 验证Token
  verifyToken: async (): Promise<ApiResponse<{ valid: boolean }>> => {
    return apiClient.get('/auth/verify-token');
  },

  // 忘记密码
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // 重置密码
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },

  // 启用双因素认证
  enableTwoFactor: async (): Promise<ApiResponse<{ qrCode: string; secret: string }>> => {
    return apiClient.post('/auth/enable-2fa');
  },

  // 验证双因素认证
  verifyTwoFactor: async (token: string): Promise<ApiResponse<{ backupCodes: string[] }>> => {
    return apiClient.post('/auth/verify-2fa', { token });
  },

  // 禁用双因素认证
  disableTwoFactor: async (token: string): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/disable-2fa', { token });
  },
};
