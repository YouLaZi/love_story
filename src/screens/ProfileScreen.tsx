import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Surface,
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';

const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, updateUserPreferences } = useAuth();
  
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // 这里需要实现更新用户信息的逻辑
      Alert.alert('保存成功', '个人资料已更新', [{ text: '确定' }]);
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('保存失败', '请稍后重试', [{ text: '确定' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 头像 */}
        <Animatable.View animation="fadeInDown" style={styles.avatarSection}>
          <Card style={[styles.avatarCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.avatarContent}>
              {avatar ? (
                <Avatar.Image size={100} source={{ uri: avatar }} />
              ) : (
                <Avatar.Text 
                  size={100} 
                  label={username?.[0]?.toUpperCase() || 'U'}
                  style={{ backgroundColor: theme.colors.primary }}
                />
              )}
              <Button
                mode="outlined"
                onPress={pickAvatar}
                style={styles.changeAvatarButton}
              >
                更换头像
              </Button>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 基本信息 */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            基本信息
          </Text>
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <TextInput
                label="用户名"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="邮箱"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 统计信息 */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            统计信息
          </Text>
          <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                    0
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    日记总数
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>
                    0
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    使用天数
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* 保存按钮 */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading}
            style={styles.saveButton}
          >
            保存更改
          </Button>
        </Animatable.View>

        {/* 危险操作 */}
        <Animatable.View animation="fadeInUp" delay={800}>
          <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>
            危险操作
          </Text>
          <Card style={[styles.dangerCard, { backgroundColor: theme.colors.errorContainer }]}>
            <Card.Content>
              <Text style={[styles.dangerText, { color: theme.colors.onErrorContainer }]}>
                删除账户将永久删除所有数据，此操作无法撤销。
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowDeleteDialog(true)}
                style={[styles.deleteButton, { borderColor: theme.colors.error }]}
                labelStyle={{ color: theme.colors.error }}
              >
                删除账户
              </Button>
            </Card.Content>
          </Card>
        </Animatable.View>
      </ScrollView>

      {/* 删除确认对话框 */}
      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>确认删除账户</Dialog.Title>
          <Dialog.Content>
            <Text>此操作将永久删除您的账户和所有数据，包括：</Text>
            <Text style={{ marginTop: 8 }}>• 所有日记记录</Text>
            <Text>• 聊天记录导入</Text>
            <Text>• 个人设置和偏好</Text>
            <Text style={{ marginTop: 8, fontWeight: 'bold', color: theme.colors.error }}>
              此操作无法撤销！
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button
              onPress={() => {
                setShowDeleteDialog(false);
                Alert.alert('功能开发中', '账户删除功能正在开发中', [{ text: '确定' }]);
              }}
              textColor={theme.colors.error}
            >
              确认删除
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCard: {
    elevation: 4,
    width: '100%',
    maxWidth: 300,
  },
  avatarContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  changeAvatarButton: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 24,
  },
  infoCard: {
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  statsCard: {
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  saveButton: {
    marginTop: 32,
    paddingVertical: 8,
  },
  dangerCard: {
    elevation: 2,
  },
  dangerText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    alignSelf: 'flex-start',
  },
});

export default ProfileScreen;
