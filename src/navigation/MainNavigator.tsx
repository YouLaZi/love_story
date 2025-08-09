import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 导入屏幕组件
import HomeScreen from '../screens/HomeScreen';
import TimelineScreen from '../screens/TimelineScreen';
import WriteScreen from '../screens/WriteScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DiaryDetailScreen from '../screens/DiaryDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SecurityScreen from '../screens/SecurityScreen';
import ThemesScreen from '../screens/ThemesScreen';
import ExportScreen from '../screens/ExportScreen';
import ImportChatScreen from '../screens/ImportChatScreen';

import { MainTabParamList, StackParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<StackParamList>();

// 主标签页导航器
function MainTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Timeline':
              iconName = focused ? 'timeline-clock' : 'timeline-clock-outline';
              break;
            case 'Write':
              iconName = focused ? 'pencil-plus' : 'pencil-plus-outline';
              break;
            case 'Analysis':
              iconName = focused ? 'chart-line' : 'chart-line-variant';
              break;
            case 'Settings':
              iconName = focused ? 'cog' : 'cog-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          elevation: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '首页',
          headerTitle: 'Story4Love',
        }}
      />
      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{
          title: '时间线',
          headerTitle: '时间线',
        }}
      />
      <Tab.Screen
        name="Write"
        component={WriteScreen}
        options={{
          title: '写日记',
          headerTitle: '写日记',
        }}
      />
      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          title: '分析',
          headerTitle: '情感分析',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '设置',
          headerTitle: '设置',
        }}
      />
    </Tab.Navigator>
  );
}

// 主导航器（包含标签页和堆栈页面）
export default function MainNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DiaryDetail"
        component={DiaryDetailScreen}
        options={{
          title: '日记详情',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="WriteEntry"
        component={WriteScreen}
        options={{
          title: '编辑日记',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ImportChat"
        component={ImportChatScreen}
        options={{
          title: '导入聊天记录',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{
          title: '导出数据',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '个人资料',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{
          title: '安全设置',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Themes"
        component={ThemesScreen}
        options={{
          title: '主题设置',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
