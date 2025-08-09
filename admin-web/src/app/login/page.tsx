'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

// 表单验证模式
const loginSchema = yup.object({
  email: yup
    .string()
    .email('请输入有效的邮箱地址')
    .required('邮箱不能为空'),
  password: yup
    .string()
    .min(6, '密码至少6位字符')
    .required('密码不能为空'),
});

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showError, showSuccess } = useNotification();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 表单处理
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 如果已登录，重定向到仪表板
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // 处理登录
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const success = await login(data.email, data.password);
      
      if (success) {
        showSuccess('登录成功', '欢迎回到Story4Love管理后台');
        router.replace('/dashboard');
      } else {
        showError('登录失败', '邮箱或密码错误，请重试');
        reset({ email: data.email, password: '' });
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('登录失败', '网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理忘记密码
  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  // 如果正在检查认证状态，显示加载页面
  if (authLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      px={2}
    >
      <Container maxWidth="sm">
        <Box mb={4} textAlign="center">
          <AdminPanelSettings
            sx={{
              fontSize: 64,
              color: 'primary.main',
              mb: 2,
            }}
          />
          <Typography variant="h3" component="h1" gutterBottom>
            Story4Love
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            管理后台
          </Typography>
          <Typography variant="body1" color="text.secondary">
            登录以管理恋爱日记应用
          </Typography>
        </Box>

        <Card elevation={4}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom textAlign="center">
              管理员登录
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="邮箱地址"
                    type="email"
                    autoComplete="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="密码"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!isValid || isLoading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  '登录'
                )}
              </Button>

              <Box textAlign="center">
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={handleForgotPassword}
                >
                  忘记密码？
                </Link>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                安全提示
              </Typography>
            </Divider>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>安全提醒：</strong>
                <br />
                • 请确保您在安全的网络环境中登录
                <br />
                • 不要在公共设备上保存登录信息
                <br />
                • 如发现异常登录活动，请立即联系系统管理员
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            © 2024 Story4Love Team. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
