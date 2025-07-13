# Gemini Nano Socket.IO Server

这是一个 Socket.IO 服务器，用于处理 AI 聊天请求。

## 功能特性

- ✅ WebSocket 实时通信
- ✅ AI 请求处理
- ✅ 自动重连机制
- ✅ 心跳检测
- ✅ REST API 接口
- ✅ 多客户端支持

## 安装依赖

```bash
cd server
npm install
```

## 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将在 `http://localhost:3000` 启动。

## API 接口

### 健康检查
```bash
GET /health
```

### 获取连接状态
```bash
GET /api/status
```

### 发送 AI 请求
```bash
POST /api/ai-request
Content-Type: application/json

{
  "message": "你的问题",
  "clientId": "可选的客户端ID"
}
```

## Socket.IO 事件

### 客户端发送事件
- `ai_response` - 发送 AI 响应
- `pong` - 心跳响应

### 服务器发送事件
- `welcome` - 连接欢迎消息
- `ai_request` - AI 请求
- `ping` - 心跳检测
- `ai_response_received` - AI 响应确认

## 测试

运行测试脚本：

```bash
node test-client.js
```

## 环境变量

- `PORT` - 服务器端口（默认：3000）

## 部署

1. 安装依赖：`npm install`
2. 启动服务器：`npm start`
3. 确保前端配置正确的 Socket.IO 服务器地址

## 故障排除

### 连接问题
- 检查端口是否被占用
- 确认防火墙设置
- 验证 CORS 配置

### AI 响应问题
- 确认前端 AI 服务正常运行
- 检查网络连接
- 查看服务器日志
