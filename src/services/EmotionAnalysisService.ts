import { DiaryEntry, EmotionType, EmotionStat, EmotionTrend, EmotionAnalysis } from '../types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays } from 'date-fns';

class EmotionAnalysisService {
  
  /**
   * 分析情感分布
   */
  analyzeEmotionDistribution(entries: DiaryEntry[]): EmotionStat[] {
    const emotionCounts: { [key in EmotionType]: number } = {
      happy: 0, excited: 0, loved: 0, grateful: 0, peaceful: 0,
      sad: 0, angry: 0, frustrated: 0, anxious: 0, confused: 0,
      neutral: 0, mixed: 0
    };

    // 统计各种情感出现次数
    entries.forEach(entry => {
      emotionCounts[entry.mood]++;
    });

    const total = entries.length;
    
    // 转换为统计对象并排序
    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion: emotion as EmotionType,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .filter(stat => stat.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 生成情感趋势
   */
  generateEmotionTrends(entries: DiaryEntry[]): EmotionTrend[] {
    const trendMap = new Map<string, EmotionTrend>();
    
    entries.forEach(entry => {
      const dateKey = startOfDay(entry.createdAt).toISOString();
      const existing = trendMap.get(dateKey);
      
      const intensity = this.getEmotionIntensity(entry.mood);
      
      if (existing) {
        // 如果同一天有多条记录，计算平均情感强度
        existing.intensity = (existing.intensity + intensity) / 2;
        // 使用最频繁的情感作为主导情感
        if (intensity > existing.intensity) {
          existing.emotion = entry.mood;
        }
      } else {
        trendMap.set(dateKey, {
          date: startOfDay(entry.createdAt),
          emotion: entry.mood,
          intensity
        });
      }
    });

    return Array.from(trendMap.values()).sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    );
  }

  /**
   * 获取情感强度
   */
  private getEmotionIntensity(emotion: EmotionType): number {
    const intensityMap: { [key in EmotionType]: number } = {
      happy: 85, excited: 95, loved: 90, grateful: 80, peaceful: 75,
      sad: 25, angry: 15, frustrated: 20, anxious: 30, confused: 35,
      neutral: 50, mixed: 40
    };
    return intensityMap[emotion];
  }

  /**
   * 判断情感是否积极
   */
  private isPositiveEmotion(emotion: EmotionType): boolean {
    const positiveEmotions: EmotionType[] = ['happy', 'excited', 'loved', 'grateful', 'peaceful'];
    return positiveEmotions.includes(emotion);
  }

  /**
   * 生成分析洞察
   */
  generateInsights(entries: DiaryEntry[], period: 'daily' | 'weekly' | 'monthly' | 'yearly'): string[] {
    const insights: string[] = [];
    
    if (entries.length === 0) {
      insights.push('本期间还没有记录，开始写日记来分析你的情感趋势吧！');
      return insights;
    }

    const emotionStats = this.analyzeEmotionDistribution(entries);
    const trends = this.generateEmotionTrends(entries);

    // 1. 分析最常见的情感
    if (emotionStats.length > 0) {
      const mostCommon = emotionStats[0];
      const emotionName = this.getEmotionDisplayName(mostCommon.emotion);
      insights.push(
        `你最常见的情感是"${emotionName}"，占比${mostCommon.percentage.toFixed(1)}%`
      );
    }

    // 2. 分析积极情感比例
    const positiveCount = emotionStats
      .filter(stat => this.isPositiveEmotion(stat.emotion))
      .reduce((sum, stat) => sum + stat.count, 0);
    
    const positiveRatio = (positiveCount / entries.length) * 100;
    
    if (positiveRatio >= 80) {
      insights.push('你的积极情感占比很高，继续保持这种乐观的心态！');
    } else if (positiveRatio >= 60) {
      insights.push('整体情感状态良好，生活中充满了正能量。');
    } else if (positiveRatio >= 40) {
      insights.push('情感状态基本平衡，可以多关注生活中的美好时刻。');
    } else {
      insights.push('建议多培养积极心态，寻找生活中的快乐源泉。');
    }

    // 3. 分析记录频率
    const { startDate, endDate } = this.getPeriodRange(period);
    const daysDiff = Math.max(1, differenceInDays(endDate, startDate));
    const avgFrequency = entries.length / daysDiff;
    
    if (avgFrequency >= 1) {
      insights.push('你的记录习惯很好，坚持每天记录有助于情感管理。');
    } else if (avgFrequency >= 0.5) {
      insights.push('记录频率不错，可以尝试更频繁地记录内心感受。');
    } else {
      insights.push('建议增加记录频率，这样能更好地追踪情感变化。');
    }

    // 4. 分析情感变化趋势
    if (trends.length >= 7) {
      const recentTrends = trends.slice(-7);
      const avgIntensity = recentTrends.reduce((sum, trend) => sum + trend.intensity, 0) / recentTrends.length;
      
      if (avgIntensity >= 70) {
        insights.push('最近一周情感状态积极向上，保持这种良好状态！');
      } else if (avgIntensity <= 40) {
        insights.push('最近情感波动较大，建议多进行一些放松活动。');
      } else {
        insights.push('情感状态相对稳定，继续关注内心变化。');
      }
    }

    // 5. 分析情感多样性
    const uniqueEmotions = emotionStats.length;
    if (uniqueEmotions >= 6) {
      insights.push('你的情感表达很丰富，能够细腻地感受不同的情绪变化。');
    } else if (uniqueEmotions <= 3) {
      insights.push('情感表达相对单一，可以尝试更细致地描述内心感受。');
    }

    // 6. 基于具体情感的建议
    const dominantEmotion = emotionStats[0]?.emotion;
    if (dominantEmotion) {
      const suggestion = this.getEmotionSuggestion(dominantEmotion);
      if (suggestion) {
        insights.push(suggestion);
      }
    }

    return insights;
  }

  /**
   * 获取情感显示名称
   */
  private getEmotionDisplayName(emotion: EmotionType): string {
    const emotionNames: { [key in EmotionType]: string } = {
      happy: '开心', excited: '兴奋', loved: '被爱', grateful: '感恩',
      peaceful: '平静', sad: '难过', angry: '愤怒', frustrated: '沮丧',
      anxious: '焦虑', confused: '困惑', neutral: '中性', mixed: '复杂'
    };
    return emotionNames[emotion];
  }

  /**
   * 根据主导情感提供建议
   */
  private getEmotionSuggestion(emotion: EmotionType): string | null {
    const suggestions: { [key in EmotionType]: string } = {
      happy: '快乐是最好的能量源泉，记得将这份快乐分享给身边的人。',
      excited: '兴奋的状态很棒，可以将这种热情投入到更多有意义的事情中。',
      loved: '被爱的感觉很珍贵，也要记得表达对他人的爱意。',
      grateful: '感恩的心态让生活更美好，继续保持这种积极的人生观。',
      peaceful: '内心平静是一种难得的状态，可以多进行冥想或瑜伽来维持。',
      sad: '难过是正常的情绪，允许自己感受并处理这些情感，适当寻求支持。',
      angry: '愤怒时建议先冷静下来，通过运动或深呼吸来释放负面情绪。',
      frustrated: '沮丧时可以尝试换个角度看问题，或者暂时放下重新审视。',
      anxious: '焦虑时建议进行放松训练，规律作息和适量运动也很有帮助。',
      confused: '困惑时不妨多思考或与信任的人交流，寻求不同的观点。',
      neutral: '平静的状态也很好，可以利用这个时机进行自我反思。',
      mixed: '复杂的情感很正常，试着将感受写下来帮助理清思路。'
    };
    
    return suggestions[emotion] || null;
  }

  /**
   * 获取时间段范围
   */
  private getPeriodRange(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): { startDate: Date; endDate: Date } {
    const now = new Date();
    
    switch (period) {
      case 'daily':
        return {
          startDate: startOfDay(now),
          endDate: endOfDay(now)
        };
      case 'weekly':
        return {
          startDate: startOfWeek(now),
          endDate: endOfWeek(now)
        };
      case 'monthly':
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now)
        };
      case 'yearly':
        return {
          startDate: startOfYear(now),
          endDate: endOfYear(now)
        };
    }
  }

  /**
   * 创建完整的情感分析报告
   */
  createAnalysisReport(
    entries: DiaryEntry[],
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    userId: string
  ): EmotionAnalysis {
    const { startDate, endDate } = this.getPeriodRange(period);
    
    return {
      id: Date.now().toString(),
      userId,
      period,
      startDate,
      endDate,
      emotions: this.analyzeEmotionDistribution(entries),
      trends: this.generateEmotionTrends(entries),
      insights: this.generateInsights(entries, period),
      createdAt: new Date()
    };
  }

  /**
   * 比较两个时期的情感状态
   */
  compareEmotionPeriods(currentEntries: DiaryEntry[], previousEntries: DiaryEntry[]): {
    currentStats: EmotionStat[];
    previousStats: EmotionStat[];
    changes: { emotion: EmotionType; change: number; trend: 'up' | 'down' | 'stable' }[];
  } {
    const currentStats = this.analyzeEmotionDistribution(currentEntries);
    const previousStats = this.analyzeEmotionDistribution(previousEntries);
    
    const changes: { emotion: EmotionType; change: number; trend: 'up' | 'down' | 'stable' }[] = [];
    
    // 比较各情感的变化
    currentStats.forEach(current => {
      const previous = previousStats.find(p => p.emotion === current.emotion);
      const previousPercentage = previous?.percentage || 0;
      const change = current.percentage - previousPercentage;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(change) > 5) { // 变化超过5%才认为有显著变化
        trend = change > 0 ? 'up' : 'down';
      }
      
      changes.push({
        emotion: current.emotion,
        change,
        trend
      });
    });
    
    return { currentStats, previousStats, changes };
  }

  /**
   * 获取情感健康评分
   */
  getEmotionHealthScore(entries: DiaryEntry[]): {
    score: number; // 0-100
    level: 'excellent' | 'good' | 'fair' | 'poor';
    factors: { name: string; score: number; weight: number }[];
  } {
    if (entries.length === 0) {
      return {
        score: 0,
        level: 'poor',
        factors: []
      };
    }

    const factors = [
      {
        name: '积极情感比例',
        score: this.calculatePositiveRatio(entries),
        weight: 0.4
      },
      {
        name: '情感稳定性',
        score: this.calculateEmotionStability(entries),
        weight: 0.3
      },
      {
        name: '情感多样性',
        score: this.calculateEmotionDiversity(entries),
        weight: 0.2
      },
      {
        name: '记录一致性',
        score: this.calculateRecordConsistency(entries),
        weight: 0.1
      }
    ];

    const totalScore = factors.reduce((sum, factor) => 
      sum + factor.score * factor.weight, 0
    );

    let level: 'excellent' | 'good' | 'fair' | 'poor';
    if (totalScore >= 80) level = 'excellent';
    else if (totalScore >= 65) level = 'good';
    else if (totalScore >= 50) level = 'fair';
    else level = 'poor';

    return {
      score: Math.round(totalScore),
      level,
      factors
    };
  }

  private calculatePositiveRatio(entries: DiaryEntry[]): number {
    const positiveCount = entries.filter(entry => 
      this.isPositiveEmotion(entry.mood)
    ).length;
    return (positiveCount / entries.length) * 100;
  }

  private calculateEmotionStability(entries: DiaryEntry[]): number {
    if (entries.length < 2) return 100;
    
    const intensities = entries.map(entry => this.getEmotionIntensity(entry.mood));
    const variance = this.calculateVariance(intensities);
    
    // 方差越小，稳定性越高
    return Math.max(0, 100 - variance);
  }

  private calculateEmotionDiversity(entries: DiaryEntry[]): number {
    const uniqueEmotions = new Set(entries.map(entry => entry.mood)).size;
    const maxEmotions = 12; // 总共12种情感
    return (uniqueEmotions / maxEmotions) * 100;
  }

  private calculateRecordConsistency(entries: DiaryEntry[]): number {
    if (entries.length < 7) return entries.length * 10; // 少于7条记录按比例给分
    
    // 计算记录的时间间隔一致性
    const intervals = [];
    for (let i = 1; i < entries.length; i++) {
      const interval = entries[i].createdAt.getTime() - entries[i-1].createdAt.getTime();
      intervals.push(interval);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = this.calculateVariance(intervals);
    
    // 间隔越规律，一致性越高
    const consistency = Math.max(0, 100 - (variance / avgInterval) * 100);
    return Math.min(100, consistency);
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }
}

export default new EmotionAnalysisService();
