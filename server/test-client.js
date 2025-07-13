const axios = require('axios')

const SERVER_URL = 'http://localhost:8080'

// 测试健康检查
async function testHealth() {
  try {
    console.log('🏥 Testing health check...')
    const response = await axios.get(`${SERVER_URL}/health`)
    console.log('✅ Health check passed:', response.data)
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
  }
}

// 测试获取状态
async function testStatus() {
  try {
    console.log('📊 Testing status endpoint...')
    const response = await axios.get(`${SERVER_URL}/api/status`)
    console.log('✅ Status check passed:', response.data)
  } catch (error) {
    console.error('❌ Status check failed:', error.message)
  }
}

// 测试发送 AI 请求
async function testAIRequest(message) {
  try {
    console.log('🤖 Testing AI request...')
    const response = await axios.post(`${SERVER_URL}/api/ai-request`, {
      message: message || 'Hello, how are you?'
    })
    console.log('✅ AI request sent:', response.data)
    return response.data.requestId
  } catch (error) {
    console.error('❌ AI request failed:', error.message)
    return null
  }
}

// 主测试函数
async function runTests() {
  console.log('🧪 Starting Socket.IO server tests...\n')

  // 等待服务器启动
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 运行测试
  await testHealth()
  console.log()

  await testStatus()
  console.log()

  const requestId = await testAIRequest('What is the weather like today?')
  console.log()

  if (requestId) {
    console.log('⏳ Waiting for AI response...')
    // 等待 AI 响应
    await new Promise(resolve => setTimeout(resolve, 5000))
    console.log('✅ Test completed!')
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = {
  testHealth,
  testStatus,
  testAIRequest
}
