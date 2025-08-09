import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Surface,
  Text,
  List,
  Switch,
  Button,
  Card,
  Avatar,
  Divider,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode, toggleTheme } = useTheme();
  const {
    user,
    signOut,
    biometricSupported,
    biometricEnabled,
    enableBiometric,
    disableBiometric,
    updateUserPreferences,
  } = useAuth();
  const navigation = useNavigation();

  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleBiometricToggle = async () => {
    try {
      if (biometricEnabled) {
        await disableBiometric();
        Alert.alert('已关闭', '生物识别验证已关闭', [{ text: '确定' }]);
      } else {
        const success = await enableBiometric();
        if (success) {
          Alert.alert('已开启', '生物识别验证已开启', [{ text: '确定' }]);
        } else {
          Alert.alert('开启失败', '无法开启生物识别验证', [{ text: '确定' }]);
        }
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      Alert.alert('操作失败', '请稍后重试', [{ text: '确定' }]);
    }
  };

  const handlePrivacyModeToggle = async () => {
    if (!user) return;
    
    try {
      const newPrivacyMode = !user.preferences.privacyMode;
      await updateUserPreferences({ privacyMode: newPrivacyMode });
      
      if (newPrivacyMode) {
        Alert.alert(
          '隐私模式已开启',
          '应用将在后台时隐藏内容预览',
          [{ text: '确定' }]
        );
      }
    } catch (error) {
      console.error('Privacy mode toggle error:', error);
    }
  };

  const handleAutoBackupToggle = async () => {
    if (!user) return;
    
    try {
      const newAutoBackup = !user.preferences.autoBackup;
      await updateUserPreferences({ autoBackup: newAutoBackup });
    } catch (error) {
      console.error('Auto backup toggle error:', error);
    }
  };

  const handleNotificationsToggle = async () => {
    if (!user) return;
    
    try {
      const newNotifications = !user.preferences.notificationsEnabled;
      await updateUserPreferences({ notificationsEnabled: newNotifications });
    } catch (error) {
      console.error('Notifications toggle error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowSignOutDialog(false);
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('退出失败', '请稍后重试', [{ text: '确定' }]);
    }
  };

  const getThemeText = () => {
    switch (themeMode) {
      case 'light': return '浅色主题';
      case 'dark': return '深色主题';
      case 'auto': return '跟随系统';
      default: return '跟随系统';
    }
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 用户信息 */}
        <Animatable.View animation="fadeInDown" style={styles.userSection}>
          <Card style={[styles.userCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content style={styles.userContent}>
              <Avatar.Text
                size={64}
                label={user?.username?.[0]?.toUpperCase() || 'U'}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.userInfo}>
                <Text style={[styles.username, { color: theme.colors.onPrimaryContainer }]}>
                  {user?.username || '用户'}
                </Text>
                <Text style={[styles.userEmail, { color: theme.colors.onPrimaryContainer }]}>
                  {user?.email || '未设置邮箱'}
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Profile' as never)}
                style={[styles.editButton, { borderColor: theme.colors.primary }]}
                labelStyle={{ color: theme.colors.primary }}
              >
                编辑
              </Button>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 安全设置 */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            安全与隐私
          </Text>
          <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <List.Item
              title="生物识别验证"
              description={biometricSupported ? "使用指纹或面部识别登录" : "设备不支持生物识别"}
              left={props => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  disabled={!biometricSupported}
                />
              )}
            />
            <Divider />
            <List.Item
              title="隐私模式"
              description="后台时隐藏应用内容预览"
              left={props => <List.Icon {...props} icon="shield-account" />}
              right={() => (
                <Switch
                  value={user?.preferences.privacyMode || false}
                  onValueChange={handlePrivacyModeToggle}
                />
              )}
            />
            <Divider />
            <List.Item
              title="安全设置"
              description="密码、两步验证等"
              left={props => <List.Icon {...props} icon="security" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Security' as never)}
            />
          </Card>
        </Animatable.View>

        {/* 外观设置 */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            外观设置
          </Text>
          <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <List.Item
              title="主题模式"
              description={getThemeText()}
              left={props => <List.Icon {...props} icon="palette" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Themes' as never)}
            />
            <Divider />
            <List.Item
              title="字体大小"
              description={
                user?.preferences.fontSize === 'small' ? '小' :
                user?.preferences.fontSize === 'large' ? '大' : '中'
              }
              left={props => <List.Icon {...props} icon="format-size" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card>
        </Animatable.View>

        {/* 数据管理 */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            数据管理
          </Text>
          <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <List.Item
              title="自动备份"
              description="定期自动备份数据到云端"
              left={props => <List.Icon {...props} icon="backup-restore" />}
              right={() => (
                <Switch
                  value={user?.preferences.autoBackup || false}
                  onValueChange={handleAutoBackupToggle}
                />
              )}
            />
            <Divider />
            <List.Item
              title="导出数据"
              description="导出日记和聊天记录"
              left={props => <List.Icon {...props} icon="export" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Export' as never)}
            />
            <Divider />
            <List.Item
              title="导入聊天记录"
              description="从微信、QQ等导入聊天记录"
              left={props => <List.Icon {...props} icon="import" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('ImportChat' as never)}
            />
          </Card>
        </Animatable.View>

        {/* 通知设置 */}
        <Animatable.View animation="fadeInUp" delay={800}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            通知设置
          </Text>
          <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <List.Item
              title="推送通知"
              description="接收日记提醒和重要更新"
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={user?.preferences.notificationsEnabled || false}
                  onValueChange={handleNotificationsToggle}
                />
              )}
            />
            <Divider />
            <List.Item
              title="每日提醒"
              description="设置每日写日记提醒时间"
              left={props => <List.Icon {...props} icon="clock-alert" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card>
        </Animatable.View>

        {/* 关于和帮助 */}
        <Animatable.View animation="fadeInUp" delay={1000}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            关于和帮助
          </Text>
          <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <List.Item
              title="使用帮助"
              description="查看使用教程和常见问题"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="意见反馈"
              description="向我们反馈问题和建议"
              left={props => <List.Icon {...props} icon="message-text" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="关于应用"
              description="版本信息和开发团队"
              left={props => <List.Icon {...props} icon="information" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card>
        </Animatable.View>

        {/* 退出登录 */}
        <Animatable.View animation="fadeInUp" delay={1200}>
          <Button
            mode="outlined"
            onPress={() => setShowSignOutDialog(true)}
            style={[styles.signOutButton, { borderColor: theme.colors.error }]}
            labelStyle={{ color: theme.colors.error }}
            icon="logout"
          >
            退出登录
          </Button>
        </Animatable.View>

        {/* 版本信息 */}
        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>
            Story4Love v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* 退出登录确认对话框 */}
      <Portal>
        <Dialog visible={showSignOutDialog} onDismiss={() => setShowSignOutDialog(false)}>
          <Dialog.Title>确认退出</Dialog.Title>
          <Dialog.Content>
            <Text>确定要退出当前账户吗？</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSignOutDialog(false)}>
              取消
            </Button>
            <Button onPress={handleSignOut} textColor={theme.colors.error}>
              退出
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
    paddingBottom: 32,
  },
  userSection: {
    padding: 16,
  },
  userCard: {
    elevation: 4,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.8,
  },
  editButton: {
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.6,
  },
});

export default SettingsScreen;
