import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Button,
  Chip,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { DiaryEntry, EmotionType, EmotionStat, EmotionTrend } from '../types';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');
const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: '#ffffff',
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(255, 107, 157, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
};

type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

const AnalysisScreen: React.FC = () => {
  const { theme, emotionColors } = useTheme();
  const { user } = useAuth();
  const { databaseService } = useDatabase();
  
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [emotionStats, setEmotionStats] = useState<EmotionStat[]>([]);
  const [emotionTrends, setEmotionTrends] = useState<EmotionTrend[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const periodOptions = [
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'quarter', label: '本季度' },
    { value: 'year', label: '本年' },
  ];

  useEffect(() => {
    loadData();
  }, [user, selectedPeriod]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // 获取指定时间范围的日记
      const { startDate, endDate } = getDateRange(selectedPeriod);
      const allEntries = await databaseService.getDiaryEntries(user.id);
      
      const filteredEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      setEntries(filteredEntries);
      
      // 分析情感数据
      analyzeEmotions(filteredEntries);
      generateTrends(filteredEntries);
      generateInsights(filteredEntries);
      
    } catch (error) {
      console.error('Failed to load analysis data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = (period: TimePeriod) => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case 'quarter':
        startDate = subMonths(now, 3);
        break;
      case 'year':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 1);
    }
    
    return {
      startDate: startOfDay(startDate),
      endDate: endOfDay(now)
    };
  };

  const analyzeEmotions = (entries: DiaryEntry[]) => {
    const emotionCounts: { [key in EmotionType]: number } = {
      happy: 0, excited: 0, loved: 0, grateful: 0, peaceful: 0,
      sad: 0, angry: 0, frustrated: 0, anxious: 0, confused: 0,
      neutral: 0, mixed: 0
    };

    entries.forEach(entry => {
      emotionCounts[entry.mood]++;
    });

    const total = entries.length;
    const stats: EmotionStat[] = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion: emotion as EmotionType,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .filter(stat => stat.count > 0)
      .sort((a, b) => b.count - a.count);

    setEmotionStats(stats);
  };

  const generateTrends = (entries: DiaryEntry[]) => {
    const trendMap = new Map<string, EmotionTrend>();
    
    entries.forEach(entry => {
      const dateKey = format(entry.createdAt, 'yyyy-MM-dd');
      const existing = trendMap.get(dateKey);
      
      if (existing) {
        // 如果同一天有多条记录，计算平均情感强度
        const newIntensity = getEmotionIntensity(entry.mood);
        existing.intensity = (existing.intensity + newIntensity) / 2;
      } else {
        trendMap.set(dateKey, {
          date: new Date(entry.createdAt),
          emotion: entry.mood,
          intensity: getEmotionIntensity(entry.mood)
        });
      }
    });

    const trends = Array.from(trendMap.values()).sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    );
    
    setEmotionTrends(trends);
  };

  const getEmotionIntensity = (emotion: EmotionType): number => {
    const intensityMap: { [key in EmotionType]: number } = {
      happy: 80, excited: 90, loved: 85, grateful: 75, peaceful: 70,
      sad: 30, angry: 20, frustrated: 25, anxious: 35, confused: 40,
      neutral: 50, mixed: 45
    };
    return intensityMap[emotion];
  };

  const generateInsights = (entries: DiaryEntry[]) => {
    const insights: string[] = [];
    
    if (entries.length === 0) {
      insights.push('本期间还没有记录，开始写日记来分析你的情感趋势吧！');
      setInsights(insights);
      return;
    }

    // 分析最常见的情感
    const mostCommonEmotion = emotionStats[0];
    if (mostCommonEmotion) {
      const emotionNames: { [key in EmotionType]: string } = {
        happy: '开心', excited: '兴奋', loved: '被爱', grateful: '感恩',
        peaceful: '平静', sad: '难过', angry: '愤怒', frustrated: '沮丧',
        anxious: '焦虑', confused: '困惑', neutral: '中性', mixed: '复杂'
      };
      
      insights.push(
        `你最常见的情感是"${emotionNames[mostCommonEmotion.emotion]}"，占比${mostCommonEmotion.percentage.toFixed(1)}%`
      );
    }

    // 分析记录频率
    const { startDate, endDate } = getDateRange(selectedPeriod);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const avgFrequency = entries.length / daysDiff;
    
    if (avgFrequency >= 1) {
      insights.push('你的记录习惯很好，保持每天记录的节奏！');
    } else if (avgFrequency >= 0.5) {
      insights.push('记录频率不错，可以尝试更频繁地记录生活点滴。');
    } else {
      insights.push('建议增加记录频率，这样能更好地追踪情感变化。');
    }

    // 分析积极情感比例
    const positiveEmotions: EmotionType[] = ['happy', 'excited', 'loved', 'grateful', 'peaceful'];
    const positiveCount = emotionStats
      .filter(stat => positiveEmotions.includes(stat.emotion))
      .reduce((sum, stat) => sum + stat.count, 0);
    
    const positiveRatio = (positiveCount / entries.length) * 100;
    
    if (positiveRatio >= 70) {
      insights.push('你的积极情感占比很高，继续保持乐观的心态！');
    } else if (positiveRatio >= 50) {
      insights.push('整体情感状态良好，注意平衡工作和生活。');
    } else {
      insights.push('建议多关注生活中的美好时刻，培养积极心态。');
    }

    setInsights(insights);
  };

  const getEmotionText = (emotion: EmotionType): string => {
    const emotionMap: { [key in EmotionType]: string } = {
      happy: '开心', excited: '兴奋', loved: '被爱', grateful: '感恩',
      peaceful: '平静', sad: '难过', angry: '愤怒', frustrated: '沮丧',
      anxious: '焦虑', confused: '困惑', neutral: '中性', mixed: '复杂'
    };
    return emotionMap[emotion];
  };

  const renderEmotionDistribution = () => {
    if (emotionStats.length === 0) return null;

    const pieData = emotionStats.slice(0, 6).map((stat, index) => ({
      name: getEmotionText(stat.emotion),
      population: stat.count,
      color: emotionColors[stat.emotion],
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    }));

    return (
      <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
            情感分布
          </Text>
          <PieChart
            data={pieData}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </Card.Content>
      </Card>
    );
  };

  const renderEmotionTrends = () => {
    if (emotionTrends.length < 2) return null;

    const labels = emotionTrends.map(trend => 
      format(trend.date, 'MM/dd')
    );
    
    const data = emotionTrends.map(trend => trend.intensity);

    const chartData = {
      labels: labels.slice(-7), // 显示最近7个数据点
      datasets: [{
        data: data.slice(-7),
        color: (opacity = 1) => `rgba(255, 107, 157, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
            情感趋势
          </Text>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 107, 157, ${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderEmotionStats = () => (
    <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
          情感统计
        </Text>
        {emotionStats.slice(0, 5).map((stat, index) => (
          <View key={stat.emotion} style={styles.statRow}>
            <View style={styles.statInfo}>
              <Icon
                name={getEmotionIcon(stat.emotion)}
                size={20}
                color={emotionColors[stat.emotion]}
              />
              <Text style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                {getEmotionText(stat.emotion)}
              </Text>
            </View>
            <View style={styles.statValues}>
              <Text style={[styles.statCount, { color: theme.colors.onSurface }]}>
                {stat.count}次
              </Text>
              <Text style={[styles.statPercentage, { color: theme.colors.onSurfaceVariant }]}>
                {stat.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const getEmotionIcon = (emotion: EmotionType): string => {
    switch (emotion) {
      case 'happy': return 'emoticon-happy';
      case 'excited': return 'emoticon-excited';
      case 'loved': return 'heart';
      case 'grateful': return 'hand-heart';
      case 'peaceful': return 'meditation';
      case 'sad': return 'emoticon-sad';
      case 'angry': return 'emoticon-angry';
      case 'frustrated': return 'emoticon-confused';
      case 'anxious': return 'emoticon-neutral';
      case 'confused': return 'help-circle';
      case 'neutral': return 'emoticon-neutral';
      case 'mixed': return 'emoticon-wink';
      default: return 'emoticon';
    }
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 时间段选择 */}
        <Animatable.View animation="fadeInDown" style={styles.periodSelector}>
          <SegmentedButtons
            value={selectedPeriod}
            onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}
            buttons={periodOptions}
            style={styles.segmentedButtons}
          />
        </Animatable.View>

        {/* 概览卡片 */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Card style={[styles.overviewCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content>
              <Text style={[styles.overviewTitle, { color: theme.colors.onPrimaryContainer }]}>
                {periodOptions.find(p => p.value === selectedPeriod)?.label}分析报告
              </Text>
              <Text style={[styles.overviewSubtitle, { color: theme.colors.onPrimaryContainer }]}>
                共记录 {entries.length} 篇日记
              </Text>
              
              {entries.length > 0 && emotionStats[0] && (
                <View style={styles.overviewEmotion}>
                  <Icon
                    name={getEmotionIcon(emotionStats[0].emotion)}
                    size={24}
                    color={emotionColors[emotionStats[0].emotion]}
                  />
                  <Text style={[styles.overviewEmotionText, { color: theme.colors.onPrimaryContainer }]}>
                    主要情感: {getEmotionText(emotionStats[0].emotion)}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {entries.length > 0 ? (
          <>
            {/* 情感分布图 */}
            <Animatable.View animation="fadeInUp" delay={400}>
              {renderEmotionDistribution()}
            </Animatable.View>

            {/* 情感趋势图 */}
            <Animatable.View animation="fadeInUp" delay={600}>
              {renderEmotionTrends()}
            </Animatable.View>

            {/* 详细统计 */}
            <Animatable.View animation="fadeInUp" delay={800}>
              {renderEmotionStats()}
            </Animatable.View>

            {/* 分析洞察 */}
            <Animatable.View animation="fadeInUp" delay={1000}>
              <Card style={[styles.insightsCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
                    分析洞察
                  </Text>
                  {insights.map((insight, index) => (
                    <View key={index} style={styles.insightRow}>
                      <Icon
                        name="lightbulb-outline"
                        size={20}
                        color={theme.colors.secondary}
                      />
                      <Text style={[styles.insightText, { color: theme.colors.onSurface }]}>
                        {insight}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            </Animatable.View>
          </>
        ) : (
          <Animatable.View animation="fadeInUp" delay={400}>
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content style={styles.emptyContent}>
                <Icon
                  name="chart-line-variant"
                  size={64}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.emptyIcon}
                />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  还没有足够的数据进行分析
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                  开始记录日记，追踪你的情感变化
                </Text>
                <Button
                  mode="contained"
                  style={styles.startButton}
                  onPress={() => {}}
                >
                  开始写作
                </Button>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  periodSelector: {
    padding: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  overviewCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  overviewEmotion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewEmotionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statValues: {
    alignItems: 'flex-end',
  },
  statCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statPercentage: {
    fontSize: 12,
  },
  insightsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    marginHorizontal: 16,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  startButton: {
    paddingHorizontal: 24,
  },
});

export default AnalysisScreen;
