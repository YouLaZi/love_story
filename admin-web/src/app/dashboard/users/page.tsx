'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Visibility,
  MoreVert,
  Download,
  Upload,
  Refresh,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { User, UserStats } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 模拟用户数据
const mockUsers: User[] = Array.from({ length: 100 }, (_, index) => ({
  id: `user_${index + 1}`,
  username: `用户${index + 1}`,
  email: `user${index + 1}@example.com`,
  avatar: index % 3 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}` : undefined,
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  isActive: Math.random() > 0.2,
  lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
  preferences: {
    theme: ['light', 'dark', 'auto'][Math.floor(Math.random() * 3)] as any,
    fontSize: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as any,
    biometricEnabled: Math.random() > 0.5,
    autoBackup: Math.random() > 0.3,
    privacyMode: Math.random() > 0.7,
    notificationsEnabled: Math.random() > 0.2,
  },
  stats: {
    totalEntries: Math.floor(Math.random() * 100),
    totalChatRecords: Math.floor(Math.random() * 20),
    totalTags: Math.floor(Math.random() * 30),
    lastActiveAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    avgEntriesPerWeek: Math.floor(Math.random() * 10),
    favoriteEmotion: ['happy', 'sad', 'excited', 'peaceful'][Math.floor(Math.random() * 4)] as any,
  },
}));

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  // 状态管理
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 权限检查
  const canEdit = hasPermission('users:update');
  const canDelete = hasPermission('users:delete');
  const canView = hasPermission('users:read');

  // 过滤和搜索
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 搜索过滤
      if (searchText) {
        const search = searchText.toLowerCase();
        if (
          !user.username.toLowerCase().includes(search) &&
          !user.email?.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      // 状态过滤
      if (filterStatus !== 'all') {
        if (filterStatus === 'active' && !user.isActive) return false;
        if (filterStatus === 'inactive' && user.isActive) return false;
      }

      // 日期过滤
      if (dateFilter) {
        const userDate = new Date(user.createdAt);
        const filterDate = new Date(dateFilter);
        if (
          userDate.getFullYear() !== filterDate.getFullYear() ||
          userDate.getMonth() !== filterDate.getMonth() ||
          userDate.getDate() !== filterDate.getDate()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [users, searchText, filterStatus, dateFilter]);

  // 数据网格列定义
  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: '头像',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.avatar}
          sx={{ width: 32, height: 32 }}
        >
          {params.row.username[0]}
        </Avatar>
      ),
    },
    {
      field: 'username',
      headerName: '用户名',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          {!params.row.isActive && (
            <Chip label="已停用" size="small" color="error" />
          )}
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: '邮箱',
      width: 200,
    },
    {
      field: 'isActive',
      headerName: '状态',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? '活跃' : '停用'}
          color={params.value ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'totalEntries',
      headerName: '日记数',
      width: 100,
      valueGetter: (params) => params.row.stats.totalEntries,
    },
    {
      field: 'lastLoginAt',
      headerName: '最后登录',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value
            ? formatDistanceToNow(new Date(params.value), {
                addSuffix: true,
                locale: zhCN,
              })
            : '从未登录'}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: '注册时间',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString('zh-CN')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '操作',
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="view"
          icon={<Visibility />}
          label="查看"
          onClick={() => handleViewUser(params.row)}
        />,
        ...(canEdit
          ? [
              <GridActionsCellItem
                key="edit"
                icon={<Edit />}
                label="编辑"
                onClick={() => handleEditUser(params.row)}
              />,
            ]
          : []),
        ...(canDelete
          ? [
              <GridActionsCellItem
                key="delete"
                icon={<Delete />}
                label="删除"
                onClick={() => handleDeleteUser(params.row)}
              />,
            ]
          : []),
      ],
    },
  ];

  // 事件处理函数
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    showInfo(`编辑用户: ${user.username}`);
    // 实现编辑逻辑
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`确定要删除用户 ${user.username} 吗？`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showSuccess(`用户 ${user.username} 已删除`);
    }
  };

  const handleBatchAction = (action: string) => {
    if (selectedRows.length === 0) {
      showError('请选择要操作的用户');
      return;
    }

    switch (action) {
      case 'activate':
        setUsers(prev =>
          prev.map(user =>
            selectedRows.includes(user.id)
              ? { ...user, isActive: true }
              : user
          )
        );
        showSuccess(`已激活 ${selectedRows.length} 个用户`);
        break;
      case 'deactivate':
        setUsers(prev =>
          prev.map(user =>
            selectedRows.includes(user.id)
              ? { ...user, isActive: false }
              : user
          )
        );
        showSuccess(`已停用 ${selectedRows.length} 个用户`);
        break;
      case 'delete':
        if (window.confirm(`确定要删除选中的 ${selectedRows.length} 个用户吗？`)) {
          setUsers(prev =>
            prev.filter(user => !selectedRows.includes(user.id))
          );
          showSuccess(`已删除 ${selectedRows.length} 个用户`);
        }
        break;
    }
    setSelectedRows([]);
    setMenuAnchor(null);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      showInfo('数据已刷新');
    } catch (error) {
      showError('刷新失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {/* 页面标题 */}
      <Typography variant="h4" component="h1" gutterBottom>
        用户管理
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                总用户数
              </Typography>
              <Typography variant="h4">
                {users.length.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                活跃用户
              </Typography>
              <Typography variant="h4">
                {users.filter(u => u.isActive).length.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                本月新增
              </Typography>
              <Typography variant="h4">
                {users.filter(u => 
                  new Date(u.createdAt).getMonth() === new Date().getMonth()
                ).length.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                停用用户
              </Typography>
              <Typography variant="h4">
                {users.filter(u => !u.isActive).length.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 工具栏 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {/* 搜索 */}
          <TextField
            placeholder="搜索用户名或邮箱..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            size="small"
            sx={{ minWidth: 250 }}
          />

          {/* 状态过滤 */}
          <TextField
            select
            label="状态"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">全部</MenuItem>
            <MenuItem value="active">活跃</MenuItem>
            <MenuItem value="inactive">停用</MenuItem>
          </TextField>

          {/* 日期过滤 */}
          <DatePicker
            label="注册日期"
            value={dateFilter}
            onChange={setDateFilter}
            slotProps={{ textField: { size: 'small' } }}
          />

          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            刷新
          </Button>

          {/* 批量操作 */}
          {selectedRows.length > 0 && (
            <>
              <Button
                startIcon={<MoreVert />}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                variant="outlined"
              >
                批量操作 ({selectedRows.length})
              </Button>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem onClick={() => handleBatchAction('activate')}>
                  <CheckCircle sx={{ mr: 1 }} />
                  激活用户
                </MenuItem>
                <MenuItem onClick={() => handleBatchAction('deactivate')}>
                  <Block sx={{ mr: 1 }} />
                  停用用户
                </MenuItem>
                <MenuItem onClick={() => handleBatchAction('delete')}>
                  <Delete sx={{ mr: 1 }} />
                  删除用户
                </MenuItem>
              </Menu>
            </>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* 导入/导出 */}
          <Button startIcon={<Upload />} variant="outlined" size="small">
            导入
          </Button>
          <Button startIcon={<Download />} variant="outlined" size="small">
            导出
          </Button>
        </Box>
      </Paper>

      {/* 数据网格 */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          loading={isLoading}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection as string[]);
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
        />
      </Paper>

      {/* 用户详情对话框 */}
      <Dialog
        open={showUserDialog}
        onClose={() => setShowUserDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          用户详情
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Avatar
                    src={selectedUser.avatar}
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                  >
                    {selectedUser.username[0]}
                  </Avatar>
                  <Typography variant="h6">{selectedUser.username}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                  <Chip
                    label={selectedUser.isActive ? '活跃' : '停用'}
                    color={selectedUser.isActive ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  基本信息
                </Typography>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    注册时间: {new Date(selectedUser.createdAt).toLocaleString('zh-CN')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最后更新: {new Date(selectedUser.updatedAt).toLocaleString('zh-CN')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最后登录: {selectedUser.lastLoginAt 
                      ? new Date(selectedUser.lastLoginAt).toLocaleString('zh-CN')
                      : '从未登录'}
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                  使用统计
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      日记数: {selectedUser.stats.totalEntries}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      聊天记录: {selectedUser.stats.totalChatRecords}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      标签数: {selectedUser.stats.totalTags}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      周均日记: {selectedUser.stats.avgEntriesPerWeek}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserDialog(false)}>
            关闭
          </Button>
          {canEdit && selectedUser && (
            <Button onClick={() => handleEditUser(selectedUser)} variant="contained">
              编辑用户
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
