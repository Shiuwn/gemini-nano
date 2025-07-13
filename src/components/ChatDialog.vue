<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import MessageContent from './MessageContent.vue'
import { aiService } from '../services/aiService'
import { socketService, emitter } from '../services/socketService'


interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const messages = ref<Message[]>([])
const inputValue = ref('')
const isLoading = ref(false)
const chatContainer = ref<HTMLElement>()

const addMessage = (role: 'user' | 'assistant', content: string) => {
  const message: Message = {
    id: Date.now().toString(),
    role,
    content,
    timestamp: new Date()
  }
  messages.value.push(message)
}

emitter.on('ai_request', (message: string) => {
  // console.log('ai_request', message)
  addMessage('user', message)
})

emitter.on('ai_response', (message: string) => {
  // console.log('ai_response', message)
  addMessage('assistant', message)
})

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const handleSubmit = async () => {
  if (!inputValue.value.trim() || isLoading.value) return

  const userMessage = inputValue.value.trim()
  addMessage('user', userMessage)
  inputValue.value = ''
  isLoading.value = true

  await scrollToBottom()

  try {
    const response = await aiService.generateResponse(userMessage)
    addMessage('assistant', response)
  } catch (error) {
    addMessage('assistant', '抱歉，我遇到了一些问题。请稍后再试。')
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const clearChat = () => {
  messages.value = []
  aiService.clearContext()
}

// Socket.IO 连接状态
const socketStatus = ref(false)

// 初始化 Socket.IO 连接
onMounted(async () => {
  try {
    await socketService.connect()
    socketStatus.value = socketService.getConnectionStatus()

    // 监听连接状态变化
    socketService.on('connect', () => {
      socketStatus.value = true
    })

    socketService.on('disconnect', () => {
      socketStatus.value = false
    })
  } catch (error) {
    console.error('Failed to connect to Socket.IO server:', error)
  }
})

// 组件卸载时断开连接
onUnmounted(() => {
  socketService.disconnect()
})
</script>

<template>
  <div>
    <div class="flex flex-col h-[600px]">
      <!-- 聊天区域 -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
          <div class="mb-4">
            <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
              </path>
            </svg>
          </div>
          <p class="text-lg font-medium">欢迎使用 AI 助手</p>
          <p class="text-sm">开始输入你的问题，我会为你提供帮助</p>
        </div>

        <!-- 消息列表 -->
        <template v-for="message in messages" :key="message.id">
          <!-- 用户消息 -->
          <div v-if="message.role === 'user'" class="flex justify-end">
            <div class="max-w-[80%] bg-blue-500 text-white rounded-lg px-4 py-2 shadow-sm">
              <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
              <p class="text-xs text-blue-100 mt-1">{{ formatTime(message.timestamp) }}</p>
            </div>
          </div>

          <!-- AI 消息 -->
          <div v-else class="flex justify-start">
            <div class="max-w-[80%] bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div class="flex items-start space-x-2">
                <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <MessageContent :content="message.content" />
                  <p class="text-xs text-gray-500 mt-1">{{ formatTime(message.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="max-w-[80%] bg-white rounded-lg px-4 py-2 shadow-sm border">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="mt-4 px-2 flex space-x-2">
        <div class="flex-1 relative">
          <textarea v-model="inputValue" @keydown.enter.prevent="handleSubmit" placeholder="输入你的问题..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3" :disabled="isLoading"></textarea>
        </div>
        <button @click="handleSubmit" :disabled="!inputValue.trim() || isLoading"
          class="px-6 py-3 h-70.5px bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8">
            </path>
          </svg>
        </button>
      </div>

      <!-- 操作按钮 -->
      <div class="mt-4 mb-4 px-2 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button @click="clearChat" class="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
              </path>
            </svg>
            <span>清空对话</span>
          </button>

          <!-- Socket.IO 连接状态 -->
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full" :class="socketStatus ? 'bg-green-500' : 'bg-red-500'"></div>
            <span class="text-xs" :class="socketStatus ? 'text-green-600' : 'text-red-600'">
              {{ socketStatus ? '已连接' : '未连接' }}
            </span>
          </div>
        </div>

        <div class="text-sm text-gray-500">
          共 {{ messages.length }} 条消息
        </div>
      </div>
    </div>
  </div>
</template>
