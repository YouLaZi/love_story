# Story4Love 开发指南

## 开发环境设置

### 必要条件
- Node.js 16.0 或更高版本
- npm 或 yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) 或 Android Emulator

### 快速开始

1. **克隆项目并安装依赖**
```bash
git clone <repository-url>
cd story4love
npm install
```

2. **启动开发服务器**
```bash
npm start
```

3. **在模拟器中运行**
```bash
# iOS
npm run ios

# Android  
npm run android
```

## 项目架构

### 目录结构说明

```
src/
├── components/     # 可复用的UI组件
├── contexts/       # React Context状态管理
├── database/       # 数据库相关文件
├── navigation/     # 导航配置
├── screens/        # 页面组件
├── services/       # 业务逻辑服务
├── types/         # TypeScript类型定义
└── utils/         # 工具函数
```

### 核心模块

#### 1. 数据层 (Data Layer)
- **DatabaseService**: 本地SQLite数据库操作
- **CryptoService**: 数据加密/解密服务
- **CloudSyncService**: 云端数据同步服务

#### 2. 业务逻辑层 (Business Logic)
- **ChatImportService**: 聊天记录导入处理
- **EmotionAnalysisService**: 情感分析算法
- **各种Utils**: 验证、格式化、日期处理等

#### 3. 表现层 (Presentation Layer)
- **Contexts**: 全局状态管理（认证、主题、数据库）
- **Screens**: 页面组件
- **Navigation**: 路由配置

## 开发规范

### 代码规范

1. **TypeScript**: 强制使用TypeScript，所有接口和类型都要定义
2. **命名规范**:
   - 组件: PascalCase (`UserProfile.tsx`)
   - 函数: camelCase (`getUserData`)
   - 常量: UPPER_SNAKE_CASE (`API_ENDPOINT`)
   - 文件名: 组件用PascalCase，其他用camelCase

3. **组件结构**:
```tsx
// 导入顺序：React -> 第三方库 -> 本地组件 -> 类型
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { MyComponentProps } from '../types';

const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
  // 状态和hooks
  const [state, setState] = useState();
  const { theme } = useTheme();

  // 事件处理函数
  const handlePress = () => {
    // 处理逻辑
  };

  // 渲染
  return (
    <View style={styles.container}>
      {/* JSX内容 */}
    </View>
  );
};

// 样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MyComponent;
```

### Git 工作流

1. **分支命名**:
   - `feature/功能名称` - 新功能开发
   - `bugfix/问题描述` - 错误修复
   - `hotfix/紧急修复` - 紧急修复

2. **提交消息格式**:
```
type(scope): 简短描述

详细描述（可选）

关联issue: #123
```

类型说明：
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建工具或辅助工具的变动

### 数据库操作

#### 添加新表
1. 在 `src/database/schema.ts` 中添加表结构
2. 在 `src/types/index.ts` 中定义相关类型
3. 在 `DatabaseService` 中添加CRUD操作方法

#### 数据库迁移
```typescript
// 在 schema.ts 的 UPGRADE_SQL 中添加
export const UPGRADE_SQL: { [version: number]: string } = {
  2: `
    ALTER TABLE diary_entries ADD COLUMN new_field TEXT;
  `,
};
```

### 新增屏幕页面

1. **创建屏幕组件**:
```tsx
// src/screens/NewScreen.tsx
import React from 'react';
import { Surface } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';

const NewScreen: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* 页面内容 */}
    </Surface>
  );
};

export default NewScreen;
```

2. **添加到导航**:
```typescript
// 在 MainNavigator.tsx 中添加
import NewScreen from '../screens/NewScreen';

// 在 Stack.Navigator 中添加路由
<Stack.Screen
  name="NewScreen"
  component={NewScreen}
  options={{ title: '新页面' }}
/>
```

3. **更新类型定义**:
```typescript
// 在 types/index.ts 中更新 StackParamList
export type StackParamList = {
  // 现有路由...
  NewScreen: undefined; // 或参数类型
};
```

## 测试

### 运行测试
```bash
npm test
```

### 测试文件命名
- `Component.test.tsx` - 组件测试
- `service.test.ts` - 服务测试
- `utils.test.ts` - 工具函数测试

### 测试结构
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('期望的文本')).toBeTruthy();
  });

  it('should handle user interaction', () => {
    const mockFn = jest.fn();
    const { getByTestId } = render(<MyComponent onPress={mockFn} />);
    
    fireEvent.press(getByTestId('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## 构建和发布

### 本地构建
```bash
# 构建APK (Android)
expo build:android

# 构建IPA (iOS)
expo build:ios
```

### 发布到应用商店
```bash
# 发布到Google Play
expo upload:android

# 发布到App Store
expo upload:ios
```

## 调试技巧

### React Native Debugger
1. 安装 React Native Debugger
2. 在应用中启用远程调试
3. 使用浏览器开发者工具调试

### 日志记录
```typescript
// 使用 console.log 进行调试
console.log('Debug info:', data);

// 生产环境中使用日志服务
import { reportError } from '../utils/setupUtils';
reportError(new Error('Something went wrong'), 'UserAction');
```

### 性能监控
```typescript
// 监控组件渲染性能
import React, { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Render:', id, phase, actualDuration);
};

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

## 常见问题

### 1. 模拟器连接问题
```bash
# 重启Metro bundler
npx react-native start --reset-cache

# 清理项目
expo r -c
```

### 2. 依赖冲突
```bash
# 删除node_modules和锁定文件
rm -rf node_modules package-lock.json
npm install
```

### 3. iOS构建问题
```bash
# 清理iOS构建缓存
cd ios && xcodebuild clean
```

### 4. Android构建问题
```bash
# 清理Android构建缓存
cd android && ./gradlew clean
```

## 贡献指南

1. **提交Pull Request前**:
   - 确保所有测试通过
   - 代码遵循项目规范
   - 更新相关文档

2. **代码审查检查项**:
   - 功能是否正确实现
   - 性能是否有影响
   - 安全性考虑
   - 用户体验是否良好

## 性能优化

### 1. 组件优化
```typescript
// 使用 React.memo 避免不必要的重渲染
const MyComponent = React.memo(({ data }) => {
  return <View>{/* 组件内容 */}</View>;
});

// 使用 useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### 2. 列表优化
```typescript
// 使用 FlatList 而不是 ScrollView
<FlatList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  keyExtractor={item => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 3. 图片优化
```typescript
// 设置合适的图片尺寸
<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"
/>
```

## 安全性

### 1. 数据加密
- 所有敏感数据使用AES-256加密
- 密钥存储在设备的安全存储中
- 传输数据使用HTTPS

### 2. 输入验证
```typescript
// 始终验证用户输入
import { validateEmail } from '../utils/validationUtils';

const email = userInput.trim();
const validation = validateEmail(email);
if (!validation.isValid) {
  // 处理验证错误
}
```

### 3. 权限管理
```typescript
// 最小权限原则
const permissions = await checkAppPermissions();
if (!permissions.camera) {
  // 请求相机权限或禁用相关功能
}
```

## 联系方式

- 技术问题: 创建GitHub Issue
- 功能建议: 发送邮件到 dev@story4love.com
- 安全问题: 发送邮件到 security@story4love.com
