import { BackupData, DiaryEntry, ChatRecord, Tag, User } from '../types';
import CryptoService from './CryptoService';
import DatabaseService from './DatabaseService';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime?: Date;
  pendingChanges: number;
  syncInProgress: boolean;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  timestamp: Date;
  syncedItems: number;
  errors?: string[];
}

class CloudSyncService {
  private syncTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private cryptoService = new CryptoService();

  // 云存储配置（这里可以配置为Firebase、AWS S3等）
  private readonly CLOUD_ENDPOINT = 'https://api.story4love.com/sync';
  private readonly SYNC_INTERVAL = 30 * 60 * 1000; // 30分钟自动同步一次

  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.cryptoService.initialize();
      
      // 启动自动同步
      this.startAutoSync(userId);
      
      this.isInitialized = true;
      console.log('CloudSyncService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CloudSyncService:', error);
      throw error;
    }
  }

  /**
   * 启动自动同步
   */
  private startAutoSync(userId: string): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(async () => {
      try {
        await this.syncWithCloud(userId);
      } catch (error) {
        console.error('Auto sync failed:', error);
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * 手动同步
   */
  async syncWithCloud(userId: string, force: boolean = false): Promise<SyncResult> {
    try {
      // 检查网络连接
      if (!await this.isOnline()) {
        throw new Error('No internet connection');
      }

      // 获取本地数据
      const localData = await this.getLocalData(userId);
      
      // 获取云端数据版本信息
      const cloudVersion = await this.getCloudVersion(userId);
      const localVersion = await this.getLocalVersion(userId);

      let syncedItems = 0;

      if (force || !localVersion || cloudVersion > localVersion) {
        // 从云端拉取数据
        const cloudData = await this.downloadFromCloud(userId);
        if (cloudData) {
          await this.mergeCloudData(cloudData, localData);
          syncedItems += cloudData.entries.length + cloudData.chatRecords.length;
        }
      }

      if (force || await this.hasLocalChanges(userId)) {
        // 推送本地更改到云端
        const uploadResult = await this.uploadToCloud(userId, localData);
        syncedItems += uploadResult.uploadedItems;
      }

      // 更新同步时间戳
      await this.updateSyncTimestamp(userId);

      return {
        success: true,
        timestamp: new Date(),
        syncedItems
      };

    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        timestamp: new Date(),
        syncedItems: 0,
        errors: [error instanceof Error ? error.message : 'Unknown sync error']
      };
    }
  }

  /**
   * 创建备份
   */
  async createBackup(userId: string, includePrivate: boolean = true): Promise<BackupData> {
    try {
      // 获取所有数据
      const entries = await DatabaseService.getDiaryEntries(userId);
      const tags = await DatabaseService.getTagsByUserId(userId);
      const user = await DatabaseService.getUserById(userId);
      
      // 过滤私密内容（如果需要）
      const filteredEntries = includePrivate 
        ? entries 
        : entries.filter(entry => !entry.isPrivate);

      const backupData: BackupData = {
        id: Date.now().toString(),
        userId,
        entries: filteredEntries,
        chatRecords: [], // 需要实现获取聊天记录的方法
        tags,
        preferences: user?.preferences || {
          theme: 'auto',
          fontSize: 'medium',
          biometricEnabled: false,
          autoBackup: true,
          privacyMode: false,
          notificationsEnabled: true
        },
        createdAt: new Date(),
        size: this.calculateBackupSize(filteredEntries, [], tags),
        encrypted: includePrivate
      };

      return backupData;
    } catch (error) {
      console.error('Create backup failed:', error);
      throw error;
    }
  }

  /**
   * 导出备份文件
   */
  async exportBackup(userId: string, password?: string): Promise<string> {
    try {
      const backupData = await this.createBackup(userId, !!password);
      
      let backupContent: string;
      
      if (password) {
        // 使用用户密码加密备份
        backupContent = await this.cryptoService.createEncryptedBackup(backupData, password);
      } else {
        // 使用应用密钥加密
        backupContent = await this.cryptoService.createEncryptedBackup(backupData);
      }

      // 保存到文件
      const fileName = `story4love_backup_${new Date().toISOString().split('T')[0]}.s4l`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, backupContent);
      
      return filePath;
    } catch (error) {
      console.error('Export backup failed:', error);
      throw error;
    }
  }

  /**
   * 导入备份文件
   */
  async importBackup(filePath: string, password?: string): Promise<void> {
    try {
      // 读取备份文件
      const backupContent = await FileSystem.readAsStringAsync(filePath);
      
      // 解密备份数据
      const backupData: BackupData = password
        ? await this.cryptoService.decryptBackup(backupContent, password)
        : await this.cryptoService.decryptBackup(backupContent);

      // 验证备份数据
      if (!this.validateBackupData(backupData)) {
        throw new Error('Invalid backup data format');
      }

      // 导入数据到本地数据库
      await this.restoreFromBackup(backupData);
      
      console.log('Backup imported successfully');
    } catch (error) {
      console.error('Import backup failed:', error);
      throw error;
    }
  }

  /**
   * 获取同步状态
   */
  async getSyncStatus(userId: string): Promise<SyncStatus> {
    try {
      const lastSyncTime = await this.getLastSyncTime(userId);
      const pendingChanges = await this.getPendingChangesCount(userId);
      const isOnline = await this.isOnline();

      return {
        isOnline,
        lastSyncTime,
        pendingChanges,
        syncInProgress: false, // 实际实现中需要维护这个状态
      };
    } catch (error) {
      return {
        isOnline: false,
        pendingChanges: 0,
        syncInProgress: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 检查网络连接
   */
  private async isOnline(): Promise<boolean> {
    try {
      // 简单的网络检查，实际项目中可以使用 @react-native-community/netinfo
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 获取本地数据
   */
  private async getLocalData(userId: string): Promise<BackupData> {
    return await this.createBackup(userId, true);
  }

  /**
   * 获取云端版本
   */
  private async getCloudVersion(userId: string): Promise<number> {
    try {
      const response = await fetch(`${this.CLOUD_ENDPOINT}/version/${userId}`, {
        headers: await this.getAuthHeaders(userId)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.version || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Get cloud version failed:', error);
      return 0;
    }
  }

  /**
   * 获取本地版本
   */
  private async getLocalVersion(userId: string): Promise<number | null> {
    try {
      const version = await SecureStore.getItemAsync(`sync_version_${userId}`);
      return version ? parseInt(version, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * 从云端下载数据
   */
  private async downloadFromCloud(userId: string): Promise<BackupData | null> {
    try {
      const response = await fetch(`${this.CLOUD_ENDPOINT}/download/${userId}`, {
        headers: await this.getAuthHeaders(userId)
      });

      if (response.ok) {
        const encryptedData = await response.text();
        return await this.cryptoService.decryptBackup(encryptedData);
      }

      return null;
    } catch (error) {
      console.error('Download from cloud failed:', error);
      return null;
    }
  }

  /**
   * 上传数据到云端
   */
  private async uploadToCloud(userId: string, data: BackupData): Promise<{ success: boolean; uploadedItems: number }> {
    try {
      const encryptedData = await this.cryptoService.createEncryptedBackup(data);
      
      const response = await fetch(`${this.CLOUD_ENDPOINT}/upload/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthHeaders(userId))
        },
        body: JSON.stringify({ data: encryptedData })
      });

      if (response.ok) {
        return {
          success: true,
          uploadedItems: data.entries.length + data.chatRecords.length
        };
      }

      throw new Error(`Upload failed: ${response.statusText}`);
    } catch (error) {
      console.error('Upload to cloud failed:', error);
      return { success: false, uploadedItems: 0 };
    }
  }

  /**
   * 合并云端数据
   */
  private async mergeCloudData(cloudData: BackupData, localData: BackupData): Promise<void> {
    // 实现数据合并逻辑，避免冲突
    // 这里需要根据时间戳、ID等来判断如何合并数据
    console.log('Merging cloud data with local data...');
    
    // 合并日记条目
    for (const cloudEntry of cloudData.entries) {
      const localEntry = localData.entries.find(e => e.id === cloudEntry.id);
      
      if (!localEntry) {
        // 新的云端条目，直接添加到本地
        await this.addEntryToLocal(cloudEntry);
      } else if (cloudEntry.updatedAt > localEntry.updatedAt) {
        // 云端版本更新，更新本地
        await this.updateLocalEntry(cloudEntry);
      }
    }

    // 类似地处理标签、聊天记录等其他数据...
  }

  /**
   * 获取认证头
   */
  private async getAuthHeaders(userId: string): Promise<Record<string, string>> {
    // 这里应该返回实际的认证token
    // 在真实项目中，需要实现用户认证机制
    return {
      'Authorization': `Bearer ${userId}`, // 简化的认证方式
      'X-User-ID': userId
    };
  }

  /**
   * 检查是否有本地更改
   */
  private async hasLocalChanges(userId: string): Promise<boolean> {
    // 检查自上次同步以来是否有本地更改
    // 可以通过维护一个"已修改"标记来实现
    const lastSyncTime = await this.getLastSyncTime(userId);
    if (!lastSyncTime) return true;

    // 检查是否有在lastSyncTime之后修改的数据
    // 这里需要在数据库中实现相应的查询
    return false; // 简化实现
  }

  /**
   * 获取上次同步时间
   */
  private async getLastSyncTime(userId: string): Promise<Date | undefined> {
    try {
      const timestamp = await SecureStore.getItemAsync(`last_sync_${userId}`);
      return timestamp ? new Date(timestamp) : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * 更新同步时间戳
   */
  private async updateSyncTimestamp(userId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(`last_sync_${userId}`, new Date().toISOString());
    } catch (error) {
      console.error('Update sync timestamp failed:', error);
    }
  }

  /**
   * 获取待同步更改数量
   */
  private async getPendingChangesCount(userId: string): Promise<number> {
    // 计算待同步的更改数量
    // 需要在实际实现中维护待同步项目的队列
    return 0; // 简化实现
  }

  /**
   * 计算备份大小
   */
  private calculateBackupSize(entries: DiaryEntry[], chatRecords: ChatRecord[], tags: Tag[]): number {
    const jsonString = JSON.stringify({ entries, chatRecords, tags });
    return new Blob([jsonString]).size;
  }

  /**
   * 验证备份数据格式
   */
  private validateBackupData(data: BackupData): boolean {
    return !!(data && data.id && data.userId && Array.isArray(data.entries));
  }

  /**
   * 从备份恢复数据
   */
  private async restoreFromBackup(backupData: BackupData): Promise<void> {
    // 清空现有数据（可选，或者选择合并）
    // 恢复日记条目
    for (const entry of backupData.entries) {
      await this.addEntryToLocal(entry);
    }

    // 恢复标签
    for (const tag of backupData.tags) {
      await this.addTagToLocal(tag);
    }

    // 恢复用户偏好设置
    // await this.updateUserPreferences(backupData.userId, backupData.preferences);
  }

  /**
   * 添加条目到本地数据库
   */
  private async addEntryToLocal(entry: DiaryEntry): Promise<void> {
    try {
      // 检查条目是否已存在
      // const existing = await DatabaseService.getDiaryEntryById(entry.id);
      // if (!existing) {
      //   await DatabaseService.createDiaryEntry(entry);
      // }
      console.log('Adding entry to local database:', entry.id);
    } catch (error) {
      console.error('Add entry to local failed:', error);
    }
  }

  /**
   * 更新本地条目
   */
  private async updateLocalEntry(entry: DiaryEntry): Promise<void> {
    try {
      await DatabaseService.updateDiaryEntry(entry.id, entry);
    } catch (error) {
      console.error('Update local entry failed:', error);
    }
  }

  /**
   * 添加标签到本地
   */
  private async addTagToLocal(tag: Tag): Promise<void> {
    try {
      // await DatabaseService.createTag(tag);
      console.log('Adding tag to local database:', tag.name);
    } catch (error) {
      console.error('Add tag to local failed:', error);
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stopAutoSync();
    this.isInitialized = false;
  }
}

export default new CloudSyncService();
