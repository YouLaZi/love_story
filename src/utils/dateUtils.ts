import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期为相对时间
 */
export const formatRelativeTime = (date: Date): string => {
  if (isToday(date)) {
    return `今天 ${format(date, 'HH:mm')}`;
  }
  
  if (isYesterday(date)) {
    return `昨天 ${format(date, 'HH:mm')}`;
  }
  
  if (isThisWeek(date)) {
    return format(date, 'EEEE HH:mm', { locale: zhCN });
  }
  
  if (isThisMonth(date)) {
    return format(date, 'MM月dd日 HH:mm', { locale: zhCN });
  }
  
  if (isThisYear(date)) {
    return format(date, 'MM月dd日', { locale: zhCN });
  }
  
  return format(date, 'yyyy年MM月dd日', { locale: zhCN });
};

/**
 * 格式化时间距离
 */
export const formatTimeDistance = (date: Date): string => {
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: zhCN 
  });
};

/**
 * 格式化完整日期时间
 */
export const formatFullDateTime = (date: Date): string => {
  return format(date, 'yyyy年MM月dd日 EEEE HH:mm:ss', { locale: zhCN });
};

/**
 * 格式化短日期
 */
export const formatShortDate = (date: Date): string => {
  return format(date, 'MM-dd', { locale: zhCN });
};

/**
 * 格式化时间
 */
export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

/**
 * 获取日期范围的描述
 */
export const getDateRangeDescription = (start: Date, end: Date): string => {
  const startStr = format(start, 'yyyy年MM月dd日', { locale: zhCN });
  const endStr = format(end, 'yyyy年MM月dd日', { locale: zhCN });
  
  if (startStr === endStr) {
    return startStr;
  }
  
  return `${startStr} 至 ${endStr}`;
};

/**
 * 检查两个日期是否在同一天
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
};

/**
 * 获取日期的时间段描述
 */
export const getTimePeriodDescription = (date: Date): string => {
  const hour = date.getHours();
  
  if (hour < 6) return '深夜';
  if (hour < 9) return '早晨';
  if (hour < 12) return '上午';
  if (hour < 14) return '中午';
  if (hour < 18) return '下午';
  if (hour < 22) return '晚上';
  return '深夜';
};
