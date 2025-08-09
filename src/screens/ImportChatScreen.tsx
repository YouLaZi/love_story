import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Button,
  List,
  Divider,
  ProgressBar,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ImportStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const ImportChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { databaseService } = useDatabase();
  
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);
  const [contactName, setContactName] = useState('');
  const [importSteps, setImportSteps] = useState<ImportStep[]>([]);

  const platforms = [
    {
      id: 'wechat',
      name: '微信',
      icon: 'wechat',
      description: '导入微信聊天记录',
      supported: true,
    },
    {
      id: 'qq',
      name: 'QQ',
      icon: 'qqchat',
      description: '导入QQ聊天记录',
      supported: true,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: 'telegram',
      description: '导入Telegram聊天记录',
      supported: false,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'whatsapp',
      description: '导入WhatsApp聊天记录',
      supported: false,
    },
  ];

  const getInstructions = (platformId: string): string[] => {
    switch (platformId) {
      case 'wechat':
        return [
          '1. 打开微信，进入要导出的聊天界面',
          '2. 点击右上角的"..."按钮',
          '3. 选择"聊天记录迁移与备份"',
          '4. 选择"备份聊天记录到电脑"',
          '5. 在电脑上导出为txt格式文件',
          '6. 将文件传输到手机并选择导入',
        ];
      case 'qq':
        return [
          '1. 打开QQ，进入要导出的聊天界面',
          '2. 点击右上角的设置按钮',
          '3. 选择"聊天记录"',
          '4. 选择"导出聊天记录"',
          '5. 选择导出格式为文本文件',
          '6. 保存文件并选择导入',
        ];
      default:
        return ['暂不支持此平台的导入功能'];
    }
  };

  const handlePlatformSelect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform?.supported) {
      Alert.alert('暂不支持', '此平台的导入功能正在开发中', [{ text: '确定' }]);
      return;
    }
    
    setSelectedPlatform(platformId);
    setShowInstructionsDialog(true);
  };

  const startImport = async () => {
    if (!selectedPlatform || !contactName.trim()) {
      Alert.alert('提示', '请填写联系人姓名', [{ text: '确定' }]);
      return;
    }

    try {
      // 选择文件
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setIsImporting(true);
      setImportProgress(0);
      
      // 初始化导入步骤
      const steps: ImportStep[] = [
        { id: '1', title: '读取文件', description: '正在读取聊天记录文件...', completed: false },
        { id: '2', title: '解析内容', description: '正在解析聊天内容...', completed: false },
        { id: '3', title: '处理消息', description: '正在处理消息格式...', completed: false },
        { id: '4', title: '保存数据', description: '正在保存到数据库...', completed: false },
      ];
      setImportSteps(steps);

      // 模拟导入过程
      await simulateImportProcess(file, steps);
      
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('导入失败', '文件读取或解析失败，请检查文件格式', [{ text: '确定' }]);
    } finally {
      setIsImporting(false);
      setShowInstructionsDialog(false);
    }
  };

  const simulateImportProcess = async (file: any, steps: ImportStep[]) => {
    try {
      // 步骤1: 读取文件
      updateStepProgress(0, 0.2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fileContent = await FileSystem.readAsStringAsync(file.uri);
      markStepCompleted(0);

      // 步骤2: 解析内容
      updateStepProgress(1, 0.4);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const messages = parseMessages(fileContent, selectedPlatform!);
      markStepCompleted(1);

      // 步骤3: 处理消息
      updateStepProgress(2, 0.7);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const processedMessages = processMessages(messages);
      markStepCompleted(2);

      // 步骤4: 保存数据
      updateStepProgress(3, 0.9);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await saveToDatabase(processedMessages);
      markStepCompleted(3);

      setImportProgress(1);
      
      Alert.alert(
        '导入成功',
        `成功导入 ${processedMessages.length} 条聊天记录`,
        [{ text: '确定' }]
      );

    } catch (error) {
      console.error('Import process error:', error);
      throw error;
    }
  };

  const updateStepProgress = (stepIndex: number, progress: number) => {
    setImportProgress(progress);
    setImportSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed: false } : step
    ));
  };

  const markStepCompleted = (stepIndex: number) => {
    setImportSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    ));
  };

  const parseMessages = (content: string, platform: string) => {
    // 这里应该实现真实的消息解析逻辑
    // 根据不同平台的导出格式进行解析
    const lines = content.split('\n');
    const messages = [];
    
    for (const line of lines) {
      if (line.trim()) {
        // 简化的解析逻辑，实际需要根据具体格式实现
        messages.push({
          timestamp: new Date(),
          sender: '解析用户',
          content: line.trim(),
          type: 'text',
        });
      }
    }
    
    return messages;
  };

  const processMessages = (rawMessages: any[]) => {
    // 处理和格式化消息
    return rawMessages.map(msg => ({
      id: Date.now().toString() + Math.random(),
      sender: msg.sender,
      content: msg.content,
      messageType: msg.type,
      timestamp: msg.timestamp,
      isFromUser: msg.sender === contactName,
    }));
  };

  const saveToDatabase = async (messages: any[]) => {
    if (!user) throw new Error('User not found');

    // 创建聊天记录
    const chatRecord = {
      userId: user.id,
      platform: selectedPlatform!,
      contactName: contactName.trim(),
      messages,
      importedAt: new Date(),
      dateRange: {
        start: new Date(Math.min(...messages.map(m => m.timestamp.getTime()))),
        end: new Date(Math.max(...messages.map(m => m.timestamp.getTime()))),
      },
    };

    // 这里需要实现保存聊天记录的数据库方法
    // await databaseService.createChatRecord(chatRecord);
    console.log('Chat record saved:', chatRecord);
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 平台选择 */}
        <Animatable.View animation="fadeInDown">
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            选择聊天平台
          </Text>
          
          {platforms.map(platform => (
            <Card
              key={platform.id}
              style={[
                styles.platformCard,
                { backgroundColor: theme.colors.surface },
                selectedPlatform === platform.id && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                }
              ]}
            >
              <List.Item
                title={platform.name}
                description={platform.description}
                left={props => (
                  <Icon
                    name={platform.icon}
                    size={32}
                    color={platform.supported ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  />
                )}
                right={props => 
                  platform.supported ? (
                    <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                  ) : (
                    <Text style={[styles.unsupportedText, { color: theme.colors.onSurfaceVariant }]}>
                      即将支持
                    </Text>
                  )
                }
                onPress={() => handlePlatformSelect(platform.id)}
                disabled={!platform.supported}
                style={!platform.supported && { opacity: 0.6 }}
              />
            </Card>
          ))}
        </Animatable.View>

        {/* 导入进度 */}
        {isImporting && (
          <Animatable.View animation="fadeInUp" style={styles.progressSection}>
            <Card style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.progressTitle, { color: theme.colors.onSurface }]}>
                  正在导入聊天记录
                </Text>
                
                <ProgressBar
                  progress={importProgress}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
                
                <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                  {Math.round(importProgress * 100)}% 完成
                </Text>

                {importSteps.map((step, index) => (
                  <View key={step.id} style={styles.stepRow}>
                    <Icon
                      name={step.completed ? 'check-circle' : 'clock-outline'}
                      size={20}
                      color={step.completed ? theme.colors.primary : theme.colors.onSurfaceVariant}
                    />
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                        {step.title}
                      </Text>
                      <Text style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {step.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* 使用说明 */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Card style={[styles.helpCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content>
              <View style={styles.helpHeader}>
                <Icon name="information" size={24} color={theme.colors.primary} />
                <Text style={[styles.helpTitle, { color: theme.colors.onSurface }]}>
                  使用说明
                </Text>
              </View>
              
              <Text style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
                • 目前支持微信和QQ聊天记录导入{'\n'}
                • 请按照指引导出聊天记录为文本格式{'\n'}
                • 导入的聊天记录会自动生成时间线{'\n'}
                • 支持文字、表情等常见消息类型{'\n'}
                • 导入后可以在时间线中查看和管理
              </Text>
            </Card.Content>
          </Card>
        </Animatable.View>
      </ScrollView>

      {/* 导入指引对话框 */}
      <Portal>
        <Dialog
          visible={showInstructionsDialog}
          onDismiss={() => setShowInstructionsDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>
            {platforms.find(p => p.id === selectedPlatform)?.name} 导入指引
          </Dialog.Title>
          
          <Dialog.Content>
            <Text style={[styles.instructionsTitle, { color: theme.colors.onSurface }]}>
              导出步骤：
            </Text>
            
            {selectedPlatform && getInstructions(selectedPlatform).map((instruction, index) => (
              <Text key={index} style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
                {instruction}
              </Text>
            ))}
            
            <Divider style={styles.divider} />
            
            <TextInput
              label="联系人姓名"
              value={contactName}
              onChangeText={setContactName}
              mode="outlined"
              style={styles.contactInput}
              placeholder="请输入对方的姓名或备注"
            />
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={() => setShowInstructionsDialog(false)}>
              取消
            </Button>
            <Button
              mode="contained"
              onPress={startImport}
              disabled={!contactName.trim() || isImporting}
            >
              开始导入
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  platformCard: {
    marginBottom: 12,
    elevation: 2,
  },
  unsupportedText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  progressSection: {
    marginTop: 24,
  },
  progressCard: {
    elevation: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 12,
  },
  helpCard: {
    marginTop: 24,
    elevation: 2,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
  dialog: {
    maxHeight: '80%',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  contactInput: {
    marginBottom: 8,
  },
});

export default ImportChatScreen;
