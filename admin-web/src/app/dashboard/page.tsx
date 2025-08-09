'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  People,
  Article,
  TrendingUp,
  Warning,
  Refresh,
  Visibility,
  FileDownload,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { SystemStats, DashboardCard } from '@/types';
import { chartColors } from '@/utils/theme';

// 模拟数据
const mockSystemStats: SystemStats = {
  totalUsers: 12543,
  activeUsers: 8932,
  totalDiaryEntries: 89234,
  totalChatRecords: 45672,
  totalReports: 123,
  pendingReports: 15,
  storageUsed: 2.4, // GB
  dailyActiveUsers: 2341,
  weeklyActiveUsers: 6789,
  monthlyActiveUsers: 8932,
};

const userGrowthData = [
  { date: '01-01', users: 8000, active: 5000 },
  { date: '01-02', users: 8200, active: 5200 },
  { date: '01-03', users: 8500, active: 5500 },
  { date: '01-04', users: 8800, active: 5800 },
  { date: '01-05', users: 9100, active: 6100 },
  { date: '01-06', users: 9400, active: 6400 },
  { date: '01-07', users: 9700, active: 6700 },
];

const contentData = [
  { category: '开心', count: 12000, percentage: 35 },
  { category: '平静', count: 8000, percentage: 23 },
  { category: '感恩', count: 6000, percentage: 17 },
  { category: '兴奋', count: 4000, percentage: 12 },
  { category: '其他', count: 4500, percentage: 13 },
];

const platformData = [
  { platform: 'iOS', users: 7000, percentage: 56 },
  { platform: 'Android', users: 5500, percentage: 44 },
];

export default function DashboardPage() {
  const { admin } = useAuth();
  const { showInfo } = useNotification();
  const [stats, setStats] = useState<SystemStats>(mockSystemStats);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // 刷新数据
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockSystemStats);
      setLastRefresh(new Date());
      showInfo('数据已刷新');
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 仪表板卡片数据
  const dashboardCards: DashboardCard[] = [
    {
      id: 'total-users',
      title: '总用户数',
      value: stats.totalUsers.toLocaleString(),
      change: 12.5,
      changeType: 'increase',
      icon: 'People',
      color: 'primary',
      link: '/dashboard/users',
    },
    {
      id: 'active-users',
      title: '活跃用户',
      value: stats.activeUsers.toLocaleString(),
      change: 8.3,
      changeType: 'increase',
      icon: 'TrendingUp',
      color: 'success',
      link: '/dashboard/analytics',
    },
    {
      id: 'diary-entries',
      title: '日记条目',
      value: stats.totalDiaryEntries.toLocaleString(),
      change: 15.7,
      changeType: 'increase',
      icon: 'Article',
      color: 'info',
      link: '/dashboard/content/diaries',
    },
    {
      id: 'pending-reports',
      title: '待处理举报',
      value: stats.pendingReports.toString(),
      change: -25.0,
      changeType: 'decrease',
      icon: 'Warning',
      color: 'warning',
      link: '/dashboard/content/reports',
    },
  ];

  return (
    <Box>
      {/* 页面标题和操作 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            仪表板
          </Typography>
          <Typography variant="body1" color="text.secondary">
            欢迎回来，{admin?.username}！这里是您的管理概览。
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Tooltip title={`上次刷新: ${lastRefresh.toLocaleTimeString()}`}>
            <IconButton
              onClick={refreshData}
              disabled={isLoading}
              color="primary"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Button
            startIcon={<FileDownload />}
            variant="outlined"
            size="small"
          >
            导出报告
          </Button>
        </Box>
      </Box>

      {/* 加载进度条 */}
      {isLoading && (
        <Box mb={2}>
          <LinearProgress />
        </Box>
      )}

      {/* 统计卡片 */}
      <Grid container spacing={3} mb={4}>
        {dashboardCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.id}>
            <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => window.location.href = card.link || ''}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {card.value}
                    </Typography>
                    {card.change && (
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp
                          fontSize="small"
                          color={card.changeType === 'increase' ? 'success' : 'error'}
                        />
                        <Typography
                          variant="body2"
                          color={card.changeType === 'increase' ? 'success.main' : 'error.main'}
                          ml={0.5}
                        >
                          {card.change > 0 ? '+' : ''}{card.change}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box>
                    {card.icon === 'People' && <People fontSize="large" color="primary" />}
                    {card.icon === 'TrendingUp' && <TrendingUp fontSize="large" color="success" />}
                    {card.icon === 'Article' && <Article fontSize="large" color="info" />}
                    {card.icon === 'Warning' && <Warning fontSize="large" color="warning" />}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 图表区域 */}
      <Grid container spacing={3}>
        {/* 用户增长趋势 */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              用户增长趋势
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke={chartColors[0]}
                  fill={chartColors[0]}
                  fillOpacity={0.6}
                  name="总用户数"
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stackId="2"
                  stroke={chartColors[1]}
                  fill={chartColors[1]}
                  fillOpacity={0.6}
                  name="活跃用户数"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 平台分布 */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              平台分布
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ platform, percentage }) => `${platform} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="users"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 内容情感分布 */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              内容情感分布
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={contentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill={chartColors[2]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 系统状态 */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              系统状态
            </Typography>
            
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">存储使用</Typography>
                <Typography variant="body2">{stats.storageUsed} GB / 100 GB</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.storageUsed / 100) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                用户活跃度
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={`日活: ${stats.dailyActiveUsers.toLocaleString()}`}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={`周活: ${stats.weeklyActiveUsers.toLocaleString()}`}
                  color="secondary"
                  size="small"
                />
                <Chip
                  label={`月活: ${stats.monthlyActiveUsers.toLocaleString()}`}
                  color="info"
                  size="small"
                />
              </Box>
            </Box>

            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                待处理事项
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={`待审核举报: ${stats.pendingReports}`}
                  color={stats.pendingReports > 10 ? 'error' : 'warning'}
                  size="small"
                />
                <Chip
                  label={`总举报数: ${stats.totalReports}`}
                  color="default"
                  size="small"
                />
              </Box>
            </Box>

            <Box mt={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Visibility />}
                href="/dashboard/analytics"
              >
                查看详细分析
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
