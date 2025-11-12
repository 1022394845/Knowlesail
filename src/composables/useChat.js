import { useChatStore } from '@/stores/chat'

export function useChat() {
  const chatStore = useChatStore()
  return {
    conversations: chatStore.conversations,
    currentConversationId: chatStore.currentConversationId,
    currentConversation: chatStore.currentConversation,
    messages: chatStore.currentMessages,
    isStreaming: chatStore.isStreaming,
    currentStreamingMessage: chatStore.currentStreamingMessage,
    createConversation: chatStore.createConversation,
    switchConversation: chatStore.switchConversation,
    deleteConversation: chatStore.deleteConversation,
    addMessage: chatStore.addMessage,
    updateMessage: chatStore.updateMessage,
    updateToolCalls: chatStore.updateToolCalls,
    sendMessage: chatStore.sendMessage,
    stopStreaming: chatStore.stopStreaming,
    loadConversations: chatStore.loadConversations,
    saveConversations: chatStore.saveConversations,
    autoSave: () => {}
  }
}

export async function generateImage(prompt) {
  console.log('Generate image:', prompt)
  return null
}
