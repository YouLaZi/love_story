import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

class CryptoService {
  private static readonly ENCRYPTION_KEY = 'story4love_encryption_key';
  private static readonly IV_KEY = 'story4love_iv_key';
  
  private encryptionKey: string | null = null;

  async initialize(): Promise<void> {
    try {
      // 尝试从安全存储中获取加密密钥
      let key = await SecureStore.getItemAsync(CryptoService.ENCRYPTION_KEY);
      
      if (!key) {
        // 如果没有密钥，生成一个新的
        key = this.generateSecureKey();
        await SecureStore.setItemAsync(CryptoService.ENCRYPTION_KEY, key);
      }
      
      this.encryptionKey = key;
      console.log('CryptoService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CryptoService:', error);
      throw error;
    }
  }

  private generateSecureKey(): string {
    // 生成256位（32字节）的随机密钥
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  private getKey(): string {
    if (!this.encryptionKey) {
      throw new Error('CryptoService not initialized. Call initialize() first.');
    }
    return this.encryptionKey;
  }

  /**
   * 加密文本内容
   */
  encrypt(plainText: string): string {
    try {
      const key = this.getKey();
      const iv = CryptoJS.lib.WordArray.random(16); // 128位IV
      
      const encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS.enc.Utf8.parse(key), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // 将IV和加密数据合并
      const combined = iv.concat(encrypted.ciphertext);
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * 解密文本内容
   */
  decrypt(encryptedText: string): string {
    try {
      const key = this.getKey();
      const combined = CryptoJS.enc.Base64.parse(encryptedText);
      
      // 提取IV（前16字节）和加密数据
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
      const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4));

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any,
        CryptoJS.enc.Utf8.parse(key),
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      const plainText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!plainText) {
        throw new Error('Decryption resulted in empty string');
      }
      
      return plainText;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * 加密JSON对象
   */
  encryptObject<T>(obj: T): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * 解密JSON对象
   */
  decryptObject<T>(encryptedData: string): T {
    const jsonString = this.decrypt(encryptedData);
    return JSON.parse(jsonString);
  }

  /**
   * 生成文件加密密钥
   */
  generateFileKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * 使用指定密钥加密数据
   */
  encryptWithKey(data: string, key: string): string {
    try {
      const iv = CryptoJS.lib.WordArray.random(16);
      
      const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const combined = iv.concat(encrypted.ciphertext);
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error('Encryption with key error:', error);
      throw new Error('Failed to encrypt data with key');
    }
  }

  /**
   * 使用指定密钥解密数据
   */
  decryptWithKey(encryptedData: string, key: string): string {
    try {
      const combined = CryptoJS.enc.Base64.parse(encryptedData);
      
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
      const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4));

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any,
        CryptoJS.enc.Utf8.parse(key),
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      const plainText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!plainText) {
        throw new Error('Decryption resulted in empty string');
      }
      
      return plainText;
    } catch (error) {
      console.error('Decryption with key error:', error);
      throw new Error('Failed to decrypt data with key');
    }
  }

  /**
   * 生成数据哈希值
   */
  generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * 验证数据完整性
   */
  verifyHash(data: string, hash: string): boolean {
    const computedHash = this.generateHash(data);
    return computedHash === hash;
  }

  /**
   * 生成HMAC签名
   */
  generateHMAC(data: string, secret?: string): string {
    const key = secret || this.getKey();
    return CryptoJS.HmacSHA256(data, key).toString();
  }

  /**
   * 验证HMAC签名
   */
  verifyHMAC(data: string, signature: string, secret?: string): boolean {
    const computedSignature = this.generateHMAC(data, secret);
    return computedSignature === signature;
  }

  /**
   * 安全地清除密钥（重置服务）
   */
  async clearKeys(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CryptoService.ENCRYPTION_KEY);
      this.encryptionKey = null;
      console.log('Encryption keys cleared successfully');
    } catch (error) {
      console.error('Failed to clear encryption keys:', error);
      throw error;
    }
  }

  /**
   * 导出加密的备份数据
   */
  async createEncryptedBackup<T>(data: T, userPassword?: string): Promise<string> {
    try {
      const dataString = JSON.stringify(data);
      
      if (userPassword) {
        // 使用用户密码加密
        const salt = CryptoJS.lib.WordArray.random(16);
        const key = CryptoJS.PBKDF2(userPassword, salt, {
          keySize: 8, // 256 bits
          iterations: 10000
        });
        
        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt(dataString, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        
        // 组合 salt + iv + 加密数据
        const combined = salt.concat(iv).concat(encrypted.ciphertext);
        return combined.toString(CryptoJS.enc.Base64);
      } else {
        // 使用应用密钥加密
        return this.encrypt(dataString);
      }
    } catch (error) {
      console.error('Failed to create encrypted backup:', error);
      throw error;
    }
  }

  /**
   * 解密备份数据
   */
  async decryptBackup<T>(encryptedData: string, userPassword?: string): Promise<T> {
    try {
      let decryptedString: string;
      
      if (userPassword) {
        // 使用用户密码解密
        const combined = CryptoJS.enc.Base64.parse(encryptedData);
        
        // 提取 salt（前16字节）、iv（接下来16字节）和加密数据
        const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
        const iv = CryptoJS.lib.WordArray.create(combined.words.slice(4, 8));
        const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(8));
        
        const key = CryptoJS.PBKDF2(userPassword, salt, {
          keySize: 8,
          iterations: 10000
        });
        
        const decrypted = CryptoJS.AES.decrypt(
          { ciphertext: ciphertext } as any,
          key,
          {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          }
        );
        
        decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      } else {
        // 使用应用密钥解密
        decryptedString = this.decrypt(encryptedData);
      }
      
      if (!decryptedString) {
        throw new Error('Decryption resulted in empty string');
      }
      
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Failed to decrypt backup:', error);
      throw error;
    }
  }
}

export default CryptoService;
