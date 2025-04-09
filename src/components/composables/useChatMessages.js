// composables/useChatMessages.js
import { ref, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
export function useChatMessages() {
    const messages = ref([])
    const inputQuestion = ref('')
    const isGenerating = ref(false)
    let abortController = null
    const pendingMessages = new Map()
    const conversationHistory = ref([])

    const handleSubmit = async ({ content, model }) => {
        if (!content || isGenerating.value) return
        const tempId = Date.now().toString()
        try {
            isGenerating.value = true
            abortController = new AbortController()
            // 添加用户消息\
            const userMessage = {
                role: 'user',
                content: content,
                timestamp: Date.now(),
            }

            messages.value.push(userMessage)

            conversationHistory.value.push(userMessage)

            // 添加并跟踪AI消息
            const assistantMessage = {
                role: 'assistant',
                content: '',
                model: model,
                timestamp: Date.now(),
                tempId: tempId,
                id: null
            }
            messages.value.push(assistantMessage)


            pendingMessages.set(tempId, {
                buffer: '',
                fullContent: '',
                lastOffset: 0 // 新增偏移量跟踪
            })
            // API请求
            const ccid = localStorage.getItem('ccid')
            const requestBody = {
                id: ccid,
                model: model,
                messages: conversationHistory.value
                    .filter(m => ['user', 'assistant'].includes(m.role))
                    .map(({ role, content }) => ({ role, content })), // 只保留必要字段
                maxTokens: null,
                temperature: null
            }
            console.log("requestBody:")
            console.log(requestBody)
            await axios({
                method: 'post',
                url: 'http://114.55.146.90:8080/api.example.com/v1/chat/completions',
                data: requestBody,
                headers: {
                    'Authorization': localStorage.getItem('authToken') || '',
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
                responseType: 'text',
                signal: abortController.signal,

                onDownloadProgress: (progressEvent) => {
                    console.log("requestBody:")
                    console.log(requestBody)
                    const xhr = progressEvent.event.target;
                    const tracking = pendingMessages.get(tempId);

                    if (!tracking) return;

                    // 只获取新增数据
                    const newChunk = xhr.responseText.slice(tracking.lastOffset);
                    tracking.lastOffset = xhr.responseText.length;

                    if (xhr.readyState === 3) {
                        requestAnimationFrame(() => {
                            processStreamData(newChunk, tempId)
                        })
                    }
                }

            })
            console.log(requestBody)
        } catch (error) {
            console.log("1!")
            handleError(error, tempId)// 改为传递tempId
            console.log("2!")
        } finally {

            pendingMessages.delete(tempId)
            isGenerating.value = false
        }
    }
    const processStreamData = (chunk, tempId) => {
        const tracking = pendingMessages.get(tempId)
        if (!tracking) return

        tracking.buffer += chunk
        const chunks = tracking.buffer.split('\n')
        tracking.buffer = chunks.pop() || '' // 保留未完成部分

        chunks.forEach(dataChunk => {
            if (!dataChunk.startsWith('data:')) return
            try {
                const jsonStr = dataChunk.replace(/^data:/, '').trim()
                const data = JSON.parse(jsonStr)


                if (data.userHistoryVO != null) {
                    // console.log("baka")
                    localStorage.setItem('ccid', data.userHistoryVO.id)
                    updateFinalMessage(tempId, data)
                    return
                }

                const contentChunk = data.choices?.[0]?.delta?.content ||
                    data.choices?.[0]?.message?.content ||
                    ''

                if (contentChunk) {
                    tracking.fullContent += contentChunk
                    updateMessageContent(tempId, tracking.fullContent)
                }

            } catch (e) {
                console.error('解析异常:', e, '原始数据:', dataChunk)
            }
        })

    }
    // 更新消息内容
    const updateMessageContent = (tempId, content) => {
        messages.value = messages.value.map(msg =>
            msg.tempId === tempId ? { ...msg, content } : msg
        )
        // console.log('更新内容:', { tempId, content })
    }

    // 更新最终状态
    const updateFinalMessage = (tempId, data) => {
        const index = messages.value.findIndex(m => m.tempId === tempId)
        if (index === -1) return

        // ✅ 统一更新逻辑
        messages.value[index] = {
            ...messages.value[index],
            content: data.choices[0].message.content,
            id: data.id,
            model: data.model,
            timestamp: data.created * 1000,
            userHistory: data.userHistoryVO
        }

        // ✅ 历史记录更新
        const assistantResponse = {
            role: 'assistant',
            content: data.choices[0].message.content,
            timestamp: data.created * 1000
        }

        conversationHistory.value.push(assistantResponse)
        console.log(conversationHistory)
    }
    // console.log('解析后的数据:', data)
    // 错误处理
    const handleError = (error, tempId) => {
        if (axios.isCancel(error)) return

        const errorMsg = error.response?.data?.message || error.message
        const targetIndex = messages.value.findIndex(m => m.tempId === tempId)

        if (targetIndex > -1) {
            messages.value[targetIndex].content =
                `[ERROR] ${errorMsg}\n\n${messages.value[targetIndex].content}`
        }

        ElMessage.error(`请求失败: ${errorMsg}`)
    }
    const stopGeneration = () => {
        if (abortController) {
            abortController.abort()
            abortController = null
        }
    }
    return {
        messages,
        inputQuestion,
        isGenerating,
        conversationHistory,
        processStreamData,
        handleSubmit,
        stopGeneration,
        handleError
    }
}