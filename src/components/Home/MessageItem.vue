<template>
  <div
    class="message-item"
    :class="{
      'message-user': message.role === 'user',
      'message-assistant': message.role === 'assistant',
      'message-streaming': message.streaming
    }"
  >
    <!-- 头像 -->
    <div class="message-avatar">
      <div
        class="avatar-circle"
        :class="{
          'avatar-user': message.role === 'user',
          'avatar-assistant': message.role === 'assistant'
        }"
      >
        <var-icon
          :name="message.role === 'user' ? 'account' : 'robot'"
          :size="24"
        />
      </div>
    </div>

    <!-- 内容区 -->
    <div class="message-content-wrapper">
      <!-- 角色名 -->
      <div class="message-header">
        <span class="message-role">
          {{ message.role === 'user' ? '你' : 'AI 助手' }}
        </span>
        <span class="message-time">
          {{ formatTime(message.timestamp) }}
        </span>
      </div>

      <!-- 消息内容 -->
      <div class="message-content">
        <!-- 用户消息：纯文本 -->
        <div v-if="message.role === 'user'" class="user-message-text">
          {{ message.content }}
        </div>

        <!-- 助手消息：Markdown 渲染 -->
        <MarkdownRenderer
          v-else
          :content="message.content"
          :message-id="message.id"
          :streaming="message.streaming"
          :tool-calls="message.toolCalls || []"
          :generate-image="generateImage"
        />

        <!-- 流式输出光标 -->
        <span v-if="message.streaming" class="streaming-cursor"></span>
      </div>

      <!-- 操作按钮 -->
      <div class="message-actions" v-if="!message.streaming">
        <!-- 复制 -->
        <var-button
          text
          round
          size="small"
          class="action-btn"
          @click="handleCopy"
        >
          <var-icon name="content-copy" :size="16" />
        </var-button>

        <!-- 导出到知识库 -->
        <var-button
          v-if="message.role === 'assistant'"
          text
          round
          size="small"
          class="action-btn"
          @click="handleExport"
        >
          <var-icon name="book-plus" :size="16" />
        </var-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownRenderer from './MarkdownRenderer/MarkdownRenderer.vue'
import { Snackbar } from '@varlet/ui'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['export'])

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 1分钟内
  if (diff < 60000) {
    return '刚刚'
  }
  // 1小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  }
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  // 其他
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 复制消息
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.message.content)
    Snackbar.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    Snackbar.error('复制失败')
  }
}

// 导出到知识库
function handleExport() {
  emit('export', props.message)
}

// 图片生成（占位）
async function generateImage(prompt) {
  console.log('生成图片:', prompt)
  return null
}
</script>

<style scoped>
.message-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin: 8px 0;
  transition: background-color 0.2s;
}

.message-item:hover {
  background: var(--color-surface);
  border-radius: 12px;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.avatar-user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar-assistant {
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
  color: white;
}

.message-content-wrapper {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.message-role {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
}

.message-time {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.message-content {
  position: relative;
  line-height: 1.6;
  word-wrap: break-word;
}

.user-message-text {
  padding: 12px 16px;
  background: var(--color-surface);
  border-radius: 12px;
  border-left: 3px solid var(--color-primary);
  color: var(--color-text-primary);
  font-size: 15px;
  white-space: pre-wrap;
}

.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: var(--color-primary);
  margin-left: 2px;
  animation: blink 1s infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.message-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.action-btn {
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.action-btn:hover {
  color: var(--color-primary);
  background: var(--color-surface);
}

/* 响应式 */
@media (max-width: 640px) {
  .message-item {
    padding: 12px;
  }

  .avatar-circle {
    width: 36px;
    height: 36px;
  }

  .message-actions {
    opacity: 1;
  }
}
</style>
