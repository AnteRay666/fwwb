// composables/useChatMessages.js
import { ref } from 'vue'
import axios from 'axios'

export function useChatMessages() {
    const messages = ref([])
    const inputQuestion = ref('')
    const isGenerating = ref(false)
    let abortController = null
    const pendingMessages = new Map()



    const handleSubmit = async ({ content, model }) => {
        if (!content || isGenerating.value) return
        const tempId = Date.now().toString()
        try {
            isGenerating.value = true
            abortController = new AbortController()
            // 添加用户消息
            messages.value.push({
                role: 'user',
                content: content,
                timestamp: Date.now(),
            })
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
            await axios({
                method: 'post',
                url: 'http://114.55.146.90:8080/api.example.com/v1/chat/completions',
                data: {
                    id: null,
                    model: model,
                    messages: [{ role: 'user', content: content }],
                    maxTokens: null,
                    temperature: null
                },
                headers: {
                    'Authorization': localStorage.getItem('authToken') || '',
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
                responseType: 'text',
                signal: abortController.signal,
                onDownloadProgress: (progressEvent) => {
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
        } catch (error) {
            this.handleError(error, tempId) // 改为传递tempId
        } finally {

            pendingMessages.delete(tempId)
            isGenerating.value = false
        }
    }
    const processStreamData = (chunk, tempId) => {
        // console.log('--- 新数据块 ---')
        // console.log('原始chunk:', chunk)
        const tracking = pendingMessages.get(tempId)
        // console.log('当前缓冲区:', tracking.buffer)
        if (!tracking) return

        // 处理可能的分块情况
        tracking.buffer += chunk
        const chunks = tracking.buffer.split('\n') // 根据你的数据格式使用双换行分割
        tracking.buffer = chunks.pop() || '' // 保留未完成部分

        chunks.forEach(dataChunk => {
            console.log("!1");
            if (!dataChunk.startsWith('data:')) return
            try {
                console.log("!2");
                const jsonStr = dataChunk.replace(/^data:/, '').trim()
                const data = JSON.parse(jsonStr)


                if (data.userHistoryVO != null) {
                    console.log("baka")
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

        const index = messages.value.findIndex(m => m.tempId === tempId)
        if (index > -1) {
            messages.value[index].content = content
        }
        console.log('更新内容:', { tempId, content })

    }

    // 更新最终状态
    const updateFinalMessage = (tempId, data) => {
        const index = messages.value.findIndex(m => m.tempId === tempId)
        if (index === -1) return
        const finalContent = data.choices[0].message.content
        messages.value.splice(index, 1, {
            ...messages.value[index],
            id: data.id,
            content: finalContent, // 使用最终完整内容
            model: data.model,
            timestamp: data.created * 1000, // 转换时间戳
            userHistory: data.userHistoryVO
        })
        console.log('最终内容:', finalContent)
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
        processStreamData,
        handleSubmit,
        stopGeneration, handleError
    }
}