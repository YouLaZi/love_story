import * as SQLite from 'expo-sqlite';
import { DiaryEntry, ChatRecord, ChatMessage, Tag, User, EmotionAnalysis, Attachment } from '../types';
import { initDatabase } from '../database/schema';
import CryptoService from './CryptoService';

class DatabaseService {
  private db: SQLite.WebSQLDatabase | null = null;
  private crypto = new CryptoService();

  async initialize(): Promise<void> {
    try {
      this.db = await initDatabase();
      console.log('DatabaseService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DatabaseService:', error);
      throw error;
    }
  }

  private getDb(): SQLite.WebSQLDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // 用户相关操作
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      const id = Date.now().toString();
      const now = new Date().toISOString();
      
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO users (id, username, email, avatar, created_at, updated_at, preferences) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            user.username,
            user.email || null,
            user.avatar || null,
            now,
            now,
            JSON.stringify(user.preferences)
          ],
          () => resolve(id),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const row = rows.item(0);
              const user: User = {
                id: row.id,
                username: row.username,
                email: row.email,
                avatar: row.avatar,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
                preferences: JSON.parse(row.preferences)
              };
              resolve(user);
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // 日记条目操作
  async createDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      const id = Date.now().toString();
      const now = new Date().toISOString();
      
      // 如果需要加密内容
      let encryptedContent = null;
      if (entry.isPrivate) {
        encryptedContent = this.crypto.encrypt(entry.content);
      }

      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO diary_entries (
            id, user_id, title, content, mood, tags, is_private, 
            location, weather, created_at, updated_at, encrypted_content
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            entry.userId,
            entry.title,
            entry.isPrivate ? '' : entry.content, // 如果加密则存储空字符串
            entry.mood,
            JSON.stringify(entry.tags),
            entry.isPrivate ? 1 : 0,
            entry.location || null,
            entry.weather || null,
            now,
            now,
            encryptedContent
          ],
          () => resolve(id),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getDiaryEntries(userId: string, limit?: number, offset?: number): Promise<DiaryEntry[]> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      let sql = 'SELECT * FROM diary_entries WHERE user_id = ? ORDER BY created_at DESC';
      const params: any[] = [userId];
      
      if (limit) {
        sql += ' LIMIT ?';
        params.push(limit);
        if (offset) {
          sql += ' OFFSET ?';
          params.push(offset);
        }
      }

      db.transaction((tx) => {
        tx.executeSql(
          sql,
          params,
          async (_, { rows }) => {
            const entries: DiaryEntry[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              
              // 解密内容（如果需要）
              let content = row.content;
              if (row.is_private && row.encrypted_content) {
                try {
                  content = this.crypto.decrypt(row.encrypted_content);
                } catch (error) {
                  console.error('Failed to decrypt diary entry:', error);
                  content = '[加密内容解密失败]';
                }
              }

              // 获取附件
              const attachments = await this.getAttachmentsByEntryId(row.id);

              const entry: DiaryEntry = {
                id: row.id,
                userId: row.user_id,
                title: row.title,
                content,
                mood: row.mood,
                tags: JSON.parse(row.tags || '[]'),
                attachments,
                isPrivate: row.is_private === 1,
                location: row.location,
                weather: row.weather,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
                encryptedContent: row.encrypted_content
              };
              entries.push(entry);
            }
            resolve(entries);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async updateDiaryEntry(id: string, updates: Partial<DiaryEntry>): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      const now = new Date().toISOString();
      
      // 处理加密内容
      let encryptedContent = updates.encryptedContent;
      if (updates.isPrivate && updates.content) {
        encryptedContent = this.crypto.encrypt(updates.content);
      }

      const setClause = [];
      const params = [];

      if (updates.title !== undefined) {
        setClause.push('title = ?');
        params.push(updates.title);
      }
      if (updates.content !== undefined) {
        setClause.push('content = ?');
        params.push(updates.isPrivate ? '' : updates.content);
      }
      if (updates.mood !== undefined) {
        setClause.push('mood = ?');
        params.push(updates.mood);
      }
      if (updates.tags !== undefined) {
        setClause.push('tags = ?');
        params.push(JSON.stringify(updates.tags));
      }
      if (updates.isPrivate !== undefined) {
        setClause.push('is_private = ?');
        params.push(updates.isPrivate ? 1 : 0);
      }
      if (updates.location !== undefined) {
        setClause.push('location = ?');
        params.push(updates.location);
      }
      if (updates.weather !== undefined) {
        setClause.push('weather = ?');
        params.push(updates.weather);
      }
      if (encryptedContent !== undefined) {
        setClause.push('encrypted_content = ?');
        params.push(encryptedContent);
      }

      setClause.push('updated_at = ?');
      params.push(now);
      params.push(id);

      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE diary_entries SET ${setClause.join(', ')} WHERE id = ?`,
          params,
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async deleteDiaryEntry(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM diary_entries WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // 附件操作
  async addAttachment(attachment: Omit<Attachment, 'id' | 'createdAt'>): Promise<string> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      const id = Date.now().toString();
      const now = new Date().toISOString();

      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO attachments (id, diary_entry_id, type, uri, file_name, file_size, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            attachment.diaryEntryId,
            attachment.type,
            attachment.uri,
            attachment.fileName,
            attachment.fileSize,
            now
          ],
          () => resolve(id),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getAttachmentsByEntryId(entryId: string): Promise<Attachment[]> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM attachments WHERE diary_entry_id = ? ORDER BY created_at',
          [entryId],
          (_, { rows }) => {
            const attachments: Attachment[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              attachments.push({
                id: row.id,
                diaryEntryId: row.diary_entry_id,
                type: row.type,
                uri: row.uri,
                fileName: row.file_name,
                fileSize: row.file_size,
                createdAt: new Date(row.created_at)
              });
            }
            resolve(attachments);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // 标签操作
  async createTag(tag: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>): Promise<string> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      const id = Date.now().toString();
      const now = new Date().toISOString();

      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO tags (id, user_id, name, color, icon, created_at, usage_count)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            tag.userId,
            tag.name,
            tag.color,
            tag.icon || null,
            now,
            0
          ],
          () => resolve(id),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getTagsByUserId(userId: string): Promise<Tag[]> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM tags WHERE user_id = ? ORDER BY usage_count DESC, name',
          [userId],
          (_, { rows }) => {
            const tags: Tag[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              tags.push({
                id: row.id,
                userId: row.user_id,
                name: row.name,
                color: row.color,
                icon: row.icon,
                createdAt: new Date(row.created_at),
                usageCount: row.usage_count
              });
            }
            resolve(tags);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // 搜索功能
  async searchDiaryEntries(userId: string, query: string): Promise<DiaryEntry[]> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM diary_entries 
           WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)
           ORDER BY created_at DESC`,
          [userId, `%${query}%`, `%${query}%`],
          async (_, { rows }) => {
            const entries: DiaryEntry[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              
              let content = row.content;
              if (row.is_private && row.encrypted_content) {
                try {
                  content = this.crypto.decrypt(row.encrypted_content);
                } catch (error) {
                  console.error('Failed to decrypt diary entry:', error);
                  content = '[加密内容解密失败]';
                }
              }

              const attachments = await this.getAttachmentsByEntryId(row.id);

              entries.push({
                id: row.id,
                userId: row.user_id,
                title: row.title,
                content,
                mood: row.mood,
                tags: JSON.parse(row.tags || '[]'),
                attachments,
                isPrivate: row.is_private === 1,
                location: row.location,
                weather: row.weather,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
                encryptedContent: row.encrypted_content
              });
            }
            resolve(entries);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

export default new DatabaseService();
