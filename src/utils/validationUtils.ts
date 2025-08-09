/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证密码强度
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} => {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 6) {
    errors.push('密码长度至少6位');
  } else {
    score += 1;
  }

  if (password.length >= 8) {
    score += 1;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else if (/[a-zA-Z]/.test(password)) {
    score += 0.5;
  }

  if (/\d/.test(password)) {
    score += 1;
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4) {
    strength = 'strong';
  } else if (score >= 2.5) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0 && score >= 2,
    strength,
    errors
  };
};

/**
 * 验证用户名
 */
export const validateUsername = (username: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!username.trim()) {
    errors.push('用户名不能为空');
  } else {
    if (username.length < 2) {
      errors.push('用户名至少2个字符');
    }
    
    if (username.length > 20) {
      errors.push('用户名不能超过20个字符');
    }
    
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(username)) {
      errors.push('用户名只能包含字母、数字、中文、下划线和连字符');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证日记标题
 */
export const validateDiaryTitle = (title: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!title.trim()) {
    errors.push('标题不能为空');
  } else {
    if (title.length > 100) {
      errors.push('标题不能超过100个字符');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证日记内容
 */
export const validateDiaryContent = (content: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!content.trim()) {
    errors.push('内容不能为空');
  } else {
    if (content.length > 10000) {
      errors.push('内容不能超过10000个字符');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证标签名称
 */
export const validateTagName = (tagName: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!tagName.trim()) {
    errors.push('标签名称不能为空');
  } else {
    if (tagName.length > 20) {
      errors.push('标签名称不能超过20个字符');
    }
    
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(tagName)) {
      errors.push('标签名称只能包含字母、数字和中文');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证文件大小
 */
export const validateFileSize = (fileSize: number, maxSizeMB: number = 10): {
  isValid: boolean;
  error?: string;
} => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (fileSize > maxSizeBytes) {
    return {
      isValid: false,
      error: `文件大小不能超过${maxSizeMB}MB`
    };
  }

  return { isValid: true };
};

/**
 * 验证图片文件类型
 */
export const validateImageType = (fileName: string): {
  isValid: boolean;
  error?: string;
} => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  if (!allowedTypes.includes(extension)) {
    return {
      isValid: false,
      error: `不支持的图片格式，仅支持: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * 验证音频文件类型
 */
export const validateAudioType = (fileName: string): {
  isValid: boolean;
  error?: string;
} => {
  const allowedTypes = ['.mp3', '.wav', '.m4a', '.aac'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  if (!allowedTypes.includes(extension)) {
    return {
      isValid: false,
      error: `不支持的音频格式，仅支持: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * 验证视频文件类型
 */
export const validateVideoType = (fileName: string): {
  isValid: boolean;
  error?: string;
} => {
  const allowedTypes = ['.mp4', '.mov', '.avi', '.mkv'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  if (!allowedTypes.includes(extension)) {
    return {
      isValid: false,
      error: `不支持的视频格式，仅支持: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * 清理和验证用户输入
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
    .replace(/[<>]/g, ''); // 移除可能的HTML标签字符
};

/**
 * 验证日期范围
 */
export const validateDateRange = (startDate: Date, endDate: Date): {
  isValid: boolean;
  error?: string;
} => {
  if (startDate > endDate) {
    return {
      isValid: false,
      error: '开始日期不能晚于结束日期'
    };
  }

  const now = new Date();
  if (startDate > now) {
    return {
      isValid: false,
      error: '开始日期不能是未来时间'
    };
  }

  return { isValid: true };
};

/**
 * 验证联系人姓名
 */
export const validateContactName = (name: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!name.trim()) {
    errors.push('联系人姓名不能为空');
  } else {
    if (name.length > 50) {
      errors.push('联系人姓名不能超过50个字符');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
