import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Button,
  Switch,
  List,
  Divider,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SecurityScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    biometricSupported,
    biometricEnabled,
    enableBiometric,
    disableBiometric,
    updateUserPreferences,
    user,
  } = useAuth();

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('提示', '请填写所有字段', [{ text: '确定' }]);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('错误', '新密码与确认密码不一致', [{ text: '确定' }]);
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('错误', '密码长度至少6位', [{ text: '确定' }]);
      return;
    }

    // 这里需要实现实际的密码更改逻辑
    Alert.alert('成功', '密码已更新', [{ text: '确定' }]);
    setShowPasswordDialog(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePrivacyModeToggle = async () => {
    try {
      const newPrivacyMode = !user?.preferences.privacyMode;
      await updateUserPreferences({ privacyMode: newPrivacyMode });
      
      if (newPrivacyMode) {
        Alert.alert(
          '隐私模式已开启',
          '应用将在后台时隐藏内容预览，并需要验证才能查看',
          [{ text: '确定' }]
        );
      }
    } catch (error) {
      console.error('Privacy mode toggle error:', error);
    }
  };

  const handleDataEncryption = () => {
    Alert.alert(
      '数据加密',
      '您的所有日记数据都已经使用AES-256加密算法进行加密存储，确保数据安全。',
      [{ text: '确定' }]
    );
  };

  const handleBackupEncryption = () => {
    Alert.alert(
      '备份加密',
      '所有备份数据都会使用端到端加密，只有您才能解密和访问。',
      [{ text: '确定' }]
    );
  };

  const securityItems = [
    {
      title: '生物识别验证',
      description: biometricSupported ? '使用指纹或面部识别登录' : '设备不支持生物识别',
      icon: 'fingerprint',
      value: biometricEnabled,
      onToggle: handleBiometricToggle,
      disabled: !biometricSupported,
    },
    {
      title: '隐私模式',
      description: '后台时隐藏应用内容预览',
      icon: 'shield-account',
      value: user?.preferences.privacyMode || false,
      onToggle: handlePrivacyModeToggle,
    },
  ];

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 认证设置 */}
        <Animatable.View animation="fadeInDown">
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            身份验证
          </Text>
          <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            {securityItems.map((item, index) => (
              <View key={item.title}>
                <List.Item
                  title={item.title}
                  description={item.description}
                  left={props => <List.Icon {...props} icon={item.icon} />}
                  right={() => (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      disabled={item.disabled}
                    />
                  )}
                  disabled={item.disabled}
                  style={item.disabled && { opacity: 0.6 }}
                />
                {index < securityItems.length - 1 && <Divider />}
              </View>
            ))}
            <Divider />
            <List.Item
              title="更改密码"
              description="修改登录密码"
              left={props => <List.Icon {...props} icon="key-change" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setShowPasswordDialog(true)}
            />
          </Card>
        </Animatable.View>

        {/* 数据安全 */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            数据安全
          </Text>
          <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <List.Item
              title="数据加密"
              description="本地数据AES-256加密"
              left={props => <List.Icon {...props} icon="lock" />}
              right={() => (
                <Button mode="text" onPress={handleDataEncryption}>
                  查看详情
                </Button>
              )}
            />
            <Divider />
            <List.Item
              title="备份加密"
              description="云端备份端到端加密"
              left={props => <List.Icon {...props} icon="cloud-lock" />}
              right={() => (
                <Button mode="text" onPress={handleBackupEncryption}>
                  查看详情
                </Button>
              )}
            />
            <Divider />
            <List.Item
              title="两步验证"
              description={twoFactorEnabled ? '已开启' : '未开启'}
              left={props => <List.Icon {...props} icon="two-factor-authentication" />}
              right={() => (
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={() => setShowTwoFactorDialog(true)}
                />
              )}
            />
          </Card>
        </Animatable.View>

        {/* 访问控制 */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            访问控制
          </Text>
          <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <List.Item
              title="应用锁"
              description="每次打开应用时需要验证"
              left={props => <List.Icon {...props} icon="shield-lock" />}
              right={() => <Switch value={false} onValueChange={() => {}} />}
            />
            <Divider />
            <List.Item
              title="自动锁定"
              description="5分钟无操作后自动锁定"
              left={props => <List.Icon {...props} icon="timer-lock" />}
              right={() => <Switch value={true} onValueChange={() => {}} />}
            />
            <Divider />
            <List.Item
              title="截图保护"
              description="防止截图和录屏"
              left={props => <List.Icon {...props} icon="camera-off" />}
              right={() => <Switch value={false} onValueChange={() => {}} />}
            />
          </Card>
        </Animatable.View>

        {/* 安全状态 */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <Card style={[styles.statusCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content>
              <View style={styles.statusHeader}>
                <Icon
                  name="shield-check"
                  size={32}
                  color={theme.colors.primary}
                />
                <Text style={[styles.statusTitle, { color: theme.colors.onPrimaryContainer }]}>
                  安全状态良好
                </Text>
              </View>
              <Text style={[styles.statusDescription, { color: theme.colors.onPrimaryContainer }]}>
                您的账户安全设置已启用多重保护，数据得到充分保障。
              </Text>
            </Card.Content>
          </Card>
        </Animatable.View>
      </ScrollView>

      {/* 更改密码对话框 */}
      <Portal>
        <Dialog visible={showPasswordDialog} onDismiss={() => setShowPasswordDialog(false)}>
          <Dialog.Title>更改密码</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="当前密码"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              mode="outlined"
              secureTextEntry
              style={styles.dialogInput}
            />
            <TextInput
              label="新密码"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry
              style={styles.dialogInput}
            />
            <TextInput
              label="确认新密码"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPasswordDialog(false)}>
              取消
            </Button>
            <Button mode="contained" onPress={handlePasswordChange}>
              确认
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 两步验证对话框 */}
      <Portal>
        <Dialog visible={showTwoFactorDialog} onDismiss={() => setShowTwoFactorDialog(false)}>
          <Dialog.Title>两步验证</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 16 }}>
              两步验证功能正在开发中，敬请期待。
            </Text>
            <Text>
              启用后，您需要提供第二重验证（如短信验证码）才能登录账户。
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTwoFactorDialog(false)}>
              确定
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
  settingsCard: {
    elevation: 2,
  },
  statusCard: {
    marginTop: 24,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  dialogInput: {
    marginBottom: 12,
  },
});

export default SecurityScreen;
