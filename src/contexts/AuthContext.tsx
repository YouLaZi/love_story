import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { User, UserPreferences } from '../types';
import { useDatabase } from './DatabaseContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricSupported: boolean;
  biometricEnabled: boolean;
  signIn: (username: string, password?: string) => Promise<boolean>;
  signUp: (username: string, email?: string, password?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  USER_ID: 'story4love_user_id',
  USERNAME: 'story4love_username',
  BIOMETRIC_ENABLED: 'story4love_biometric_enabled',
  PASSWORD_HASH: 'story4love_password_hash'
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const { databaseService, isInitialized } = useDatabase();

  // 检查生物识别支持
  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supported = compatible && enrolled;
      
      setBiometricSupported(supported);
      
      if (supported) {
        const enabled = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
        setBiometricEnabled(enabled === 'true');
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setBiometricSupported(false);
    }
  };

  // 检查已有的认证状态
  const checkAuthStatus = async () => {
    try {
      const userId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
      
      if (userId && isInitialized) {
        const userData = await databaseService.getUserById(userId);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // 用户数据不存在，清除存储的ID
          await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      checkAuthStatus();
    }
  }, [isInitialized]);

  // 注册新用户
  const signUp = async (username: string, email?: string, password?: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const defaultPreferences: UserPreferences = {
        theme: 'auto',
        fontSize: 'medium',
        biometricEnabled: false,
        autoBackup: true,
        privacyMode: false,
        notificationsEnabled: true
      };

      const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        username,
        email,
        preferences: defaultPreferences
      };

      const userId = await databaseService.createUser(newUser);
      
      // 存储用户ID
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userId);
      await SecureStore.setItemAsync(STORAGE_KEYS.USERNAME, username);
      
      // 如果提供了密码，存储密码哈希
      if (password) {
        // 这里应该使用更安全的哈希算法，如bcrypt
        const passwordHash = require('crypto-js').SHA256(password).toString();
        await SecureStore.setItemAsync(STORAGE_KEYS.PASSWORD_HASH, passwordHash);
      }

      // 获取完整的用户数据
      const userData = await databaseService.getUserById(userId);
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 用户登录
  const signIn = async (username: string, password?: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const storedUsername = await SecureStore.getItemAsync(STORAGE_KEYS.USERNAME);
      
      if (storedUsername !== username) {
        return false;
      }

      // 如果提供了密码，验证密码
      if (password) {
        const storedPasswordHash = await SecureStore.getItemAsync(STORAGE_KEYS.PASSWORD_HASH);
        if (storedPasswordHash) {
          const passwordHash = require('crypto-js').SHA256(password).toString();
          if (passwordHash !== storedPasswordHash) {
            return false;
          }
        }
      }

      const userId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
      if (userId) {
        const userData = await databaseService.getUserById(userId);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 生物识别认证
  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      if (!biometricSupported || !biometricEnabled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '请使用生物识别验证身份',
        cancelLabel: '取消',
        fallbackLabel: '使用密码',
        disableDeviceFallback: false
      });

      if (result.success) {
        const userId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
        if (userId) {
          const userData = await databaseService.getUserById(userId);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  // 启用生物识别
  const enableBiometric = async (): Promise<boolean> => {
    try {
      if (!biometricSupported) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '请验证生物识别以启用此功能',
        cancelLabel: '取消',
        fallbackLabel: '使用密码'
      });

      if (result.success) {
        await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
        setBiometricEnabled(true);
        
        // 更新用户偏好设置
        if (user) {
          await updateUserPreferences({ biometricEnabled: true });
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Enable biometric error:', error);
      return false;
    }
  };

  // 禁用生物识别
  const disableBiometric = async (): Promise<void> => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
      setBiometricEnabled(false);
      
      // 更新用户偏好设置
      if (user) {
        await updateUserPreferences({ biometricEnabled: false });
      }
    } catch (error) {
      console.error('Disable biometric error:', error);
    }
  };

  // 更新用户偏好设置
  const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<void> => {
    try {
      if (!user) return;

      const updatedPreferences = { ...user.preferences, ...preferences };
      
      // 这里需要在数据库服务中添加更新用户的方法
      // await databaseService.updateUser(user.id, { preferences: updatedPreferences });
      
      setUser({
        ...user,
        preferences: updatedPreferences,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update preferences error:', error);
    }
  };

  // 用户登出
  const signOut = async (): Promise<void> => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      
      // 可选：清除存储的认证信息（根据需求决定）
      // await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
      // await SecureStore.deleteItemAsync(STORAGE_KEYS.USERNAME);
      // await SecureStore.deleteItemAsync(STORAGE_KEYS.PASSWORD_HASH);
      // await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    biometricSupported,
    biometricEnabled,
    signIn,
    signUp,
    signOut,
    authenticateWithBiometric,
    enableBiometric,
    disableBiometric,
    updateUserPreferences
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
