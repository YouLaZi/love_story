// 用户类型定义
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  biometricEnabled: boolean;
  autoBackup: boolean;
  privacyMode: boolean;
  notificationsEnabled: boolean;
}

// 日记类型定义
export interface DiaryEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: EmotionType;
  tags: string[];
  attachments: Attachment[];
  isPrivate: boolean;
  location?: string;
  weather?: string;
  createdAt: Date;
  updatedAt: Date;
  encryptedContent?: string;
}

// 情感类型
export type EmotionType = 
  | 'happy' | 'excited' | 'loved' | 'grateful' | 'peaceful'
  | 'sad' | 'angry' | 'frustrated' | 'anxious' | 'confused'
  | 'neutral' | 'mixed';

// 附件类型
export interface Attachment {
  id: string;
  diaryEntryId: string;
  type: 'image' | 'video' | 'audio' | 'document';
  uri: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
}

// 聊天记录类型
export interface ChatRecord {
  id: string;
  userId: string;
  platform: 'wechat' | 'qq' | 'telegram' | 'whatsapp' | 'manual';
  contactName: string;
  contactId?: string;
  messages: ChatMessage[];
  importedAt: Date;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface ChatMessage {
  id: string;
  chatRecordId: string;
  sender: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'sticker' | 'file';
  timestamp: Date;
  isFromUser: boolean;
}

// 标签类型
export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
  usageCount: number;
}

// 情感分析结果
export interface EmotionAnalysis {
  id: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  emotions: EmotionStat[];
  trends: EmotionTrend[];
  insights: string[];
  createdAt: Date;
}

export interface EmotionStat {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

export interface EmotionTrend {
  date: Date;
  emotion: EmotionType;
  intensity: number; // 0-100
}

// 导出选项
export interface ExportOptions {
  format: 'pdf' | 'html' | 'json' | 'images';
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  includeAttachments: boolean;
  includePrivateEntries: boolean;
  template?: 'simple' | 'detailed' | 'timeline' | 'album';
}

// 备份数据
export interface BackupData {
  id: string;
  userId: string;
  entries: DiaryEntry[];
  chatRecords: ChatRecord[];
  tags: Tag[];
  preferences: UserPreferences;
  createdAt: Date;
  size: number;
  encrypted: boolean;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 导航参数类型
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Timeline: undefined;
  Write: undefined;
  Analysis: undefined;
  Settings: undefined;
};

export type StackParamList = {
  MainTabs: undefined;
  DiaryDetail: { entryId: string };
  WriteEntry: { entryId?: string };
  ImportChat: undefined;
  Export: undefined;
  Profile: undefined;
  Security: undefined;
  Themes: undefined;
  EmotionDetail: { analysis: EmotionAnalysis };
};
