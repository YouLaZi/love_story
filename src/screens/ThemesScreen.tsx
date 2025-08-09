import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Surface,
  Text,
  Card,
  List,
  RadioButton,
  Divider,
} from 'react-native-paper';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ThemesScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode, emotionColors } = useTheme();

  const themeOptions: { mode: ThemeMode; title: string; description: string; icon: string }[] = [
    {
      mode: 'light',
      title: '浅色主题',
      description: '明亮清新的浅色界面',
      icon: 'weather-sunny',
    },
    {
      mode: 'dark',
      title: '深色主题',
      description: '护眼舒适的深色界面',
      icon: 'weather-night',
    },
    {
      mode: 'auto',
      title: '跟随系统',
      description: '根据系统设置自动切换',
      icon: 'theme-light-dark',
    },
  ];

  const colorPresets = [
    { name: '默认粉色', primary: '#FF6B9D', secondary: '#8E4EC6' },
    { name: '薄荷绿', primary: '#00D4AA', secondary: '#00A8CC' },
    { name: '天空蓝', primary: '#5DADE2', secondary: '#3498DB' },
    { name: '日落橙', primary: '#FF8A80', secondary: '#FF5722' },
    { name: '薰衣草紫', primary: '#B39DDB', secondary: '#9C27B0' },
    { name: '珊瑚红', primary: '#FF7043', secondary: '#E64A19' },
  ];

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 主题模式选择 */}
        <Animatable.View animation="fadeInDown">
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            主题模式
          </Text>
          <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <RadioButton.Group
              value={themeMode}
              onValueChange={(value) => setThemeMode(value as ThemeMode)}
            >
              {themeOptions.map((option, index) => (
                <View key={option.mode}>
                  <List.Item
                    title={option.title}
                    description={option.description}
                    left={() => (
                      <Icon
                        name={option.icon}
                        size={24}
                        color={theme.colors.primary}
                        style={styles.optionIcon}
                      />
                    )}
                    right={() => (
                      <RadioButton value={option.mode} />
                    )}
                    onPress={() => setThemeMode(option.mode)}
                  />
                  {index < themeOptions.length - 1 && <Divider />}
                </View>
              ))}
            </RadioButton.Group>
          </Card>
        </Animatable.View>

        {/* 主题颜色预览 */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            当前配色
          </Text>
          <Card style={[styles.previewCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.colorPreview}>
                <View style={styles.colorRow}>
                  <View style={[styles.colorDot, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.colorLabel, { color: theme.colors.onSurface }]}>
                    主色调
                  </Text>
                </View>
                <View style={styles.colorRow}>
                  <View style={[styles.colorDot, { backgroundColor: theme.colors.secondary }]} />
                  <Text style={[styles.colorLabel, { color: theme.colors.onSurface }]}>
                    辅助色
                  </Text>
                </View>
                <View style={styles.colorRow}>
                  <View style={[styles.colorDot, { backgroundColor: theme.colors.tertiary }]} />
                  <Text style={[styles.colorLabel, { color: theme.colors.onSurface }]}>
                    强调色
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 情感颜色预览 */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            情感配色
          </Text>
          <Card style={[styles.emotionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.emotionDescription, { color: theme.colors.onSurfaceVariant }]}>
                不同心情对应的颜色主题
              </Text>
              <View style={styles.emotionGrid}>
                {Object.entries(emotionColors).map(([emotion, color]) => (
                  <View key={emotion} style={styles.emotionItem}>
                    <View style={[styles.emotionDot, { backgroundColor: color }]} />
                    <Text style={[styles.emotionLabel, { color: theme.colors.onSurface }]}>
                      {getEmotionText(emotion)}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 色彩方案（预留） */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            色彩方案
          </Text>
          <Card style={[styles.presetsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content>
              <Text style={[styles.comingSoonText, { color: theme.colors.onSurfaceVariant }]}>
                🎨 更多色彩方案即将推出
              </Text>
              <Text style={[styles.comingSoonDescription, { color: theme.colors.onSurfaceVariant }]}>
                我们正在为您准备更多精美的色彩主题，敬请期待！
              </Text>
              
              {/* 预览色彩方案 */}
              <View style={styles.presetGrid}>
                {colorPresets.map((preset, index) => (
                  <View key={index} style={styles.presetItem}>
                    <View style={styles.presetColors}>
                      <View style={[styles.presetColor, { backgroundColor: preset.primary }]} />
                      <View style={[styles.presetColor, { backgroundColor: preset.secondary }]} />
                    </View>
                    <Text style={[styles.presetName, { color: theme.colors.onSurfaceVariant }]}>
                      {preset.name}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 主题设置说明 */}
        <Animatable.View animation="fadeInUp" delay={800}>
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content>
              <View style={styles.infoHeader}>
                <Icon
                  name="information"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.infoTitle, { color: theme.colors.onPrimaryContainer }]}>
                  主题说明
                </Text>
              </View>
              <Text style={[styles.infoText, { color: theme.colors.onPrimaryContainer }]}>
                • 浅色主题适合白天使用，界面明亮清晰{'\n'}
                • 深色主题适合夜间使用，减少眼部疲劳{'\n'}
                • 跟随系统会根据设备设置自动切换{'\n'}
                • 情感配色会在日记中自动应用对应颜色
              </Text>
            </Card.Content>
          </Card>
        </Animatable.View>
      </ScrollView>
    </Surface>
  );
};

const getEmotionText = (emotion: string): string => {
  const emotionMap: { [key: string]: string } = {
    happy: '开心', excited: '兴奋', loved: '被爱', grateful: '感恩',
    peaceful: '平静', sad: '难过', angry: '愤怒', frustrated: '沮丧',
    anxious: '焦虑', confused: '困惑', neutral: '中性', mixed: '复杂'
  };
  return emotionMap[emotion] || emotion;
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
  settingsCard: {
    elevation: 2,
  },
  optionIcon: {
    marginLeft: 8,
    marginRight: 8,
  },
  previewCard: {
    elevation: 2,
  },
  colorPreview: {
    gap: 12,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  colorLabel: {
    fontSize: 14,
  },
  emotionCard: {
    elevation: 2,
  },
  emotionDescription: {
    fontSize: 12,
    marginBottom: 16,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emotionItem: {
    alignItems: 'center',
    width: '22%',
    marginBottom: 12,
  },
  emotionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  presetsCard: {
    elevation: 2,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  comingSoonDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  presetItem: {
    alignItems: 'center',
    width: '30%',
  },
  presetColors: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  presetColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  presetName: {
    fontSize: 10,
    textAlign: 'center',
  },
  infoCard: {
    marginTop: 24,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ThemesScreen;
