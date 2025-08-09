import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Surface,
  Text,
  TextInput,
  Button,
  Card,
  IconButton,
  Divider,
  HelperText,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import * as Animatable from 'react-native-animatable';

const AuthScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    signIn,
    signUp,
    authenticateWithBiometric,
    biometricSupported,
    biometricEnabled,
    isLoading,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }

    if (isSignUp) {
      if (email && !/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = '请输入有效的邮箱地址';
      }

      if (password && password.length < 6) {
        newErrors.password = '密码至少需要6个字符';
      }

      if (password && confirmPassword && password !== confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let success = false;

      if (isSignUp) {
        success = await signUp(username, email || undefined, password || undefined);
        if (success) {
          Alert.alert('注册成功', '欢迎使用Story4Love！', [{ text: '确定' }]);
        } else {
          Alert.alert('注册失败', '请检查输入信息后重试', [{ text: '确定' }]);
        }
      } else {
        success = await signIn(username, password || undefined);
        if (!success) {
          Alert.alert('登录失败', '用户名或密码错误', [{ text: '确定' }]);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('操作失败', '请稍后重试', [{ text: '确定' }]);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const success = await authenticateWithBiometric();
      if (!success) {
        Alert.alert('认证失败', '生物识别验证失败', [{ text: '确定' }]);
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('认证失败', '生物识别不可用', [{ text: '确定' }]);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animatable.View animation="fadeInUp" delay={300} style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.primary }]}>
              Story4Love
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>
              {isSignUp ? '创建账户' : '欢迎回来'}
            </Text>
          </View>

          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <TextInput
                label="用户名"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                style={styles.input}
                error={!!errors.username}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <HelperText type="error" visible={!!errors.username}>
                {errors.username}
              </HelperText>

              {isSignUp && (
                <>
                  <TextInput
                    label="邮箱 (可选)"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email}
                  </HelperText>
                </>
              )}

              <TextInput
                label={isSignUp ? "密码 (可选)" : "密码 (可选)"}
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                error={!!errors.password}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>

              {isSignUp && (
                <>
                  <TextInput
                    label="确认密码"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.confirmPassword}
                    secureTextEntry={!showPassword}
                  />
                  <HelperText type="error" visible={!!errors.confirmPassword}>
                    {errors.confirmPassword}
                  </HelperText>
                </>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={isLoading}
                disabled={isLoading}
              >
                {isSignUp ? '注册' : '登录'}
              </Button>

              {biometricSupported && biometricEnabled && !isSignUp && (
                <>
                  <Divider style={styles.divider} />
                  <Button
                    mode="outlined"
                    onPress={handleBiometricAuth}
                    style={styles.button}
                    icon="fingerprint"
                    disabled={isLoading}
                  >
                    生物识别登录
                  </Button>
                </>
              )}

              <Divider style={styles.divider} />

              <Button
                mode="text"
                onPress={toggleAuthMode}
                disabled={isLoading}
              >
                {isSignUp ? '已有账户？立即登录' : '没有账户？立即注册'}
              </Button>
            </Card.Content>
          </Card>

          <Text style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
            您的隐私和数据安全是我们的首要关注
          </Text>
        </Animatable.View>
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  card: {
    elevation: 4,
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
  },
  divider: {
    marginVertical: 16,
  },
  note: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    opacity: 0.7,
  },
});

export default AuthScreen;
