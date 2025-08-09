'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Admin, AdminRole, Permission } from '@/types';
import { authApi } from '@/api/auth';
import Cookies from 'js-cookie';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: AdminRole) => boolean;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = 'admin_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // 检查认证状态
  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.getProfile();
      if (response.success && response.data) {
        setAdmin(response.data);
        setPermissions(response.data.permissions || []);
      } else {
        // Token无效，清除
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Check auth status failed:', error);
      // 认证失败，清除token
      Cookies.remove(TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 登录
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        const { admin: adminData, token, refreshToken } = response.data;
        
        // 保存token
        Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
        if (refreshToken) {
          Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 30, secure: true, sameSite: 'strict' });
        }
        
        // 设置用户信息
        setAdmin(adminData);
        setPermissions(adminData.permissions || []);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // 清除本地状态
      setAdmin(null);
      setPermissions([]);
      Cookies.remove(TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
      
      // 重定向到登录页
      window.location.href = '/login';
    }
  };

  // 检查权限
  const hasPermission = (permission: string): boolean => {
    if (!admin) return false;
    
    // 超级管理员拥有所有权限
    if (admin.role === 'super_admin') return true;
    
    // 检查具体权限
    return permissions.some(p => 
      p.name === permission || 
      `${p.resource}:${p.action}` === permission
    );
  };

  // 检查角色
  const hasRole = (role: AdminRole): boolean => {
    if (!admin) return false;
    
    const roleHierarchy: { [key in AdminRole]: number } = {
      viewer: 1,
      moderator: 2,
      admin: 3,
      super_admin: 4,
    };
    
    return roleHierarchy[admin.role] >= roleHierarchy[role];
  };

  // 刷新管理员信息
  const refreshAdmin = async (): Promise<void> => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data) {
        setAdmin(response.data);
        setPermissions(response.data.permissions || []);
      }
    } catch (error) {
      console.error('Refresh admin failed:', error);
    }
  };

  const value: AuthContextType = {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    permissions,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
