# Gemini Nano Chat

一个基于 Vue 3 + TypeScript + UnoCSS + Socket.IO 的 AI 聊天应用，集成了 Gemini Nano AI 模型。

## 🚀 快速开始
- `Chrome 138` 以上版本，开启 `chrome://flags/#prompt-api-for-gemini-nano`
- `chrome://components` **Optimization Guide On Device Model** 更新到最新
- [硬件要求](https://developer.chrome.com/docs/ai/get-started?hl=zh-cn#hardware)

> 参考 [Gemini Nano 文档](https://developer.chrome.com/docs/ai/prompt-api?hl=zh-cn)

### 安装依赖

```bash
# 安装前端依赖
pnpm install

# 安装后端依赖（会自动执行）
cd server && npm install
```

### 启动开发环境

```bash
# 同时启动前端和后端
pnpm dev
```

这将同时启动：
- 前端：Vite 开发服务器 (http://localhost:5173+)
- 后端：Socket.IO 服务器 (http://localhost:8080)

### 单独启动

```bash
# 只启动前端
pnpm dev:frontend

# 只启动后端
pnpm dev:backend
```

## 🏗️ 项目结构

```
gemini-nano/
├── src/
│   ├── components/
│   │   ├── ChatDialog.vue      # 聊天对话框组件
│   │   └── MessageContent.vue  # 消息内容格式化组件
│   ├── services/
│   │   ├── aiService.ts        # AI 服务
│   │   └── socketService.ts    # Socket.IO 服务
│   ├── App.vue                 # 主应用组件
│   └── main.ts                 # 应用入口
├── server/
│   ├── index.js                # Socket.IO 服务器
│   ├── test-client.js          # 测试客户端
│   └── README.md               # 服务器文档
├── uno.config.ts               # UnoCSS 配置
└── package.json
```

## 🔧 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **UnoCSS** - 原子化 CSS 引擎
- **Socket.IO Client** - 实时通信
- **Vite** - 构建工具

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 框架
- **Socket.IO** - 实时通信库
- **CORS** - 跨域资源共享

### AI
- **Gemini Nano** - Google 的轻量级 AI 模型

## 📡 Socket.IO 通信

### 事件类型

#### 客户端发送
- `ai_response` - 发送 AI 响应
- `pong` - 心跳响应

#### 服务器发送
- `welcome` - 连接欢迎消息
- `ai_request` - AI 请求
- `ping` - 心跳检测
- `ai_response_received` - AI 响应确认

### API 接口

- `GET /health` - 健康检查
- `GET /api/status` - 获取连接状态
- `POST /api/ai-request` - 发送 AI 请求

## 🎨 功能特性

- ✅ 实时 AI 对话
- ✅ 多轮对话支持
- ✅ 代码高亮显示
- ✅ 响应式设计
- ✅ 自动重连机制
- ✅ 连接状态指示
- ✅ 消息格式化
- ✅ 错误处理

## 🧪 测试

### 测试 Socket.IO 服务器

```bash
cd server
node test-client.js
```

### 测试 API 接口

```bash
# 健康检查
curl http://localhost:8080/health

# 发送 AI 请求
curl -X POST http://localhost:8080/api/ai-request \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

## 🔧 配置

### 环境变量

创建 `.env` 文件：

```env
# Socket.IO 服务器地址
VITE_SOCKET_URL=http://localhost:8080

```

### 端口配置

- 前端：自动选择可用端口 (5173+)
- 后端：8080 (可通过 PORT 环境变量修改)

## 📝 开发说明

### 添加新的 Socket.IO 事件

1. 在 `src/services/socketService.ts` 中添加事件监听
2. 在 `server/index.js` 中添加事件处理
3. 更新文档

### 自定义 AI 响应

修改 `src/services/aiService.ts` 中的 `generateSmartResponse` 方法。

### 样式定制

使用 UnoCSS 类名或修改 `uno.config.ts` 中的配置。

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License


