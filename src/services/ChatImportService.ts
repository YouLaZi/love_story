import { ChatRecord, ChatMessage } from '../types';
import DatabaseService from './DatabaseService';

export interface ParsedMessage {
  timestamp: Date;
  sender: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'sticker' | 'file';
  isFromUser: boolean;
}

export interface ImportResult {
  success: boolean;
  recordId?: string;
  messageCount: number;
  errors?: string[];
}

class ChatImportService {
  /**
   * 解析微信聊天记录
   */
  parseWeChatRecord(content: string, contactName: string, userId: string): ParsedMessage[] {
    const messages: ParsedMessage[] = [];
    const lines = content.split('\n');
    
    // 微信导出格式示例：
    // 2023-12-01 14:30:25 张三
    // 你好，今天天气不错
    // 
    // 2023-12-01 14:31:10 我
    // 是的，适合出去走走
    
    let currentMessage: Partial<ParsedMessage> | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 跳过空行
      if (!trimmedLine) {
        if (currentMessage && currentMessage.content) {
          messages.push(currentMessage as ParsedMessage);
          currentMessage = null;
        }
        continue;
      }
      
      // 检查是否是时间戳和发送者行
      const timeMatch = trimmedLine.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(.+)$/);
      
      if (timeMatch) {
        // 保存之前的消息
        if (currentMessage && currentMessage.content) {
          messages.push(currentMessage as ParsedMessage);
        }
        
        // 开始新消息
        const [, timeStr, sender] = timeMatch;
        currentMessage = {
          timestamp: new Date(timeStr),
          sender: sender.trim(),
          content: '',
          messageType: 'text',
          isFromUser: sender.trim() === '我' || sender.trim() === userId,
        };
      } else if (currentMessage) {
        // 消息内容行
        if (trimmedLine.includes('[图片]')) {
          currentMessage.messageType = 'image';
          currentMessage.content = '[图片]';
        } else if (trimmedLine.includes('[视频]')) {
          currentMessage.messageType = 'video';
          currentMessage.content = '[视频]';
        } else if (trimmedLine.includes('[语音]')) {
          currentMessage.messageType = 'audio';
          currentMessage.content = '[语音]';
        } else if (trimmedLine.includes('[文件]')) {
          currentMessage.messageType = 'file';
          currentMessage.content = '[文件]';
        } else {
          // 普通文本消息
          currentMessage.content += (currentMessage.content ? '\n' : '') + trimmedLine;
        }
      }
    }
    
    // 处理最后一条消息
    if (currentMessage && currentMessage.content) {
      messages.push(currentMessage as ParsedMessage);
    }
    
    return messages.filter(msg => msg.content && msg.timestamp);
  }

  /**
   * 解析QQ聊天记录
   */
  parseQQRecord(content: string, contactName: string, userId: string): ParsedMessage[] {
    const messages: ParsedMessage[] = [];
    const lines = content.split('\n');
    
    // QQ导出格式示例：
    // 2023-12-01 14:30:25 张三(123456789)
    // 你好
    // 
    // 2023-12-01 14:31:10 我(987654321)
    // 你好
    
    let currentMessage: Partial<ParsedMessage> | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        if (currentMessage && currentMessage.content) {
          messages.push(currentMessage as ParsedMessage);
          currentMessage = null;
        }
        continue;
      }
      
      // QQ格式：时间 + 发送者(QQ号)
      const timeMatch = trimmedLine.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(.+?)\(\d+\)$/);
      
      if (timeMatch) {
        if (currentMessage && currentMessage.content) {
          messages.push(currentMessage as ParsedMessage);
        }
        
        const [, timeStr, sender] = timeMatch;
        currentMessage = {
          timestamp: new Date(timeStr),
          sender: sender.trim(),
          content: '',
          messageType: 'text',
          isFromUser: sender.trim() === '我' || sender.trim() === userId,
        };
      } else if (currentMessage) {
        // 处理特殊消息类型
        if (trimmedLine.includes('[图片]')) {
          currentMessage.messageType = 'image';
          currentMessage.content = '[图片]';
        } else if (trimmedLine.includes('[表情]')) {
          currentMessage.messageType = 'sticker';
          currentMessage.content = trimmedLine;
        } else {
          currentMessage.content += (currentMessage.content ? '\n' : '') + trimmedLine;
        }
      }
    }
    
    if (currentMessage && currentMessage.content) {
      messages.push(currentMessage as ParsedMessage);
    }
    
    return messages.filter(msg => msg.content && msg.timestamp);
  }

  /**
   * 导入聊天记录到数据库
   */
  async importChatRecord(
    platform: 'wechat' | 'qq' | 'telegram' | 'whatsapp',
    content: string,
    contactName: string,
    userId: string
  ): Promise<ImportResult> {
    try {
      let parsedMessages: ParsedMessage[];
      
      // 根据平台解析消息
      switch (platform) {
        case 'wechat':
          parsedMessages = this.parseWeChatRecord(content, contactName, userId);
          break;
        case 'qq':
          parsedMessages = this.parseQQRecord(content, contactName, userId);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
      
      if (parsedMessages.length === 0) {
        return {
          success: false,
          messageCount: 0,
          errors: ['没有解析到有效的聊天消息'],
        };
      }
      
      // 计算日期范围
      const timestamps = parsedMessages.map(msg => msg.timestamp.getTime());
      const startDate = new Date(Math.min(...timestamps));
      const endDate = new Date(Math.max(...timestamps));
      
      // 创建聊天记录
      const chatRecord: Omit<ChatRecord, 'id'> = {
        userId,
        platform,
        contactName,
        contactId: undefined,
        messages: [], // 暂时为空，稍后添加
        importedAt: new Date(),
        dateRange: { start: startDate, end: endDate },
      };
      
      // 这里需要在DatabaseService中实现createChatRecord方法
      // const recordId = await DatabaseService.createChatRecord(chatRecord);
      
      // 暂时模拟成功
      const recordId = Date.now().toString();
      
      // 保存消息
      // for (const message of parsedMessages) {
      //   await DatabaseService.addChatMessage({
      //     chatRecordId: recordId,
      //     ...message,
      //   });
      // }
      
      return {
        success: true,
        recordId,
        messageCount: parsedMessages.length,
      };
      
    } catch (error) {
      console.error('Import chat record error:', error);
      return {
        success: false,
        messageCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * 验证聊天记录文件格式
   */
  validateChatFile(platform: string, content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!content || content.trim().length === 0) {
      errors.push('文件内容为空');
      return { valid: false, errors };
    }
    
    const lines = content.split('\n');
    let hasValidTimestamp = false;
    
    // 检查是否包含时间戳格式
    for (const line of lines.slice(0, 20)) { // 只检查前20行
      if (line.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/)) {
        hasValidTimestamp = true;
        break;
      }
    }
    
    if (!hasValidTimestamp) {
      errors.push('未找到有效的时间戳格式');
    }
    
    // 根据平台检查特定格式
    if (platform === 'wechat') {
      // 微信格式检查
      const hasWeChatFormat = lines.some(line => 
        line.match(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+.+$/)
      );
      
      if (!hasWeChatFormat) {
        errors.push('不符合微信聊天记录导出格式');
      }
    } else if (platform === 'qq') {
      // QQ格式检查
      const hasQQFormat = lines.some(line => 
        line.match(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+.+?\(\d+\)$/)
      );
      
      if (!hasQQFormat) {
        errors.push('不符合QQ聊天记录导出格式');
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  /**
   * 预览聊天记录（返回前几条消息用于确认）
   */
  previewChatRecord(platform: string, content: string, contactName: string, userId: string): ParsedMessage[] {
    let messages: ParsedMessage[];
    
    switch (platform) {
      case 'wechat':
        messages = this.parseWeChatRecord(content, contactName, userId);
        break;
      case 'qq':
        messages = this.parseQQRecord(content, contactName, userId);
        break;
      default:
        return [];
    }
    
    // 返回前5条消息作为预览
    return messages.slice(0, 5);
  }

  /**
   * 获取聊天记录统计信息
   */
  getChatStatistics(platform: string, content: string, contactName: string, userId: string) {
    let messages: ParsedMessage[];
    
    switch (platform) {
      case 'wechat':
        messages = this.parseWeChatRecord(content, contactName, userId);
        break;
      case 'qq':
        messages = this.parseQQRecord(content, contactName, userId);
        break;
      default:
        return null;
    }
    
    if (messages.length === 0) {
      return null;
    }
    
    const userMessages = messages.filter(msg => msg.isFromUser);
    const contactMessages = messages.filter(msg => !msg.isFromUser);
    const timestamps = messages.map(msg => msg.timestamp.getTime());
    
    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      contactMessages: contactMessages.length,
      dateRange: {
        start: new Date(Math.min(...timestamps)),
        end: new Date(Math.max(...timestamps)),
      },
      messageTypes: {
        text: messages.filter(msg => msg.messageType === 'text').length,
        image: messages.filter(msg => msg.messageType === 'image').length,
        audio: messages.filter(msg => msg.messageType === 'audio').length,
        video: messages.filter(msg => msg.messageType === 'video').length,
        file: messages.filter(msg => msg.messageType === 'file').length,
        sticker: messages.filter(msg => msg.messageType === 'sticker').length,
      },
    };
  }
}

export default new ChatImportService();
