/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * 格式化数字（添加千分位分隔符）
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

/**
 * 格式化百分比
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * 截断文本
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 首字母大写
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * 格式化情感名称
 */
export const formatEmotionName = (emotion: string): string => {
  const emotionMap: { [key: string]: string } = {
    happy: '开心',
    excited: '兴奋',
    loved: '被爱',
    grateful: '感恩',
    peaceful: '平静',
    sad: '难过',
    angry: '愤怒',
    frustrated: '沮丧',
    anxious: '焦虑',
    confused: '困惑',
    neutral: '中性',
    mixed: '复杂'
  };
  
  return emotionMap[emotion] || emotion;
};

/**
 * 格式化消息类型
 */
export const formatMessageType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    text: '文字',
    image: '图片',
    video: '视频',
    audio: '语音',
    sticker: '表情',
    file: '文件'
  };
  
  return typeMap[type] || type;
};

/**
 * 格式化平台名称
 */
export const formatPlatformName = (platform: string): string => {
  const platformMap: { [key: string]: string } = {
    wechat: '微信',
    qq: 'QQ',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    manual: '手动添加'
  };
  
  return platformMap[platform] || platform;
};

/**
 * 格式化时间段
 */
export const formatTimePeriod = (period: string): string => {
  const periodMap: { [key: string]: string } = {
    daily: '今日',
    weekly: '本周',
    monthly: '本月',
    yearly: '今年'
  };
  
  return periodMap[period] || period;
};

/**
 * 格式化导出格式
 */
export const formatExportFormat = (format: string): string => {
  const formatMap: { [key: string]: string } = {
    pdf: 'PDF文档',
    html: 'HTML网页',
    json: 'JSON数据',
    images: '图片集'
  };
  
  return formatMap[format] || format;
};

/**
 * 格式化主题模式
 */
export const formatThemeMode = (mode: string): string => {
  const modeMap: { [key: string]: string } = {
    light: '浅色主题',
    dark: '深色主题',
    auto: '跟随系统'
  };
  
  return modeMap[mode] || mode;
};

/**
 * 格式化字体大小
 */
export const formatFontSize = (size: string): string => {
  const sizeMap: { [key: string]: string } = {
    small: '小',
    medium: '中',
    large: '大'
  };
  
  return sizeMap[size] || size;
};

/**
 * 高亮搜索关键词
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * 移除HTML标签
 */
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * 格式化URL
 */
export const formatUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

/**
 * 生成随机颜色
 */
export const generateRandomColor = (): string => {
  const colors = [
    '#FF6B9D', '#8E4EC6', '#40E0D0', '#FFD700', '#FF6347',
    '#32CD32', '#4169E1', '#FF4500', '#9370DB', '#20B2AA'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * 格式化密码强度
 */
export const formatPasswordStrength = (strength: string): { text: string; color: string } => {
  const strengthMap: { [key: string]: { text: string; color: string } } = {
    weak: { text: '弱', color: '#FF4444' },
    medium: { text: '中', color: '#FFA500' },
    strong: { text: '强', color: '#00AA00' }
  };
  
  return strengthMap[strength] || { text: '未知', color: '#999999' };
};

/**
 * 格式化安全级别
 */
export const formatSecurityLevel = (level: string): { text: string; color: string; icon: string } => {
  const levelMap: { [key: string]: { text: string; color: string; icon: string } } = {
    excellent: { text: '优秀', color: '#00AA00', icon: 'shield-check' },
    good: { text: '良好', color: '#32CD32', icon: 'shield' },
    fair: { text: '一般', color: '#FFA500', icon: 'shield-half-full' },
    poor: { text: '较差', color: '#FF4444', icon: 'shield-alert' }
  };
  
  return levelMap[level] || { text: '未知', color: '#999999', icon: 'shield-outline' };
};

/**
 * 格式化统计数据
 */
export const formatStatValue = (value: number, type: 'count' | 'percentage' | 'duration'): string => {
  switch (type) {
    case 'count':
      return formatNumber(value);
    case 'percentage':
      return formatPercentage(value);
    case 'duration':
      if (value < 60) return `${value}秒`;
      if (value < 3600) return `${Math.floor(value / 60)}分钟`;
      return `${Math.floor(value / 3600)}小时`;
    default:
      return value.toString();
  }
};
