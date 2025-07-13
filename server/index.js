import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { EventEmitter } from 'events'


const eventBus = new EventEmitter();

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"], // Vite 开发服务器地址
    methods: ["GET", "POST"]
  }
})

// 中间件
app.use(cors())
app.use(express.json())

// 存储连接的客户端
const connectedClients = new Map()

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)
  connectedClients.set(socket.id, socket)

  // 发送欢迎消息
  socket.emit('welcome', {
    message: 'Welcome to Gemini Nano Chat Server!',
    timestamp: Date.now()
  })

  // 处理 AI 响应
  socket.on('ai_response', (response) => {
    console.log('📨 Received AI response:', response)

    if (response.id) {
      eventBus.emit(response.id, response)
    }
    // 这里可以将响应转发给其他客户端或存储到数据库
    // 示例：广播给所有连接的客户端
    io.emit('ai_response_received', {
      ...response,
      clientId: socket.id,
      timestamp: Date.now()
    })
  })

  // 处理心跳
  socket.on('pong', () => {
    console.log('💓 Received pong from:', socket.id)
  })

  // 处理断开连接
  socket.on('disconnect', (reason) => {
    console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason)
    connectedClients.delete(socket.id)
  })
})

// REST API 路由
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    connectedClients: connectedClients.size
  })
})

// 发送 AI 请求的 API 端点
app.post('/api/ai-request', (req, res) => {
  const { message, clientId } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  // 构造 AI 请求
  const aiRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message,
    timestamp: Date.now()
  }

  // 如果指定了客户端 ID，发送给特定客户端
  if (clientId && connectedClients.has(clientId)) {
    connectedClients.get(clientId).emit('ai_request', aiRequest)
  } else {
    // 否则发送给第一个连接的客户端
    const firstClient = connectedClients.values().next().value
    if (firstClient) {
      firstClient.emit('ai_request', aiRequest)
    } else {
      return res.status(503).json({ error: 'No AI clients available' })
    }
  }

  const timeId = setTimeout(() => {
    res.json({
      success: false,
      requestId: aiRequest.id,
      message: 'AI request timeout'
    })
  }, 1000 * 60 * 2)
  eventBus.on(aiRequest.id, (response) => {
    // io.emit('ai_response', response)
    clearTimeout(timeId)
    res.json({
      success: true,
      requestId: aiRequest.id,
      message: response
    })
  })

})

// 获取连接状态
app.get('/api/status', (req, res) => {
  res.json({
    connectedClients: connectedClients.size,
    clientIds: Array.from(connectedClients.keys()),
    timestamp: Date.now()
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`)
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`)
  console.log(`🌐 HTTP endpoint: http://localhost:${PORT}`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})
