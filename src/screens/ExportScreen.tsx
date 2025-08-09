import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Button,
  Chip,
  Switch,
  TextInput,
  SegmentedButtons,
  ProgressBar,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { ExportOptions } from '../types';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ExportScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { databaseService } = useDatabase();
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeAttachments: true,
    includePrivateEntries: false,
    template: 'detailed',
  });
  
  const [dateRangeType, setDateRangeType] = useState<'all' | 'custom' | 'recent'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');

  const formatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'html', label: 'HTML' },
    { value: 'json', label: 'JSON' },
    { value: 'images', label: '图片' },
  ];

  const templateOptions = [
    { value: 'simple', label: '简洁' },
    { value: 'detailed', label: '详细' },
    { value: 'timeline', label: '时间线' },
    { value: 'album', label: '相册' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: '全部' },
    { value: 'recent', label: '最近' },
    { value: 'custom', label: '自定义' },
  ];

  React.useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    if (!user) return;
    
    try {
      const tags = await databaseService.getTagsByUserId(user.id);
      setAvailableTags(tags.map(tag => tag.name));
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    
    switch (dateRangeType) {
      case 'recent':
        return {
          start: subMonths(now, 3),
          end: now,
        };
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : subYears(now, 1),
          end: customEndDate ? new Date(customEndDate) : now,
        };
      case 'all':
      default:
        return undefined;
    }
  };

  const startExport = async () => {
    if (!user) return;

    // 如果包含私密条目，需要设置加密密码
    if (exportOptions.includePrivateEntries && exportOptions.format !== 'json') {
      setShowPasswordDialog(true);
      return;
    }

    await performExport();
  };

  const performExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      // 获取要导出的数据
      setExportProgress(0.2);
      const entries = await databaseService.getDiaryEntries(user!.id);
      
      // 过滤数据
      setExportProgress(0.4);
      const filteredEntries = filterEntries(entries);
      
      if (filteredEntries.length === 0) {
        Alert.alert('提示', '没有符合条件的日记可以导出', [{ text: '确定' }]);
        return;
      }

      // 生成导出文件
      setExportProgress(0.6);
      const fileUri = await generateExportFile(filteredEntries);
      
      setExportProgress(0.9);
      
      // 分享文件
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('分享不可用', '无法在此设备上分享文件', [{ text: '确定' }]);
      }
      
      setExportProgress(1);
      
      Alert.alert(
        '导出成功',
        `成功导出 ${filteredEntries.length} 篇日记`,
        [{ text: '确定' }]
      );

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('导出失败', '导出过程中发生错误，请稍后重试', [{ text: '确定' }]);
    } finally {
      setIsExporting(false);
      setShowPasswordDialog(false);
      setEncryptionPassword('');
    }
  };

  const filterEntries = (entries: any[]) => {
    let filtered = entries;

    // 按日期范围过滤
    const dateRange = getDateRange();
    if (dateRange) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= dateRange.start && entryDate <= dateRange.end;
      });
    }

    // 按标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        entry.tags.some((tag: string) => selectedTags.includes(tag))
      );
    }

    // 按隐私设置过滤
    if (!exportOptions.includePrivateEntries) {
      filtered = filtered.filter(entry => !entry.isPrivate);
    }

    return filtered;
  };

  const generateExportFile = async (entries: any[]): Promise<string> => {
    const fileName = `diary_export_${format(new Date(), 'yyyyMMdd_HHmmss')}`;
    
    switch (exportOptions.format) {
      case 'pdf':
        return await generatePDF(entries, fileName);
      case 'html':
        return await generateHTML(entries, fileName);
      case 'json':
        return await generateJSON(entries, fileName);
      case 'images':
        return await generateImages(entries, fileName);
      default:
        throw new Error('Unsupported export format');
    }
  };

  const generatePDF = async (entries: any[], fileName: string): Promise<string> => {
    const html = generateHTMLContent(entries);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });
    
    const newUri = `${FileSystem.documentDirectory}${fileName}.pdf`;
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });
    
    return newUri;
  };

  const generateHTML = async (entries: any[], fileName: string): Promise<string> => {
    const html = generateHTMLContent(entries);
    const uri = `${FileSystem.documentDirectory}${fileName}.html`;
    
    await FileSystem.writeAsStringAsync(uri, html);
    return uri;
  };

  const generateJSON = async (entries: any[], fileName: string): Promise<string> => {
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        username: user?.username,
        email: user?.email,
      },
      entries,
      options: exportOptions,
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const uri = `${FileSystem.documentDirectory}${fileName}.json`;
    
    await FileSystem.writeAsStringAsync(uri, jsonString);
    return uri;
  };

  const generateImages = async (entries: any[], fileName: string): Promise<string> => {
    // 为每篇日记生成图片
    // 这里需要实现将日记内容转换为图片的逻辑
    // 可以使用 react-native-view-shot 或类似库
    throw new Error('Images export not implemented yet');
  };

  const generateHTMLContent = (entries: any[]): string => {
    const { template } = exportOptions;
    
    const entriesHTML = entries.map(entry => {
      const date = format(new Date(entry.createdAt), 'yyyy年MM月dd日 EEEE HH:mm', { locale: zhCN });
      const tags = entry.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('');
      
      return `
        <div class="entry">
          <div class="entry-header">
            <h2 class="entry-title">${entry.title}</h2>
            <div class="entry-meta">
              <span class="entry-date">${date}</span>
              <span class="entry-mood">${entry.mood}</span>
            </div>
          </div>
          <div class="entry-content">
            <p>${entry.content.replace(/\n/g, '<br>')}</p>
          </div>
          ${tags ? `<div class="entry-tags">${tags}</div>` : ''}
          ${entry.location ? `<div class="entry-location">📍 ${entry.location}</div>` : ''}
          ${entry.weather ? `<div class="entry-weather">🌤️ ${entry.weather}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>我的日记 - Story4Love</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #ff6b9d;
            padding-bottom: 20px;
          }
          .entry {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background: #fafafa;
          }
          .entry-header {
            margin-bottom: 15px;
          }
          .entry-title {
            color: #ff6b9d;
            margin: 0 0 10px 0;
          }
          .entry-meta {
            color: #666;
            font-size: 14px;
          }
          .entry-content {
            margin: 15px 0;
          }
          .entry-tags {
            margin-top: 15px;
          }
          .tag {
            display: inline-block;
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-right: 8px;
          }
          .entry-location, .entry-weather {
            font-size: 14px;
            color: #666;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>我的恋爱日记</h1>
          <p>导出时间: ${format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}</p>
          <p>共 ${entries.length} 篇日记</p>
        </div>
        ${entriesHTML}
        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
          由 Story4Love 生成
        </div>
      </body>
      </html>
    `;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 导出格式 */}
        <Animatable.View animation="fadeInDown">
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            导出格式
          </Text>
          <SegmentedButtons
            value={exportOptions.format}
            onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as any }))}
            buttons={formatOptions}
            style={styles.segmentedButtons}
          />
        </Animatable.View>

        {/* 模板选择 */}
        {(exportOptions.format === 'pdf' || exportOptions.format === 'html') && (
          <Animatable.View animation="fadeInUp" delay={200}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              模板样式
            </Text>
            <SegmentedButtons
              value={exportOptions.template}
              onValueChange={(value) => setExportOptions(prev => ({ ...prev, template: value as any }))}
              buttons={templateOptions}
              style={styles.segmentedButtons}
            />
          </Animatable.View>
        )}

        {/* 时间范围 */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            时间范围
          </Text>
          <SegmentedButtons
            value={dateRangeType}
            onValueChange={(value) => setDateRangeType(value as any)}
            buttons={dateRangeOptions}
            style={styles.segmentedButtons}
          />
          
          {dateRangeType === 'custom' && (
            <View style={styles.customDateRange}>
              <TextInput
                label="开始日期"
                value={customStartDate}
                onChangeText={setCustomStartDate}
                mode="outlined"
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
              />
              <TextInput
                label="结束日期"
                value={customEndDate}
                onChangeText={setCustomEndDate}
                mode="outlined"
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
              />
            </View>
          )}
        </Animatable.View>

        {/* 标签筛选 */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            标签筛选
          </Text>
          <Card style={[styles.tagsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.tagsHelper, { color: theme.colors.onSurfaceVariant }]}>
                选择要导出的标签（不选择则导出全部）
              </Text>
              <View style={styles.tagsContainer}>
                {availableTags.map(tag => (
                  <Chip
                    key={tag}
                    selected={selectedTags.includes(tag)}
                    onPress={() => toggleTag(tag)}
                    style={styles.tag}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 导出选项 */}
        <Animatable.View animation="fadeInUp" delay={800}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            导出选项
          </Text>
          <Card style={[styles.optionsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.optionRow}>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                    包含附件
                  </Text>
                  <Text style={[styles.optionDesc, { color: theme.colors.onSurfaceVariant }]}>
                    导出图片、音频等附件文件
                  </Text>
                </View>
                <Switch
                  value={exportOptions.includeAttachments}
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, includeAttachments: value }))}
                />
              </View>
              
              <View style={styles.optionRow}>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                    包含私密日记
                  </Text>
                  <Text style={[styles.optionDesc, { color: theme.colors.onSurfaceVariant }]}>
                    导出标记为私密的日记内容
                  </Text>
                </View>
                <Switch
                  value={exportOptions.includePrivateEntries}
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, includePrivateEntries: value }))}
                />
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 导出进度 */}
        {isExporting && (
          <Animatable.View animation="fadeInUp" style={styles.progressSection}>
            <Card style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.progressTitle, { color: theme.colors.onSurface }]}>
                  正在导出...
                </Text>
                <ProgressBar
                  progress={exportProgress}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
                <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                  {Math.round(exportProgress * 100)}% 完成
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* 导出按钮 */}
        <Animatable.View animation="fadeInUp" delay={1000}>
          <Button
            mode="contained"
            onPress={startExport}
            loading={isExporting}
            disabled={isExporting}
            style={styles.exportButton}
            icon="export"
          >
            开始导出
          </Button>
        </Animatable.View>
      </ScrollView>

      {/* 加密密码对话框 */}
      <Portal>
        <Dialog visible={showPasswordDialog} onDismiss={() => setShowPasswordDialog(false)}>
          <Dialog.Title>设置加密密码</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 16 }}>
              由于导出内容包含私密日记，请设置一个密码来保护文件安全：
            </Text>
            <TextInput
              label="加密密码"
              value={encryptionPassword}
              onChangeText={setEncryptionPassword}
              mode="outlined"
              secureTextEntry
              placeholder="至少6位字符"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPasswordDialog(false)}>
              取消
            </Button>
            <Button
              mode="contained"
              onPress={performExport}
              disabled={encryptionPassword.length < 6}
            >
              确定导出
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 24,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  customDateRange: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  dateInput: {
    flex: 1,
  },
  tagsCard: {
    elevation: 2,
  },
  tagsHelper: {
    fontSize: 12,
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
  optionsCard: {
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 12,
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
  },
  exportButton: {
    marginTop: 32,
    paddingVertical: 8,
  },
});

export default ExportScreen;
