/**
 * 聊天 API 服务层
 * 负责与后端 MCP API 的通信
 */

const API_BASE_URL = 'http://118.196.24.221:20001/mcp/api/v1'

/**
 * 发送消息并接收流式响应
 * @param {string} message - 用户消息
 * @param {Function} onChunk - 接收文本片段的回调
 * @param {Function} onToolCall - 接收工具调用的回调
 * @param {Function} onToolResult - 接收工具结果的回调
 * @param {AbortSignal} signal - 用于取消请求的信号
 * @returns {Promise<string>} 完整的响应文本
 */
export async function sendMessageStream(
  message,
  { onChunk, onToolCall, onToolResult, signal } = {}
) {
  let accumulatedText = ''

  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/sse?message=${encodeURIComponent(message)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream'
        },
        signal
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          const dataStr = line.trim().substring(6)
          try {
            const data = JSON.parse(dataStr)

            // 1) 普通文本增量
            if (data.text) {
              accumulatedText += data.text
              if (onChunk) {
                onChunk(data.text, accumulatedText)
              }
            }

            // 2) MCP 工具调用提示
            if (Array.isArray(data.tool_calls) && data.tool_calls.length > 0) {
              const toolNames = data.tool_calls
                .map(
                  (tc) =>
                    tc?.function?.name ||
                    tc?.custom?.name ||
                    tc?.type ||
                    '工具'
                )
                .filter(Boolean)
              if (onToolCall) {
                onToolCall(toolNames)
              }
            }

            // 3) MCP 工具返回结果
            if (data.result) {
              const raw =
                typeof data.result === 'string'
                  ? data.result
                  : JSON.stringify(data.result, null, 2)
              const resultStr = decodeEscapedNewlines(raw)
              accumulatedText += resultStr
              if (onToolResult) {
                onToolResult(resultStr, accumulatedText)
              }
            }
          } catch (e) {
            console.warn('解析 JSON 失败:', dataStr, e)
          }
        }
      }
    }

    return accumulatedText
  } catch (error) {
    if (error.name === 'AbortError') {
      // 用户主动中断，返回已有内容
      return accumulatedText
    }
    throw error
  }
}

/**
 * 将形如 "\n" 的转义序列还原为实际换行/制表符
 */
function decodeEscapedNewlines(str) {
  if (typeof str !== 'string') return str
  if (str.indexOf('\\') === -1) return str

  let s = str
  s = s.replace(/\\r\\n/g, '\r\n')
  s = s.replace(/\\n/g, '\n')
  s = s.replace(/\\r/g, '\r')
  s = s.replace(/\\t/g, '\t')
  return s
}
