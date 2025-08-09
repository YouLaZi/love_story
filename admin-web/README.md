# Story4Love 管理后台

一个现代化的Web管理系统，用于管理Story4Love恋爱日记应用的后台数据和用户。

## 🌟 功能特色

### 🔐 认证与权限
- **管理员登录** - 安全的邮箱密码登录
- **角色权限管理** - 支持超级管理员、管理员、审核员、查看者等角色
- **双因素认证** - 可选的2FA安全验证
- **会话管理** - 自动Token刷新和安全登出

### 👥 用户管理
- **用户列表** - 分页、搜索、筛选用户数据
- **用户详情** - 查看用户完整信息和使用统计
- **批量操作** - 支持批量激活、停用、删除用户
- **用户状态管理** - 实时监控用户活跃状态
- **数据导出** - 支持用户数据导出为Excel、CSV格式

### 📝 内容管理
- **日记审核** - 审核用户发布的日记内容
- **聊天记录管理** - 管理导入的聊天记录数据
- **举报处理** - 处理用户举报的不当内容
- **内容统计** - 分析内容类型和情感分布
- **敏感词过滤** - 自动检测和标记敏感内容

### 📊 数据分析
- **实时仪表板** - 展示关键业务指标
- **用户增长分析** - 用户注册和活跃度趋势
- **内容统计** - 日记数量、情感分布等
- **平台分析** - iOS/Android使用情况
- **自定义报表** - 支持生成各类统计报表

### ⚙️ 系统设置
- **应用配置** - 管理应用的各项配置参数
- **通知管理** - 发送系统通知给用户
- **安全设置** - 配置安全策略和限制
- **备份管理** - 数据备份和恢复功能

## 🛠 技术架构

### 前端技术栈
- **Next.js 14** - React全栈框架，支持App Router
- **Material-UI v5** - Google Material Design组件库
- **TypeScript** - 类型安全的JavaScript超集
- **React Query** - 强大的数据获取和缓存库
- **React Hook Form** - 高性能表单处理
- **Recharts** - 响应式图表库

### 状态管理
- **React Context** - 全局状态管理（认证、通知）
- **React Query** - 服务端状态管理和缓存
- **Local Storage** - 本地数据持久化

### UI/UX设计
- **Material Design 3** - 现代化设计语言
- **响应式布局** - 支持桌面和移动端
- **深色主题** - 支持浅色/深色主题切换
- **无障碍访问** - 遵循WCAG可访问性标准

## 📦 快速开始

### 环境要求
- Node.js 18.0+
- npm 或 yarn
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）

### 安装运行

1. **克隆项目**
```bash
git clone <repository-url>
cd admin-web
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **环境配置**
```bash
cp env.example .env.local
# 编辑 .env.local 配置数据库和API地址
```

4. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

5. **访问应用**
```
http://localhost:3001
```

### 构建部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

## 📁 项目结构

```
admin-web/
├── src/
│   ├── app/                  # Next.js App Router页面
│   │   ├── dashboard/        # 仪表板页面
│   │   ├── login/           # 登录页面
│   │   ├── layout.tsx       # 根布局
│   │   └── globals.css      # 全局样式
│   ├── components/          # 可复用组件
│   │   ├── NavigationItem.tsx
│   │   └── ...
│   ├── contexts/           # React Context
│   │   ├── AuthContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── ...
│   ├── api/               # API客户端
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── ...
│   ├── utils/            # 工具函数
│   │   ├── theme.ts
│   │   └── ...
│   └── types/           # TypeScript类型定义
│       └── index.ts
├── public/              # 静态资源
├── package.json        # 依赖配置
├── next.config.js     # Next.js配置
├── tsconfig.json      # TypeScript配置
└── README.md         # 项目文档
```

## 🔑 核心功能使用

### 1. 管理员登录
- 访问 `/login` 页面
- 输入管理员邮箱和密码
- 支持"记住我"和忘记密码功能
- 登录后自动跳转到仪表板

### 2. 用户管理
- 进入 `/dashboard/users` 页面
- 使用搜索框快速查找用户
- 点击用户行查看详细信息
- 使用批量操作管理多个用户

### 3. 内容审核
- 进入 `/dashboard/content` 页面
- 查看待审核的日记内容
- 处理用户举报的不当内容
- 设置内容过滤规则

### 4. 数据分析
- 查看仪表板实时数据
- 进入 `/dashboard/analytics` 查看详细分析
- 导出各类统计报表
- 配置数据监控报警

## 🔒 安全特性

### 身份认证
- JWT Token认证机制
- 自动Token刷新
- 会话超时管理
- 安全登出

### 权限控制
- 基于角色的访问控制（RBAC）
- 细粒度权限设置
- 路由级权限保护
- API级权限验证

### 数据安全
- HTTPS通信加密
- 输入数据验证和清理
- SQL注入防护
- XSS攻击防护
- CSRF保护

## 📊 监控与日志

### 用户行为监控
- 登录/登出记录
- 操作日志记录
- 异常行为检测
- 实时在线状态

### 系统监控
- API响应时间监控
- 错误率统计
- 性能指标追踪
- 资源使用情况

## 🚀 性能优化

### 前端优化
- 代码分割和懒加载
- 图片优化和压缩
- 缓存策略优化
- 包大小优化

### 数据加载优化
- 分页加载大数据集
- 虚拟滚动处理长列表
- 请求去重和缓存
- 离线数据支持

## 🧪 测试

### 单元测试
```bash
npm test
```

### 集成测试
```bash
npm run test:integration
```

### E2E测试
```bash
npm run test:e2e
```

## 📝 开发规范

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint配置规则
- 统一的代码格式化（Prettier）
- Git提交信息规范

### 组件开发
- 函数式组件优先
- 使用React Hooks
- 合理的组件拆分
- Props类型定义

### API设计
- RESTful API设计
- 统一的响应格式
- 错误处理机制
- API文档维护

## 🔧 常见问题

### 1. 登录后白屏
检查API服务是否正常运行，确认环境变量配置正确。

### 2. 数据不显示
检查网络连接和API权限，确认用户角色权限正确。

### 3. 页面加载慢
检查网络环境，考虑启用缓存和CDN加速。

### 4. 权限错误
联系超级管理员检查用户角色和权限配置。

## 📞 技术支持

- 技术文档: [docs.story4love.com](https://docs.story4love.com)
- 问题反馈: [GitHub Issues](https://github.com/yourusername/story4love-admin/issues)
- 邮箱支持: admin-support@story4love.com

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情

## 🙏 贡献者

感谢所有为此项目做出贡献的开发者！

---

**注意**: 这是Story4Love项目的管理后台部分，需要配合主应用和API服务使用。
