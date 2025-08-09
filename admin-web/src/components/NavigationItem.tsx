'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
} from '@mui/material';
import {
  Dashboard,
  People,
  Article,
  Analytics,
  Settings,
  AdminPanelSettings,
  Security,
  Backup,
  MenuBook,
  Chat,
  Report,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { NavigationItem as NavItem } from '@/types';

// 图标映射
const iconMap: { [key: string]: React.ComponentType } = {
  Dashboard,
  People,
  Article,
  Analytics,
  Settings,
  AdminPanelSettings,
  Security,
  Backup,
  MenuBook,
  Chat,
  Report,
};

interface NavigationItemProps {
  item: NavItem;
  level?: number;
  onItemClick?: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  level = 0,
  onItemClick,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.path || (hasChildren && item.children?.some(child => pathname === child.path));
  const isParentActive = hasChildren && item.children?.some(child => pathname.startsWith(child.path));

  // 获取图标组件
  const IconComponent = iconMap[item.icon] || Dashboard;

  // 处理点击事件
  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else {
      router.push(item.path);
      onItemClick?.();
    }
  };

  // 子项渲染
  const renderChildren = () => {
    if (!hasChildren) return null;

    return (
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.children!.map((child) => (
            <NavigationItem
              key={child.key}
              item={child}
              level={level + 1}
              onItemClick={onItemClick}
            />
          ))}
        </List>
      </Collapse>
    );
  };

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleClick}
          selected={isActive && !hasChildren}
          sx={{
            pl: 2 + level * 2,
            '&.Mui-selected': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.main',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            },
            '&:hover': {
              backgroundColor: level > 0 ? 'action.hover' : 'primary.light',
            },
            ...(isParentActive && level === 0 && {
              backgroundColor: 'primary.light',
              color: 'primary.main',
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
            }),
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: isActive ? 'inherit' : 'text.secondary',
            }}
          >
            <IconComponent />
          </ListItemIcon>
          
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: level > 0 ? '0.875rem' : '1rem',
              fontWeight: isActive ? 600 : 400,
            }}
          />
          
          {hasChildren && (
            open ? <ExpandLess /> : <ExpandMore />
          )}
        </ListItemButton>
      </ListItem>
      
      {renderChildren()}
    </>
  );
};

export default NavigationItem;
