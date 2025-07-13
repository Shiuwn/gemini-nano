<script setup lang="ts">
interface Props {
  content: string
}

defineProps<Props>()

const formatContent = (content: string) => {
  // 处理代码块
  content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-2"><code>${code.trim()}</code></pre>`
  })
  // 处理标题
  content = content.replace(/^#+\s+(.*$)/gm, '<h1 class="text-2xl font-bold">$1</h1>')

  // 处理粗体文本
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')

  // 处理列表项
  content = content.replace(/^•\s+(.*$)/gm, '<li class="ml-4">• $1</li>')
  content = content.replace(/^(\d+)\.\s+(.*$)/gm, '<li class="ml-4">$1. $2</li>')

  // 处理换行
  content = content.replace(/\n/g, '<br>')

  return content
}

</script>

<template>
  <div class="message-content" v-html="formatContent(content)"></div>
</template>

<style scoped>
.message-content :deep(pre) {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.message-content :deep(strong) {
  color: #1f2937;
}

.message-content :deep(li) {
  margin-bottom: 0.25rem;
}
</style>
