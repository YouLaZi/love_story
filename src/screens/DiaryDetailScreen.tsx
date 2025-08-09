import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Chip,
  IconButton,
  Button,
  Menu,
  Divider,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { DiaryEntry, EmotionType } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface DiaryDetailScreenProps {
  route: {
    params: {
      entryId: string;
    };
  };
  navigation: any;
}

const DiaryDetailScreen: React.FC<DiaryDetailScreenProps> = ({ route, navigation }) => {
  const { entryId } = route.params;
  const { theme, emotionColors } = useTheme();
  const { databaseService } = useDatabase();
  
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    try {
      setIsLoading(true);
      // 这里需要实现根据ID获取日记条目的方法
      // const entryData = await databaseService.getDiaryEntryById(entryId);
      // setEntry(entryData);
      
      // 临时数据用于演示
      setEntry({
        id: entryId,
        userId: 'user1',
        title: '美好的一天',
        content: '今天是个非常美好的一天，阳光明媚，心情也格外好。和朋友一起去公园散步，看到了很多美丽的花朵。晚上在家里做了喜欢的菜，感觉生活真的很美好。',
        mood: 'happy',
        tags: ['散步', '朋友', '美食', '阳光'],
        attachments: [],
        isPrivate: false,
        location: '中央公园',
        weather: '晴朗',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to load diary entry:', error);
      Alert.alert('加载失败', '无法加载日记内容', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    navigation.navigate('WriteEntry', { entryId });
  };

  const handleShare = async () => {
    if (!entry) return;
    
    setShowMenu(false);
    
    try {
      const shareContent = `${entry.title}\n\n${entry.content}\n\n📅 ${format(entry.createdAt, 'yyyy年MM月dd日', { locale: zhCN })}\n💝 Story4Love`;
      
      await Share.share({
        message: shareContent,
        title: entry.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    
    try {
      await databaseService.deleteDiaryEntry(entry.id);
      setShowDeleteDialog(false);
      
      Alert.alert('删除成功', '日记已删除', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('删除失败', '请稍后重试', [{ text: '确定' }]);
    }
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
    const emotionMap: { [key in EmotionType]: string } = {
      happy: '开心', excited: '兴奋', loved: '被爱', grateful: '感恩',
      peaceful: '平静', sad: '难过', angry: '愤怒', frustrated: '沮丧',
      anxious: '焦虑', confused: '困惑', neutral: '中性', mixed: '复杂'
    };
    return emotionMap[emotion];
  };

  if (isLoading) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            加载中...
          </Text>
        </View>
      </Surface>
    );
  }

  if (!entry) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Icon
            name="book-remove"
            size={64}
            color={theme.colors.onSurfaceVariant}
            style={styles.errorIcon}
          />
          <Text style={[styles.errorText, { color: theme.colors.onSurfaceVariant }]}>
            日记不存在或已被删除
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            返回
          </Button>
        </View>
      </Surface>
    );
  }

  // 设置导航栏右侧按钮
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => setShowMenu(true)}
            />
          }
        >
          <Menu.Item
            leadingIcon="pencil"
            title="编辑"
            onPress={handleEdit}
          />
          <Menu.Item
            leadingIcon="share"
            title="分享"
            onPress={handleShare}
          />
          <Divider />
          <Menu.Item
            leadingIcon="delete"
            title="删除"
            titleStyle={{ color: theme.colors.error }}
            onPress={() => {
              setShowMenu(false);
              setShowDeleteDialog(true);
            }}
          />
        </Menu>
      ),
    });
  }, [navigation, showMenu, theme.colors.error]);

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 标题和基本信息 */}
        <Animatable.View animation="fadeInDown" style={styles.headerSection}>
          <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                {entry.title}
              </Text>
              
              <View style={styles.metaInfo}>
                <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                  {format(entry.createdAt, 'yyyy年MM月dd日 EEEE HH:mm', { locale: zhCN })}
                </Text>
                
                {entry.isPrivate && (
                  <Chip
                    icon="lock"
                    style={[styles.privateChip, { backgroundColor: `${theme.colors.error}20` }]}
                    textStyle={{ color: theme.colors.error }}
                    compact
                  >
                    私密
                  </Chip>
                )}
              </View>

              <View style={styles.emotionSection}>
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
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 内容 */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Card style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.content, { color: theme.colors.onSurface }]}>
                {entry.content}
              </Text>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 标签 */}
        {entry.tags.length > 0 && (
          <Animatable.View animation="fadeInUp" delay={400}>
            <Card style={[styles.tagsCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  标签
                </Text>
                <View style={styles.tagsContainer}>
                  {entry.tags.map((tag, index) => (
                    <Chip key={index} style={styles.tag}>
                      {tag}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* 附加信息 */}
        {(entry.location || entry.weather) && (
          <Animatable.View animation="fadeInUp" delay={600}>
            <Card style={[styles.additionalCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  附加信息
                </Text>
                
                {entry.location && (
                  <View style={styles.infoRow}>
                    <Icon name="map-marker" size={20} color={theme.colors.primary} />
                    <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
                      {entry.location}
                    </Text>
                  </View>
                )}
                
                {entry.weather && (
                  <View style={styles.infoRow}>
                    <Icon name="weather-partly-cloudy" size={20} color={theme.colors.primary} />
                    <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
                      {entry.weather}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* 附件 */}
        {entry.attachments.length > 0 && (
          <Animatable.View animation="fadeInUp" delay={800}>
            <Card style={[styles.attachmentsCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  附件 ({entry.attachments.length})
                </Text>
                
                {entry.attachments.map((attachment, index) => (
                  <View key={attachment.id} style={styles.attachmentRow}>
                    <Icon
                      name={
                        attachment.type === 'image' ? 'image' :
                        attachment.type === 'video' ? 'video' :
                        attachment.type === 'audio' ? 'music' : 'file'
                      }
                      size={24}
                      color={theme.colors.primary}
                    />
                    <Text style={[styles.attachmentName, { color: theme.colors.onSurface }]}>
                      {attachment.fileName}
                    </Text>
                    <IconButton
                      icon="download"
                      size={20}
                      onPress={() => {}}
                    />
                  </View>
                ))}
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* 操作按钮 */}
        <Animatable.View animation="fadeInUp" delay={1000} style={styles.actionsSection}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={handleEdit}
            style={styles.actionButton}
          >
            编辑日记
          </Button>
          
          <Button
            mode="outlined"
            icon="share"
            onPress={handleShare}
            style={styles.actionButton}
          >
            分享日记
          </Button>
        </Animatable.View>
      </ScrollView>

      {/* 删除确认对话框 */}
      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除这篇日记吗？删除后无法恢复。</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button onPress={handleDelete} textColor={theme.colors.error}>
              删除
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
  },
  headerSection: {
    marginBottom: 16,
  },
  headerCard: {
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
  },
  privateChip: {
    height: 28,
  },
  emotionSection: {
    alignItems: 'flex-start',
  },
  emotionChip: {
    height: 32,
  },
  contentCard: {
    marginBottom: 16,
    elevation: 2,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginBottom: 4,
  },
  additionalCard: {
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
  },
  attachmentsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
  },
  actionsSection: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 8,
  },
});

export default DiaryDetailScreen;
