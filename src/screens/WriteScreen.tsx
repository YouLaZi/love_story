import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Surface,
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  IconButton,
  Menu,
  Divider,
  Portal,
  Modal,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { DiaryEntry, EmotionType, Tag } from '../types';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import Voice from 'react-native-voice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

interface WriteScreenProps {
  route?: {
    params?: {
      entryId?: string;
    };
  };
}

const WriteScreen: React.FC<WriteScreenProps> = ({ route }) => {
  const { theme, emotionColors } = useTheme();
  const { user } = useAuth();
  const { databaseService } = useDatabase();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<EmotionType>('neutral');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showMoodMenu, setShowMoodMenu] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isLoading, setSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const isEditing = !!route?.params?.entryId;

  useEffect(() => {
    loadTags();
    if (isEditing) {
      loadEntry();
    }
    
    // 初始化语音识别
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const loadTags = async () => {
    if (!user) return;
    try {
      const tags = await databaseService.getTagsByUserId(user.id);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const loadEntry = async () => {
    // 这里需要实现加载现有日记条目的逻辑
    // const entry = await databaseService.getDiaryEntryById(route.params.entryId);
    // if (entry) {
    //   setTitle(entry.title);
    //   setContent(entry.content);
    //   setMood(entry.mood);
    //   setSelectedTags(entry.tags);
    //   setIsPrivate(entry.isPrivate);
    //   setLocation(entry.location || '');
    //   setWeather(entry.weather || '');
    // }
  };

  const onSpeechResults = (e: any) => {
    const results = e.value;
    if (results && results.length > 0) {
      const spokenText = results[0];
      setContent(prev => prev + spokenText);
    }
  };

  const onSpeechError = (e: any) => {
    console.error('Speech recognition error:', e);
    setIsRecording(false);
  };

  const startVoiceRecognition = async () => {
    try {
      setIsRecording(true);
      await Voice.start('zh-CN');
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsRecording(false);
      Alert.alert('语音识别', '启动语音识别失败', [{ text: '确定' }]);
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  };

  const startAudioRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('权限不足', '需要麦克风权限来录制语音', [{ text: '确定' }]);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('录音失败', '无法开始录音', [{ text: '确定' }]);
    }
  };

  const stopAudioRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const attachment = {
          type: 'audio',
          uri,
          fileName: `recording_${Date.now()}.m4a`,
          fileSize: 0, // 实际项目中需要获取文件大小
        };
        setAttachments(prev => [...prev, attachment]);
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const attachment = {
        type: 'image',
        uri: asset.uri,
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        fileSize: asset.fileSize || 0,
      };
      setAttachments(prev => [...prev, attachment]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const attachment = {
          type: 'document',
          uri: asset.uri,
          fileName: asset.name,
          fileSize: asset.size || 0,
        };
        setAttachments(prev => [...prev, attachment]);
      }
    } catch (error) {
      console.error('Document picker error:', error);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const createTag = async () => {
    if (!newTagName.trim() || !user) return;

    try {
      const tagData = {
        userId: user.id,
        name: newTagName.trim(),
        color: theme.colors.primary,
      };

      await databaseService.createTag(tagData);
      await loadTags();
      setSelectedTags(prev => [...prev, newTagName.trim()]);
      setNewTagName('');
      setShowTagModal(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
      Alert.alert('创建失败', '标签创建失败', [{ text: '确定' }]);
    }
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const saveEntry = async () => {
    if (!title.trim() || !content.trim() || !user) {
      Alert.alert('提示', '请填写标题和内容', [{ text: '确定' }]);
      return;
    }

    try {
      setSaving(true);

      const entryData = {
        userId: user.id,
        title: title.trim(),
        content: content.trim(),
        mood,
        tags: selectedTags,
        isPrivate,
        location: location.trim() || undefined,
        weather: weather.trim() || undefined,
        attachments: [],
      };

      if (isEditing) {
        // 更新现有条目
        // await databaseService.updateDiaryEntry(route.params.entryId, entryData);
      } else {
        // 创建新条目
        const entryId = await databaseService.createDiaryEntry(entryData);
        
        // 保存附件
        for (const attachment of attachments) {
          await databaseService.addAttachment({
            diaryEntryId: entryId,
            ...attachment,
          });
        }
      }

      Alert.alert(
        '保存成功',
        isEditing ? '日记已更新' : '日记已保存',
        [
          {
            text: '确定',
            onPress: () => {
              // 导航返回或清空表单
              if (!isEditing) {
                setTitle('');
                setContent('');
                setMood('neutral');
                setSelectedTags([]);
                setIsPrivate(false);
                setLocation('');
                setWeather('');
                setAttachments([]);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('保存失败', '请稍后重试', [{ text: '确定' }]);
    } finally {
      setSaving(false);
    }
  };

  const emotions: { emotion: EmotionType; label: string; icon: string }[] = [
    { emotion: 'happy', label: '开心', icon: 'emoticon-happy' },
    { emotion: 'excited', label: '兴奋', icon: 'emoticon-excited' },
    { emotion: 'loved', label: '被爱', icon: 'heart' },
    { emotion: 'grateful', label: '感恩', icon: 'hand-heart' },
    { emotion: 'peaceful', label: '平静', icon: 'meditation' },
    { emotion: 'sad', label: '难过', icon: 'emoticon-sad' },
    { emotion: 'angry', label: '愤怒', icon: 'emoticon-angry' },
    { emotion: 'frustrated', label: '沮丧', icon: 'emoticon-confused' },
    { emotion: 'anxious', label: '焦虑', icon: 'emoticon-neutral' },
    { emotion: 'confused', label: '困惑', icon: 'help-circle' },
    { emotion: 'neutral', label: '中性', icon: 'emoticon-neutral' },
    { emotion: 'mixed', label: '复杂', icon: 'emoticon-wink' },
  ];

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 标题输入 */}
          <Animatable.View animation="fadeInUp" delay={100}>
            <TextInput
              label="标题"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              placeholder="给这篇日记起个标题..."
            />
          </Animatable.View>

          {/* 心情选择 */}
          <Animatable.View animation="fadeInUp" delay={200}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              今天的心情
            </Text>
            <Menu
              visible={showMoodMenu}
              onDismiss={() => setShowMoodMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowMoodMenu(true)}
                  icon={() => (
                    <Icon
                      name={emotions.find(e => e.emotion === mood)?.icon || 'emoticon'}
                      size={20}
                      color={emotionColors[mood]}
                    />
                  )}
                  style={[styles.moodButton, { borderColor: emotionColors[mood] }]}
                  labelStyle={{ color: emotionColors[mood] }}
                >
                  {emotions.find(e => e.emotion === mood)?.label || '选择心情'}
                </Button>
              }
            >
              {emotions.map(({ emotion, label, icon }) => (
                <Menu.Item
                  key={emotion}
                  title={label}
                  onPress={() => {
                    setMood(emotion);
                    setShowMoodMenu(false);
                  }}
                  leadingIcon={() => (
                    <Icon name={icon} size={20} color={emotionColors[emotion]} />
                  )}
                />
              ))}
            </Menu>
          </Animatable.View>

          {/* 内容输入 */}
          <Animatable.View animation="fadeInUp" delay={300}>
            <View style={styles.contentContainer}>
              <TextInput
                label="内容"
                value={content}
                onChangeText={setContent}
                mode="outlined"
                multiline
                numberOfLines={10}
                style={styles.contentInput}
                placeholder="记录今天发生的美好..."
              />
              
              {/* 语音输入按钮 */}
              <View style={styles.voiceButtons}>
                <IconButton
                  icon={isRecording ? 'microphone' : 'microphone-outline'}
                  size={24}
                  iconColor={isRecording ? theme.colors.error : theme.colors.primary}
                  style={[
                    styles.voiceButton,
                    { backgroundColor: isRecording ? `${theme.colors.error}20` : `${theme.colors.primary}20` }
                  ]}
                  onPress={isRecording ? stopVoiceRecognition : startVoiceRecognition}
                />
                
                <IconButton
                  icon={recording ? 'stop' : 'record'}
                  size={24}
                  iconColor={recording ? theme.colors.error : theme.colors.secondary}
                  style={[
                    styles.voiceButton,
                    { backgroundColor: recording ? `${theme.colors.error}20` : `${theme.colors.secondary}20` }
                  ]}
                  onPress={recording ? stopAudioRecording : startAudioRecording}
                />
              </View>
            </View>
          </Animatable.View>

          {/* 附件 */}
          <Animatable.View animation="fadeInUp" delay={400}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              附件
            </Text>
            <View style={styles.attachmentButtons}>
              <Button
                mode="outlined"
                icon="image"
                onPress={pickImage}
                style={styles.attachmentButton}
              >
                图片
              </Button>
              <Button
                mode="outlined"
                icon="file"
                onPress={pickDocument}
                style={styles.attachmentButton}
              >
                文件
              </Button>
            </View>
            
            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((attachment, index) => (
                  <Card key={index} style={styles.attachmentCard}>
                    <Card.Content style={styles.attachmentContent}>
                      <Icon
                        name={
                          attachment.type === 'image' ? 'image' :
                          attachment.type === 'audio' ? 'music' : 'file'
                        }
                        size={24}
                        color={theme.colors.primary}
                      />
                      <Text style={[styles.attachmentName, { color: theme.colors.onSurface }]}>
                        {attachment.fileName}
                      </Text>
                      <IconButton
                        icon="close"
                        size={20}
                        onPress={() => removeAttachment(index)}
                      />
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </Animatable.View>

          {/* 标签 */}
          <Animatable.View animation="fadeInUp" delay={500}>
            <View style={styles.tagsHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                标签
              </Text>
              <Button
                mode="text"
                onPress={() => setShowTagModal(true)}
                compact
              >
                新建标签
              </Button>
            </View>
            
            <View style={styles.tagsContainer}>
              {availableTags.map(tag => (
                <Chip
                  key={tag.id}
                  selected={selectedTags.includes(tag.name)}
                  onPress={() => toggleTag(tag.name)}
                  style={[
                    styles.tag,
                    selectedTags.includes(tag.name) && { backgroundColor: `${tag.color}20` }
                  ]}
                  textStyle={selectedTags.includes(tag.name) ? { color: tag.color } : undefined}
                >
                  {tag.name}
                </Chip>
              ))}
            </View>
          </Animatable.View>

          {/* 附加信息 */}
          <Animatable.View animation="fadeInUp" delay={600}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              附加信息
            </Text>
            <TextInput
              label="地点 (可选)"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              style={styles.input}
              placeholder="在哪里发生的..."
            />
            <TextInput
              label="天气 (可选)"
              value={weather}
              onChangeText={setWeather}
              mode="outlined"
              style={styles.input}
              placeholder="今天的天气..."
            />
          </Animatable.View>

          {/* 隐私设置 */}
          <Animatable.View animation="fadeInUp" delay={700}>
            <Card style={styles.privacyCard}>
              <Card.Content style={styles.privacyContent}>
                <View style={styles.privacyInfo}>
                  <Icon
                    name={isPrivate ? 'lock' : 'lock-open'}
                    size={24}
                    color={theme.colors.primary}
                  />
                  <View style={styles.privacyText}>
                    <Text style={[styles.privacyTitle, { color: theme.colors.onSurface }]}>
                      私密日记
                    </Text>
                    <Text style={[styles.privacySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                      内容将被加密存储
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon={isPrivate ? 'toggle-switch' : 'toggle-switch-off-outline'}
                  size={32}
                  iconColor={isPrivate ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  onPress={() => setIsPrivate(!isPrivate)}
                />
              </Card.Content>
            </Card>
          </Animatable.View>

          {/* 保存按钮 */}
          <Animatable.View animation="fadeInUp" delay={800}>
            <Button
              mode="contained"
              onPress={saveEntry}
              loading={isLoading}
              disabled={isLoading}
              style={styles.saveButton}
            >
              {isEditing ? '更新日记' : '保存日记'}
            </Button>
          </Animatable.View>
        </ScrollView>

        {/* 新建标签模态框 */}
        <Portal>
          <Modal
            visible={showTagModal}
            onDismiss={() => setShowTagModal(false)}
            contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              新建标签
            </Text>
            <TextInput
              label="标签名称"
              value={newTagName}
              onChangeText={setNewTagName}
              mode="outlined"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="text"
                onPress={() => setShowTagModal(false)}
              >
                取消
              </Button>
              <Button
                mode="contained"
                onPress={createTag}
                disabled={!newTagName.trim()}
              >
                创建
              </Button>
            </View>
          </Modal>
        </Portal>
      </KeyboardAvoidingView>
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
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  moodButton: {
    marginBottom: 16,
  },
  contentContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  contentInput: {
    minHeight: 120,
  },
  voiceButtons: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  voiceButton: {
    margin: 0,
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  attachmentButton: {
    flex: 1,
  },
  attachmentsList: {
    gap: 8,
  },
  attachmentCard: {
    elevation: 1,
  },
  attachmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  attachmentName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    marginBottom: 4,
  },
  privacyCard: {
    marginBottom: 24,
    elevation: 2,
  },
  privacyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyText: {
    marginLeft: 12,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  privacySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  saveButton: {
    paddingVertical: 8,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});

export default WriteScreen;
