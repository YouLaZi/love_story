'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationMessage {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  action?: React.ReactNode;
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  hideNotification: (id: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const generateId = () => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const showNotification = (notification: Omit<NotificationMessage, 'id'>) => {
    const id = generateId();
    const newNotification: NotificationMessage = {
      id,
      duration: 6000, // 默认6秒
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // 自动隐藏
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, newNotification.duration);
    }
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message: string, title?: string) => {
    showNotification({
      type: 'success',
      title,
      message,
    });
  };

  const showError = (message: string, title?: string) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // 错误消息显示更长时间
    });
  };

  const showWarning = (message: string, title?: string) => {
    showNotification({
      type: 'warning',
      title,
      message,
    });
  };

  const showInfo = (message: string, title?: string) => {
    showNotification({
      type: 'info',
      title,
      message,
    });
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* 渲染通知 */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => hideNotification(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          style={{
            marginTop: `${index * 60}px`, // 多个通知堆叠显示
          }}
        >
          <Alert
            onClose={() => hideNotification(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{
              width: '100%',
              minWidth: '300px',
              maxWidth: '500px',
              '& .MuiAlert-message': {
                overflow: 'hidden',
              },
            }}
            action={notification.action}
          >
            {notification.title && (
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {notification.title}
              </div>
            )}
            <div style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {notification.message}
            </div>
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
