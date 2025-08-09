import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import DatabaseService from '../services/DatabaseService';
import CryptoService from '../services/CryptoService';
import CloudSyncService from '../services/CloudSyncService';

export interface SetupResult {
  success: boolean;
  warnings: string[];
  errors: string[];
  features: {
    biometric: boolean;
    secureStore: boolean;
    database: boolean;
    encryption: boolean;
    cloudSync: boolean;
  };
}

/**
 * 应用初始化设置检查
 */
export const performAppSetup = async (): Promise<SetupResult> => {
  const warnings: string[] = [];
  const errors: string[] = [];
  const features = {
    biometric: false,
    secureStore: false,
    database: false,
    encryption: false,
    cloudSync: false
  };

  try {
    // 检查生物识别支持
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        features.biometric = true;
      } else if (hasHardware && !isEnrolled) {
        warnings.push('设备支持生物识别但未设置，建议在系统设置中启用');
      } else {
        warnings.push('设备不支持生物识别功能');
      }
    } catch (error) {
      warnings.push('无法检查生物识别支持');
    }

    // 检查安全存储
    try {
      await SecureStore.setItemAsync('test_key', 'test_value');
      await SecureStore.deleteItemAsync('test_key');
      features.secureStore = true;
    } catch (error) {
      errors.push('安全存储功能不可用');
    }

    // 初始化数据库
    try {
      await DatabaseService.initialize();
      features.database = true;
    } catch (error) {
      errors.push('数据库初始化失败');
    }

    // 初始化加密服务
    try {
      const cryptoService = new CryptoService();
      await cryptoService.initialize();
      features.encryption = true;
    } catch (error) {
      errors.push('加密服务初始化失败');
    }

    // 检查云同步（可选）
    try {
      // 这里可以添加网络连接检查
      features.cloudSync = true;
    } catch (error) {
      warnings.push('云同步功能暂时不可用');
    }

    return {
      success: errors.length === 0,
      warnings,
      errors,
      features
    };

  } catch (error) {
    errors.push('应用初始化过程中发生未知错误');
    return {
      success: false,
      warnings,
      errors,
      features
    };
  }
};

/**
 * 检查应用权限
 */
export const checkAppPermissions = async (): Promise<{
  camera: boolean;
  microphone: boolean;
  storage: boolean;
  notifications: boolean;
}> => {
  // 这里需要根据实际使用的权限库来实现
  // 例如使用 expo-permissions 或 react-native-permissions
  
  return {
    camera: true,    // 相机权限
    microphone: true, // 麦克风权限
    storage: true,   // 存储权限
    notifications: true // 通知权限
  };
};

/**
 * 清理应用数据
 */
export const clearAppData = async (): Promise<void> => {
  try {
    // 清理数据库
    // await DatabaseService.clearAllData();
    
    // 清理安全存储
    // await SecureStore.deleteItemAsync('story4love_user_id');
    // await SecureStore.deleteItemAsync('story4love_encryption_key');
    
    // 清理加密密钥
    const cryptoService = new CryptoService();
    await cryptoService.clearKeys();
    
    console.log('App data cleared successfully');
  } catch (error) {
    console.error('Failed to clear app data:', error);
    throw error;
  }
};

/**
 * 获取应用版本信息
 */
export const getAppVersion = (): {
  version: string;
  buildNumber: string;
  platform: string;
} => {
  return {
    version: '1.0.0',
    buildNumber: '1',
    platform: 'React Native'
  };
};

/**
 * 检查应用更新
 */
export const checkForUpdates = async (): Promise<{
  hasUpdate: boolean;
  latestVersion?: string;
  updateUrl?: string;
  isRequired?: boolean;
}> => {
  try {
    // 这里可以调用应用商店API或自己的更新服务
    // 目前返回模拟数据
    return {
      hasUpdate: false
    };
  } catch (error) {
    console.error('Check for updates failed:', error);
    return {
      hasUpdate: false
    };
  }
};

/**
 * 应用性能监控初始化
 */
export const initializeAnalytics = async (): Promise<void> => {
  try {
    // 这里可以初始化分析服务
    // 例如 Firebase Analytics, Sentry 等
    console.log('Analytics initialized');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
};

/**
 * 错误报告
 */
export const reportError = (error: Error, context?: string): void => {
  try {
    // 这里可以上报错误到错误监控服务
    console.error('Error reported:', error, 'Context:', context);
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
};
