<template>
  <div class="input-box-container">
    <!-- 输入框 -->
    <div class="input-wrapper">
      <var-input
        v-model="inputText"
        placeholder="输入消息..."
        textarea
        :rows="inputRows"
        :maxlength="2000"
        class="message-input"
        @keydown.enter.exact="handleEnter"
        @input="handleInput"
      />

      <!-- 操作按钮组 -->
      <div class="action-buttons">
        <!-- 语音输入按钮 -->
        <var-button
          type="primary"
          text
          round
          class="action-btn"
          @click="handleVoiceInput"
          :disabled="isStreaming"
        >
          <var-icon name="microphone" :size="20" />
        </var-button>

        <!-- 停止生成按钮 -->
        <var-button
          v-if="isStreaming"
          type="danger"
          round
          class="action-btn stop-btn"
          @click="handleStop"
        >
          <var-icon name="stop-circle-outline" :size="20" />
          <span class="ml-1">停止</span>
        </var-button>

        <!-- 发送按钮 -->
        <var-button
          v-else
          type="primary"
          round
          class="action-btn send-btn"
          @click="handleSend"
          :disabled="!canSend || isStreaming"
        >
          <var-icon name="send" :size="20" />
          <span class="ml-1">发送</span>
        </var-button>
      </div>
    </div>

    <!-- 字数统计 -->
    <div class="input-footer" v-if="inputText.length > 0">
      <span class="text-xs text-gray-500">
        {{ inputText.length }} / 2000
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const inputText = ref('')
const inputRows = ref(1)

const isStreaming = computed(() => chatStore.isStreaming)
const canSend = computed(() => inputText.value.trim().length > 0)

// 自动调整输入框高度
function handleInput() {
  const lines = inputText.value.split('\n').length
  inputRows.value = Math.min(Math.max(lines, 1), 5)
}

// 处理回车发送
function handleEnter(e) {
  if (!e.shiftKey && canSend.value && !isStreaming.value) {
    e.preventDefault()
    handleSend()
  }
}

// 发送消息
async function handleSend() {
  if (!canSend.value || isStreaming.value) return

  const message = inputText.value.trim()
  inputText.value = ''
  inputRows.value = 1

  try {
    await chatStore.sendMessage(message)
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

// 停止生成
function handleStop() {
  chatStore.stopStreaming()
}

// 语音输入（待实现）
function handleVoiceInput() {
  console.log('语音输入功能待实现')
  // TODO: 集成语音输入功能
}
</script>

<style scoped>
.input-box-container {
  padding: 12px 16px;
  background: var(--color-body);
  border-top: 1px solid var(--color-border);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.message-input {
  flex: 1;
}

.message-input :deep(.var-input__textarea) {
  border-radius: 12px;
  background: var(--color-surface);
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  border: 1px solid var(--color-border);
  transition: border-color 0.3s;
}

.message-input :deep(.var-input__textarea:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  min-width: auto;
  height: 40px;
  padding: 0 16px;
}

.send-btn {
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stop-btn {
  background: linear-gradient(135deg, #ea4335 0%, #ff6b6b 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(234, 67, 53, 0.3);
  animation: pulse-stop 1.5s infinite;
}

.input-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  padding: 0 4px;
}

@keyframes pulse-stop {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 响应式 */
@media (max-width: 640px) {
  .input-box-container {
    padding: 8px 12px;
  }

  .input-wrapper {
    gap: 8px;
  }

  .action-btn {
    padding: 0 12px;
    height: 36px;
  }

  .action-btn span {
    display: none;
  }
}
</style>
