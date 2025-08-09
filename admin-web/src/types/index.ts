// 用户相关类型
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLoginAt?: Date;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  biometricEnabled: boolean;
  autoBackup: boolean;
  privacyMode: boolean;
  notificationsEnabled: boolean;
}

export interface UserStats {
  totalEntries: number;
  totalChatRecords: number;
  totalTags: number;
  lastActiveAt: Date;
  avgEntriesPerWeek: number;
  favoriteEmotion: EmotionType;
}

// 管理员相关类型
export interface Admin {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'viewer';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// 日记相关类型
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
  status: 'active' | 'reported' | 'hidden' | 'deleted';
  reportCount: number;
}

export type EmotionType = 
  | 'happy' | 'excited' | 'loved' | 'grateful' | 'peaceful'
  | 'sad' | 'angry' | 'frustrated' | 'anxious' | 'confused'
  | 'neutral' | 'mixed';

export interface Attachment {
  id: string;
  diaryEntryId: string;
  type: 'image' | 'video' | 'audio' | 'document';
  uri: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
}

// 举报相关类型
export interface Report {
  id: string;
  reporterId: string;
  targetType: 'diary_entry' | 'user' | 'chat_record';
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

export type ReportReason = 
  | 'inappropriate_content' 
  | 'spam' 
  | 'harassment' 
  | 'privacy_violation' 
  | 'copyright' 
  | 'other';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

// 聊天记录相关类型
export interface ChatRecord {
  id: string;
  userId: string;
  platform: 'wechat' | 'qq' | 'telegram' | 'whatsapp' | 'manual';
  contactName: string;
  contactId?: string;
  messageCount: number;
  importedAt: Date;
  dateRange: {
    start: Date;
    end: Date;
  };
  status: 'active' | 'hidden' | 'deleted';
}

// 系统统计类型
export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalDiaryEntries: number;
  totalChatRecords: number;
  totalReports: number;
  pendingReports: number;
  storageUsed: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
}

// 分析数据类型
export interface AnalyticsData {
  userGrowth: TimeSeriesData[];
  contentGrowth: TimeSeriesData[];
  emotionDistribution: EmotionDistribution[];
  platformUsage: PlatformUsage[];
  featureUsage: FeatureUsage[];
  userRetention: RetentionData[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface EmotionDistribution {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

export interface PlatformUsage {
  platform: string;
  userCount: number;
  percentage: number;
}

export interface FeatureUsage {
  feature: string;
  usageCount: number;
  userCount: number;
  percentage: number;
}

export interface RetentionData {
  cohort: string;
  day0: number;
  day1: number;
  day7: number;
  day30: number;
}

// API相关类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 表格相关类型
export interface TableColumn<T = any> {
  field: keyof T;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: { value: any; row: T }) => React.ReactNode;
}

export interface TableFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}

export interface TableSort {
  field: string;
  sort: 'asc' | 'desc';
}

// 表单相关类型
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'date' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  options?: { value: any; label: string }[];
  validation?: any;
  placeholder?: string;
  helperText?: string;
}

// 设置相关类型
export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  category: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
    supportEmail: string;
  };
  features: {
    userRegistration: boolean;
    chatImport: boolean;
    emotionAnalysis: boolean;
    cloudSync: boolean;
    dataExport: boolean;
  };
  limits: {
    maxDiaryEntries: number;
    maxFileSize: number;
    maxChatRecords: number;
    maxTags: number;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
  };
}

// 通知相关类型
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetType: 'all_users' | 'specific_users' | 'user_group';
  targetIds?: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  createdBy: string;
  createdAt: Date;
}

// 导航相关类型
export interface NavigationItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  children?: NavigationItem[];
  permissions?: string[];
}

// 仪表板组件类型
export interface DashboardCard {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: string;
  color: string;
  link?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// 文件上传类型
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

// 搜索相关类型
export interface SearchQuery {
  query: string;
  filters: { [key: string]: any };
  sort: TableSort[];
  page: number;
  limit: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  took: number;
}

// 审计日志类型
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// 主题相关类型
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
}

// Hook返回类型
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseTableResult<T> {
  rows: T[];
  page: number;
  pageSize: number;
  total: number;
  loading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: TableFilter[]) => void;
  setSort: (sort: TableSort[]) => void;
  refresh: () => void;
}
