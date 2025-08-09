# Story4Love - 恋爱日记应用

一款便捷、私密、功能全面的恋爱日记应用，帮助用户记录并管理他们的恋爱经历。

## 📱 功能特色

### 🔐 安全与隐私
- **生物识别验证** - 指纹/面部识别登录
- **端到端加密** - AES-256加密保护数据安全
- **隐私模式** - 后台时隐藏应用内容
- **两步验证** - 多重身份验证保护

### 📝 日记管理
- **多种输入方式** - 文字、语音、图片、视频
- **情感标记** - 12种情感状态记录
- **标签分类** - 自定义标签便于管理
- **时间线展示** - 按时间查看恋爱历程
- **搜索功能** - 快速找到特定内容

### 💬 聊天记录导入
- **微信导入** - 导入微信聊天记录
- **QQ导入** - 导入QQ聊天记录
- **自动时间线** - 聊天记录自动生成时间线
- **智能解析** - 支持多种消息格式

### 📊 情感分析
- **情感统计** - 分析情感分布和变化
- **趋势图表** - 可视化情感趋势
- **分析洞察** - AI生成个性化分析报告
- **周期报告** - 支持周/月/季/年报告

### 📤 数据导出
- **多种格式** - PDF、HTML、JSON、图片
- **自定义模板** - 简洁/详细/时间线/相册样式
- **灵活筛选** - 按时间、标签、情感筛选
- **加密导出** - 私密内容加密保护

### 🎨 个性化主题
- **多主题支持** - 浅色/深色/跟随系统
- **情感配色** - 每种情感对应独特颜色
- **自定义设置** - 字体大小、界面风格

## 🛠 技术架构

### 前端技术栈
- **React Native** - 跨平台移动应用框架
- **Expo** - 开发工具链和服务
- **React Navigation** - 导航管理
- **React Native Paper** - Material Design组件库
- **React Native Animatable** - 动画效果

### 数据存储
- **SQLite** - 本地数据库存储
- **Expo SecureStore** - 安全存储敏感信息
- **Expo FileSystem** - 文件系统管理

### 安全加密
- **CryptoJS** - 客户端加密库
- **AES-256** - 数据加密标准
- **PBKDF2** - 密钥派生函数

### 多媒体处理
- **Expo ImagePicker** - 图片选择
- **Expo DocumentPicker** - 文件选择
- **Expo AV** - 音视频处理
- **Expo Print** - PDF生成

## 📦 安装运行

### 环境要求
- Node.js 16.0+
- npm 或 yarn
- Expo CLI
- iOS Simulator 或 Android Emulator

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/youlazi/story4love.git
cd story4love
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**
```bash
npm start
# 或
yarn start
```

4. **运行应用**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📁 项目结构

```
story4love/
├── src/
│   ├── components/          # 可复用组件
│   ├── contexts/           # React Context
│   │   ├── AuthContext.tsx
│   │   ├── DatabaseContext.tsx
│   │   └── ThemeContext.tsx
│   ├── database/           # 数据库相关
│   │   └── schema.ts
│   ├── navigation/         # 导航配置
│   │   └── MainNavigator.tsx
│   ├── screens/           # 屏幕组件
│   │   ├── HomeScreen.tsx
│   │   ├── TimelineScreen.tsx
│   │   ├── WriteScreen.tsx
│   │   ├── AnalysisScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/          # 业务服务
│   │   ├── DatabaseService.ts
│   │   └── CryptoService.ts
│   ├── types/            # TypeScript类型定义
│   │   └── index.ts
│   └── utils/            # 工具函数
├── assets/               # 静态资源
├── App.tsx              # 应用入口
├── app.json            # Expo配置
└── package.json        # 依赖配置
```

## 🔑 核心功能使用

### 1. 写日记
- 点击底部导航"写日记"
- 输入标题和内容
- 选择当前心情
- 添加标签和附件
- 可选择是否设为私密

### 2. 导入聊天记录
- 进入设置 → 导入聊天记录
- 选择聊天平台（微信/QQ）
- 按指引导出聊天记录文件
- 选择文件并填写联系人信息
- 等待导入完成

### 3. 查看分析报告
- 点击底部导航"分析"
- 选择时间范围（周/月/季/年）
- 查看情感分布图和趋势
- 阅读AI生成的分析洞察

### 4. 导出数据
- 进入设置 → 导出数据
- 选择导出格式和模板
- 设置时间范围和筛选条件
- 点击开始导出并分享

## 🔒 隐私保护

### 数据加密
- 所有私密日记使用AES-256加密存储
- 用户密码使用PBKDF2哈希处理
- 备份数据端到端加密

### 隐私模式
- 开启后应用后台时隐藏内容预览
- 每次启动需要身份验证
- 支持自动锁定功能

### 权限管理
- 最小化权限申请
- 明确说明权限用途
- 用户可随时撤销权限

## 🚀 开发计划

### 已完成功能 ✅
- [x] 项目初始化和基础架构
- [x] 用户认证系统
- [x] 数据库设计和服务
- [x] 日记管理功能
- [x] 时间线展示
- [x] 情感分析
- [x] 数据导出
- [x] 主题系统

### 开发中功能 🚧
- [ ] 聊天记录导入
- [ ] 云同步功能
- [ ] 社交分享
- [ ] 数据备份恢复
- [ ] 多语言支持

### 计划功能 📋
- [ ] AI智能分析
- [ ] 语音转文字
- [ ] 手写识别
- [ ] 照片时光轴
- [ ] 情感词典
- [ ] 第三方集成

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- 项目主页: [https://github.com/yourusername/story4love](https://github.com/yourusername/story4love)
- 问题反馈: [Issues](https://github.com/yourusername/story4love/issues)
- 邮箱: contact@story4love.com

## 🙏 致谢

感谢所有为此项目做出贡献的开发者和用户！

---

**注意**: 本应用仍在开发中，部分功能可能不完善。欢迎提供反馈和建议！
