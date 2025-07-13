import { io, Socket } from 'socket.io-client'
import { aiService } from './aiService'
import mitt from 'mitt'


export const emitter = mitt<{
  ai_request: string
  ai_response: string
}>()

interface AIRequest {
  id: string
  message: string
  timestamp: number
}

interface AIResponse {
  id: string
  content: string
  timestamp: number
}

class SocketService {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  // 连接配置
  private config = {
    url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080',
    options: {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    }
  }

  // 初始化连接
  async connect(): Promise<void> {
    try {
      console.log('Connecting to Socket.IO server:', this.config.url)

      this.socket = io(this.config.url, this.config.options)

      this.socket.on('connect', () => {
        console.log('✅ Connected to Socket.IO server')
        this.isConnected = true
        this.reconnectAttempts = 0
      })

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from Socket.IO server:', reason)
        this.isConnected = false
      })

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error)
        this.handleReconnection()
      })

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected after', attemptNumber, 'attempts')
        this.isConnected = true
      })

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed after', this.maxReconnectAttempts, 'attempts')
      })

      // 监听欢迎消息
      this.socket.on('welcome', (data) => {
        console.log('👋 Welcome message:', data)
      })

      // 监听 AI 请求
      this.socket.on('ai_request', async (request: AIRequest) => {
        console.log('📨 Received AI request:', request)
        emitter.emit('ai_request', request.message)
        await this.handleAIRequest(request)
      })

      // 监听 AI 响应确认
      this.socket.on('ai_response_received', (data) => {
        console.log('✅ AI response received by server:', data)
      })

      // 监听心跳
      this.socket.on('ping', () => {
        this.socket?.emit('pong')
      })

    } catch (error) {
      console.error('❌ Failed to connect to Socket.IO server:', error)
      throw error
    }
  }

  // 处理 AI 请求
  private async handleAIRequest(request: AIRequest): Promise<void> {
    try {
      console.log('🤖 Processing AI request:', request.id)

      // 使用 AI 服务生成响应
      const aiResponse = await aiService.generateResponse(request.message)

      // 构造响应对象
      const response: AIResponse = {
        id: request.id,
        content: aiResponse,
        timestamp: Date.now()
      }

      // 发送响应给后端
      this.socket?.emit('ai_response', response)
      emitter.emit('ai_response', response.content)
      console.log('📤 Sent AI response:', response.id)

    } catch (error) {
      console.error('❌ Error processing AI request:', error)

      // 发送错误响应
      const errorResponse: AIResponse = {
        id: request.id,
        content: '抱歉，处理请求时出现错误。',
        timestamp: Date.now()
      }

      this.socket?.emit('ai_response', errorResponse)
    }
  }

  // 处理重连
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect()
      }, this.config.options.reconnectionDelay * this.reconnectAttempts)
    }
  }

  // 断开连接
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting from Socket.IO server')
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // 发送自定义事件
  emit(event: string, data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.warn('⚠️ Socket not connected, cannot emit event:', event)
    }
  }

  // 监听自定义事件
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // 移除事件监听
  off(event: string): void {
    if (this.socket) {
      this.socket.off(event)
    }
  }
}

export const socketService = new SocketService()
