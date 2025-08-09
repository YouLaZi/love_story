'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  Settings,
  Logout,
  Dashboard,
  People,
  Article,
  Analytics,
  Report,
  AdminPanelSettings,
  Security,
  Backup,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import NavigationItem from '@/components/NavigationItem';
import { NavigationItem as NavItem } from '@/types';

const DRAWER_WIDTH = 280;

// 导航菜单配置
const navigationItems: NavItem[] = [
  {
    key: 'dashboard',
    label: '仪表板',
    icon: 'Dashboard',
    path: '/dashboard',
  },
  {
    key: 'users',
    label: '用户管理',
    icon: 'People',
    path: '/dashboard/users',
    permissions: ['users:read'],
  },
  {
    key: 'content',
    label: '内容管理',
    icon: 'Article',
    path: '/dashboard/content',
    permissions: ['content:read'],
    children: [
      {
        key: 'diaries',
        label: '日记管理',
        icon: 'MenuBook',
        path: '/dashboard/content/diaries',
        permissions: ['diaries:read'],
      },
      {
        key: 'chat-records',
        label: '聊天记录',
        icon: 'Chat',
        path: '/dashboard/content/chat-records',
        permissions: ['chat_records:read'],
      },
      {
        key: 'reports',
        label: '举报处理',
        icon: 'Report',
        path: '/dashboard/content/reports',
        permissions: ['reports:read'],
      },
    ],
  },
  {
    key: 'analytics',
    label: '数据分析',
    icon: 'Analytics',
    path: '/dashboard/analytics',
    permissions: ['analytics:read'],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'Settings',
    path: '/dashboard/system',
    permissions: ['system:read'],
    children: [
      {
        key: 'admins',
        label: '管理员',
        icon: 'AdminPanelSettings',
        path: '/dashboard/system/admins',
        permissions: ['admins:read'],
      },
      {
        key: 'settings',
        label: '系统设置',
        icon: 'Settings',
        path: '/dashboard/system/settings',
        permissions: ['settings:read'],
      },
      {
        key: 'security',
        label: '安全设置',
        icon: 'Security',
        path: '/dashboard/system/security',
        permissions: ['security:read'],
      },
      {
        key: 'backup',
        label: '备份管理',
        icon: 'Backup',
        path: '/dashboard/system/backup',
        permissions: ['backup:read'],
      },
    ],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const router = useRouter();
  const { admin, logout, hasPermission } = useAuth();
  const { showSuccess } = useNotification();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3); // 模拟通知数量

  // 处理抽屉开关
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // 处理用户菜单
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  // 处理登出
  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    showSuccess('已安全退出', '感谢您的使用');
  };

  // 过滤有权限的导航项
  const filterNavigationItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      // 检查当前项的权限
      if (item.permissions && !item.permissions.some(permission => hasPermission(permission))) {
        return false;
      }
      
      // 递归过滤子项
      if (item.children) {
        item.children = filterNavigationItems(item.children);
        // 如果所有子项都被过滤掉，则隐藏父项
        if (item.children.length === 0) {
          return false;
        }
      }
      
      return true;
    });
  };

  const filteredNavigationItems = filterNavigationItems(navigationItems);

  // 抽屉内容
  const drawerContent = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" noWrap>
          Story4Love
        </Typography>
        <Typography variant="body2" color="text.secondary">
          管理后台
        </Typography>
      </Box>
      
      <List>
        {filteredNavigationItems.map((item) => (
          <NavigationItem
            key={item.key}
            item={item}
            onItemClick={() => {
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
          />
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* 顶部应用栏 */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { lg: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            管理后台
          </Typography>

          {/* 通知按钮 */}
          <Tooltip title="通知">
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={() => router.push('/dashboard/notifications')}
            >
              <Badge badgeContent={notificationCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* 用户菜单 */}
          <Tooltip title="账户设置">
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {admin?.avatar ? (
                <Avatar src={admin.avatar} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Tooltip>
          
          <Menu
            id="profile-menu"
            anchorEl={profileMenuAnchor}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/dashboard/profile'); }}>
              <AccountCircle sx={{ mr: 1 }} />
              个人资料
            </MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/dashboard/settings'); }}>
              <Settings sx={{ mr: 1 }} />
              设置
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              退出登录
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* 侧边导航抽屉 */}
      <Box
        component="nav"
        sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}
        aria-label="navigation menu"
      >
        {/* 移动端抽屉 */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // 更好的移动端性能
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* 桌面端抽屉 */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* 主内容区域 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar /> {/* 为固定的AppBar留出空间 */}
        {children}
      </Box>
    </Box>
  );
}
