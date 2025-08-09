import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Chip,
  FAB,
  Searchbar,
  Button,
  Menu,
  Divider,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { DiaryEntry, EmotionType } from '../types';
import { format, isSameDay, startOfYear, endOfYear } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface TimelineItem {
  type: 'entry' | 'date-separator';
  data: DiaryEntry | Date;
  id: string;
}

const TimelineScreen: React.FC = () => {
  const { theme, emotionColors } = useTheme();
  const { user } = useAuth();
  const { databaseService } = useDatabase();
  
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredItems, setFilteredItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<EmotionType | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 20;

  const loadEntries = async (pageNum: number = 1, append: boolean = false) => {
    if (!user) return;
    
    try {
      if (!append) setIsLoading(true);
      
      const offset = (pageNum - 1) * ITEMS_PER_PAGE;
      const newEntries = await databaseService.getDiaryEntries(
        user.id,
        ITEMS_PER_PAGE,
        offset
      );
      
      if (newEntries.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      
      const updatedEntries = append ? [...entries, ...newEntries] : newEntries;
      setEntries(updatedEntries);
      
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await loadEntries(1, false);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      await loadEntries(nextPage, true);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [user]);

  useEffect(() => {
    filterAndGroupEntries();
  }, [entries, searchQuery, selectedMood]);

  const filterAndGroupEntries = () => {
    let filtered = entries;

    // 按搜索词过滤
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 按心情过滤
    if (selectedMood) {
      filtered = filtered.filter(entry => entry.mood === selectedMood);
    }

    // 按日期分组
    const items: TimelineItem[] = [];
    let currentDate: Date | null = null;

    filtered.forEach((entry, index) => {
      const entryDate = new Date(entry.createdAt);
      
      if (!currentDate || !isSameDay(entryDate, currentDate)) {
        currentDate = entryDate;
        items.push({
          type: 'date-separator',
          data: entryDate,
          id: `date-${entryDate.toISOString()}`
        });
      }
      
      items.push({
        type: 'entry',
        data: entry,
        id: entry.id
      });
    });

    setFilteredItems(items);
  };

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
    const emotionMap: Record<EmotionType, string> = {
      happy: '开心', excited: '兴奋', loved: '被爱', grateful: '感恩',
      peaceful: '平静', sad: '难过', angry: '愤怒', frustrated: '沮丧',
      anxious: '焦虑', confused: '困惑', neutral: '中性', mixed: '复杂'
    };
    return emotionMap[emotion] || emotion;
  };

  const renderDateSeparator = (date: Date) => (
    <View style={styles.dateSeparator}>
      <Text style={[styles.dateText, { color: theme.colors.primary }]}>
        {format(date, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
      </Text>
      <Divider style={[styles.dateDivider, { backgroundColor: theme.colors.outline }]} />
    </View>
  );

  const renderEntry = (entry: DiaryEntry) => (
    <Animatable.View animation="fadeInUp" duration={300}>
      <Card style={[styles.entryCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.entryHeader}>
            <View style={styles.timelineMarker}>
              <View style={[styles.timelineDot, { backgroundColor: emotionColors[entry.mood] }]} />
              <View style={[styles.timelineLine, { backgroundColor: theme.colors.outline }]} />
            </View>
            
            <View style={styles.entryContent}>
              <View style={styles.entryTop}>
                <Text style={[styles.entryTime, { color: theme.colors.onSurfaceVariant }]}>
                  {format(entry.createdAt, 'HH:mm')}
                </Text>
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
                  compact
                >
                  {getEmotionText(entry.mood)}
                </Chip>
              </View>
              
              <Text style={[styles.entryTitle, { color: theme.colors.onSurface }]}>
                {entry.title}
              </Text>
              
              <Text
                style={[styles.entryText, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={3}
              >
                {entry.content}
              </Text>
              
              {entry.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {entry.tags.slice(0, 3).map((tag, index) => (
                    <Chip key={index} compact style={styles.tag}>
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
              
              {entry.attachments.length > 0 && (
                <View style={styles.attachmentsContainer}>
                  <Icon name="attachment" size={16} color={theme.colors.onSurfaceVariant} />
                  <Text style={[styles.attachmentText, { color: theme.colors.onSurfaceVariant }]}>
                    {entry.attachments.length} 个附件
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  const renderItem = ({ item }: { item: TimelineItem }) => {
    if (item.type === 'date-separator') {
      return renderDateSeparator(item.data as Date);
    } else {
      return renderEntry(item.data as DiaryEntry);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="timeline-clock-outline"
        size={64}
        color={theme.colors.onSurfaceVariant}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        {searchQuery || selectedMood ? '没有找到匹配的记录' : '还没有日记记录'}
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
        {searchQuery || selectedMood ? '尝试调整搜索条件' : '开始记录你的美好时光吧'}
      </Text>
    </View>
  );

  const emotions: EmotionType[] = [
    'happy', 'excited', 'loved', 'grateful', 'peaceful',
    'sad', 'angry', 'frustrated', 'anxious', 'confused', 'neutral', 'mixed'
  ];

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 搜索和筛选 */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="搜索日记..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
        />
        
        <Menu
          visible={showFilterMenu}
          onDismiss={() => setShowFilterMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowFilterMenu(true)}
              icon="filter"
              style={styles.filterButton}
            >
              筛选
            </Button>
          }
        >
          <Menu.Item
            title="全部心情"
            onPress={() => {
              setSelectedMood(null);
              setShowFilterMenu(false);
            }}
            leadingIcon={selectedMood === null ? 'check' : undefined}
          />
          <Divider />
          {emotions.map(emotion => (
            <Menu.Item
              key={emotion}
              title={getEmotionText(emotion)}
              onPress={() => {
                setSelectedMood(emotion);
                setShowFilterMenu(false);
              }}
              leadingIcon={selectedMood === emotion ? 'check' : getEmotionIcon(emotion)}
            />
          ))}
        </Menu>
      </View>

      {/* 时间线列表 */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* 写日记按钮 */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {}}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    elevation: 2,
  },
  filterButton: {
    minWidth: 80,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  dateSeparator: {
    marginVertical: 16,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateDivider: {
    width: '100%',
    height: 1,
  },
  entryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 4,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
  },
  entryContent: {
    flex: 1,
  },
  entryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  emotionChip: {
    height: 28,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  entryText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    height: 24,
  },
  moreTagsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  attachmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attachmentText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
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
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
});

export default TimelineScreen;
