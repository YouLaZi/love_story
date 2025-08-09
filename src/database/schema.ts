import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'story4love.db';
export const DATABASE_VERSION = 1;

// 数据库初始化脚本
export const INIT_SQL = `
  -- 用户表
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    preferences TEXT -- JSON格式存储用户偏好设置
  );

  -- 日记条目表
  CREATE TABLE IF NOT EXISTS diary_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT NOT NULL,
    tags TEXT, -- JSON数组格式存储标签
    is_private INTEGER DEFAULT 0,
    location TEXT,
    weather TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    encrypted_content TEXT, -- 加密后的内容
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- 附件表
  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    diary_entry_id TEXT NOT NULL,
    type TEXT NOT NULL, -- image, video, audio, document
    uri TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diary_entry_id) REFERENCES diary_entries (id) ON DELETE CASCADE
  );

  -- 聊天记录表
  CREATE TABLE IF NOT EXISTS chat_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL, -- wechat, qq, telegram, whatsapp, manual
    contact_name TEXT NOT NULL,
    contact_id TEXT,
    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    start_date DATETIME,
    end_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- 聊天消息表
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    chat_record_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- text, image, video, audio, sticker, file
    timestamp DATETIME NOT NULL,
    is_from_user INTEGER DEFAULT 0,
    FOREIGN KEY (chat_record_id) REFERENCES chat_records (id) ON DELETE CASCADE
  );

  -- 标签表
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#FF6B9D',
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, name)
  );

  -- 情感分析表
  CREATE TABLE IF NOT EXISTS emotion_analysis (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    period TEXT NOT NULL, -- daily, weekly, monthly, yearly
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    emotions TEXT, -- JSON格式存储情感统计
    trends TEXT, -- JSON格式存储情感趋势
    insights TEXT, -- JSON数组格式存储分析洞察
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- 备份记录表
  CREATE TABLE IF NOT EXISTS backups (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    backup_data TEXT, -- JSON格式存储备份数据
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    size INTEGER,
    encrypted INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- 创建索引以提高查询性能
  CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON diary_entries(created_at);
  CREATE INDEX IF NOT EXISTS idx_diary_entries_mood ON diary_entries(mood);
  CREATE INDEX IF NOT EXISTS idx_attachments_diary_entry_id ON attachments(diary_entry_id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_record_id ON chat_messages(chat_record_id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
  CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
  CREATE INDEX IF NOT EXISTS idx_emotion_analysis_user_id ON emotion_analysis(user_id);
  CREATE INDEX IF NOT EXISTS idx_emotion_analysis_period ON emotion_analysis(period);
`;

// 数据库升级脚本（为未来版本预留）
export const UPGRADE_SQL: { [version: number]: string } = {
  2: `
    -- 版本2的升级脚本示例
    ALTER TABLE diary_entries ADD COLUMN view_count INTEGER DEFAULT 0;
  `,
  // 更多版本的升级脚本...
};

// 数据库初始化函数
export const initDatabase = async (): Promise<SQLite.WebSQLDatabase> => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // 执行初始化SQL
        tx.executeSql(INIT_SQL, [], 
          () => {
            console.log('Database initialized successfully');
          },
          (_, error) => {
            console.error('Database initialization error:', error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Transaction error:', error);
        reject(error);
      },
      () => {
        console.log('Database setup completed');
        resolve(db);
      }
    );
  });
};

// 数据库版本检查和升级
export const checkAndUpgradeDatabase = async (db: SQLite.WebSQLDatabase, currentVersion: number) => {
  if (currentVersion < DATABASE_VERSION) {
    for (let version = currentVersion + 1; version <= DATABASE_VERSION; version++) {
      if (UPGRADE_SQL[version]) {
        await new Promise((resolve, reject) => {
          db.transaction(
            (tx) => {
              tx.executeSql(UPGRADE_SQL[version], [], 
                () => {
                  console.log(`Database upgraded to version ${version}`);
                },
                (_, error) => {
                  console.error(`Database upgrade error for version ${version}:`, error);
                  return false;
                }
              );
            },
            reject,
            resolve
          );
        });
      }
    }
  }
};
