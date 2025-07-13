import ChromiumAI, { type ChromiumAIInstance } from 'simple-chromium-ai'

interface AIResponse {
  content: string
  type: 'text' | 'list' | 'code' | 'table'
}

class AIService {
  private context: string[] = []
  private ai: ChromiumAIInstance | null = null;

  constructor() {
    ChromiumAI.Safe.initialize('You are a helpful assistant').then((safeAI) => {
      // this.ai = ai
      safeAI.match(async (ai) => {
        this.ai = ai
      },
      (err) => console.log(err))
    })
  }

  // 添加对话上下文
  addContext(message: string) {
    this.context.push(message)
    // 保持最近10条消息作为上下文
    if (this.context.length > 10) {
      this.context.shift()
    }
  }

  // 清空上下文
  clearContext() {
    this.context = []
    ChromiumAI.Safe.initialize('You are a helpful assistant').then((safeAI) => {
      safeAI.match(async (ai) => {
        this.ai = ai
      },
      (err) => console.log(err))
    })
  }

  // 生成 AI 响应
  async generateResponse(userMessage: string): Promise<string> {
    if (!this.ai) {
      return 'AI 正在初始化，请稍后再试'
    }

    this.addContext(userMessage)

    const response = await ChromiumAI.prompt(this.ai!, userMessage)

    // 根据用户消息内容生成不同类型的响应
    // console.log('gemini nano response:', response)

    this.addContext(response)
    return response
  }

}

export const aiService = new AIService()
