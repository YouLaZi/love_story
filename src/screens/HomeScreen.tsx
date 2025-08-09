import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Button,
  IconButton,
  Chip,
  Avatar,
  Divider,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { DiaryEntry, EmotionType } from '../types';
import { format, isToday, isYesterday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen: React.FC = () => {
  const { theme, emotionColors } = useTheme();
  const { user } = useAuth();
  const { databaseService } = useDatabase();
  const [recentEntries, setRecentEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecentEntries = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const entries = await databaseService.getDiaryEntries(user.id, 5);
      setRecentEntries(entries);
    } catch (error) {
      console.error('Failed to load recent entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentEntries();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRecentEntries();
  }, [user]);

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

  const getEmotionText = (emotion: EmotionType): string => {
    switch (emotion) {
      case 'happy': return '开心';
      case 'excited': return '兴奋';
      case 'loved': return '被爱';
      case 'grateful': return '感恩';
      case 'peaceful': return '平静';
      case 'sad': return '难过';
      case 'angry': return '愤怒';
      case 'frustrated': return '沮丧';
      case 'anxious': return '焦虑';
      case 'confused': return '困惑';
      case 'neutral': return '中性';
      case 'mixed': return '复杂';
      default: return emotion;
    }
  };

  const formatDate = (date: Date): string => {
    if (isToday(date)) {
      return '今天';
    } else if (isYesterday(date)) {
      return '昨天';
    } else {
      return format(date, 'MM月dd日', { locale: zhCN });
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 问候语和用户信息 */}
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar.Text 
              size={48} 
              label={user?.username?.[0]?.toUpperCase() || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.userText}>
              <Text style={[styles.greeting, { color: theme.colors.onSurface }]}>
                {getGreeting()}，{user?.username || '用户'}
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                今天想记录些什么呢？
              </Text>
            </View>
          </View>
        </Animatable.View>

        {/* 快速操作 */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            快速开始
          </Text>
          <View style={styles.quickActions}>
            <Card style={[styles.actionCard, { backgroundColor: theme.colors.primaryContainer }]}>
              <Card.Content style={styles.actionContent}>
                <Icon name="pencil-plus" size={32} color={theme.colors.primary} />
                <Text style={[styles.actionText, { color: theme.colors.onPrimaryContainer }]}>
                  写日记
                </Text>
              </Card.Content>
            </Card>
            
            <Card style={[styles.actionCard, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Card.Content style={styles.actionContent}>
                <Icon name="import" size={32} color={theme.colors.secondary} />
                <Text style={[styles.actionText, { color: theme.colors.onSecondaryContainer }]}>
                  导入聊天
                </Text>
              </Card.Content>
            </Card>
          </View>
        </Animatable.View>

        {/* 最近的日记 */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              最近的记录
            </Text>
            <Button mode="text" compact onPress={() => {}}>
              查看全部
            </Button>
          </View>

          {recentEntries.length > 0 ? (
            recentEntries.map((entry, index) => (
              <Animatable.View
                key={entry.id}
                animation="fadeInUp"
                delay={600 + index * 100}
              >
                <Card style={[styles.entryCard, { backgroundColor: theme.colors.surface }]}>
                  <Card.Content>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryInfo}>
                        <Text style={[styles.entryTitle, { color: theme.colors.onSurface }]}>
                          {entry.title}
                        </Text>
                        <Text style={[styles.entryDate, { color: theme.colors.onSurfaceVariant }]}>
                          {formatDate(entry.createdAt)}
                        </Text>
                      </View>
                      <Chip
                        icon={() => (
                          <Icon
                            name={getEmotionIcon(entry.mood)}
                            size={16}
                            color={emotionColors[entry.mood]}
                          />
                        )}
                        style={[
                          styles.emotionChip,
                          { backgroundColor: `${emotionColors[entry.mood]}20` }
                        ]}
                        textStyle={{ color: emotionColors[entry.mood] }}
                      >
                        {getEmotionText(entry.mood)}
                      </Chip>
                    </View>
                    
                    <Text
                      style={[styles.entryContent, { color: theme.colors.onSurfaceVariant }]}
                      numberOfLines={2}
                    >
                      {entry.content}
                    </Text>
                    
                    {entry.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {entry.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Chip key={tagIndex} compact style={styles.tag}>
                            {tag}
                          </Chip>
                        ))}
                        {entry.tags.length > 3 && (
                          <Text style={[styles.moreTagsText, { color: theme.colors.onSurfaceVariant }]}>
                            +{entry.tags.length - 3}
                          </Text>
                        )}
                      </View>
                    )}
                  </Card.Content>
                </Card>
              </Animatable.View>
            ))
          ) : (
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content style={styles.emptyContent}>
                <Icon
                  name="book-open-page-variant"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.emptyIcon}
                />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  还没有日记记录
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                  开始记录你的美好时光吧
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
          )}
        </Animatable.View>

        {/* 今日统计 */}
        <Animatable.View animation="fadeInUp" delay={800} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            今日统计
          </Text>
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statContent}>
                <Icon name="book" size={24} color={theme.colors.primary} />
                <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
                  {recentEntries.filter(entry => isToday(entry.createdAt)).length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  今日记录
                </Text>
              </Card.Content>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statContent}>
                <Icon name="heart" size={24} color={theme.colors.secondary} />
                <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
                  {recentEntries.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  总记录
                </Text>
              </Card.Content>
            </Card>
          </View>
        </Animatable.View>
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
  header: {
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 16,
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    elevation: 2,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionText: {
    marginTop: 8,
    fontWeight: '500',
  },
  entryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryInfo: {
    flex: 1,
    marginRight: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
  },
  emotionChip: {
    height: 28,
  },
  entryContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    height: 24,
  },
  moreTagsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyCard: {
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  startButton: {
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
  },
});

export default HomeScreen;
