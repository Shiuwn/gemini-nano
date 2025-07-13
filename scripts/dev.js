#!/usr/bin/env node

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('🚀 Starting Gemini Nano development environment...\n')

// 启动前端
const frontend = spawn('pnpm', ['vite'], {
  cwd: projectRoot,
  stdio: 'pipe',
  shell: true
})

// 启动后端
const backend = spawn('node', ['./server/index.js'], {
  cwd: projectRoot,
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, PORT: '8080' }
})

// 前端输出处理
frontend.stdout.on('data', (data) => {
  console.log(`\x1b[34m[Frontend]\x1b[0m ${data.toString().trim()}`)
})

frontend.stderr.on('data', (data) => {
  console.error(`\x1b[31m[Frontend Error]\x1b[0m ${data.toString().trim()}`)
})

// 后端输出处理
backend.stdout.on('data', (data) => {
  console.log(`\x1b[32m[Backend]\x1b[0m ${data.toString().trim()}`)
})

backend.stderr.on('data', (data) => {
  console.error(`\x1b[31m[Backend Error]\x1b[0m ${data.toString().trim()}`)
})

// 错误处理
frontend.on('error', (error) => {
  console.error(`\x1b[31m[Frontend Error]\x1b[0m Failed to start frontend:`, error.message)
})

backend.on('error', (error) => {
  console.error(`\x1b[31m[Backend Error]\x1b[0m Failed to start backend:`, error.message)
})

// 进程退出处理
const cleanup = () => {
  console.log('\n🛑 Shutting down development environment...')
  frontend.kill('SIGTERM')
  backend.kill('SIGTERM')
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

// 监听进程退出
frontend.on('close', (code) => {
  console.log(`\x1b[34m[Frontend]\x1b[0m Process exited with code ${code}`)
  if (code !== 0) {
    backend.kill('SIGTERM')
  }
})

backend.on('close', (code) => {
  console.log(`\x1b[32m[Backend]\x1b[0m Process exited with code ${code}`)
  if (code !== 0) {
    frontend.kill('SIGTERM')
  }
})

console.log('✅ Development environment started!')
console.log('📱 Frontend: http://localhost:5173 (or next available port)')
console.log('🔌 Backend: http://localhost:8080')
console.log('🛑 Press Ctrl+C to stop\n')
