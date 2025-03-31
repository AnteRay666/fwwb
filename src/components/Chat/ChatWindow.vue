<template>
    <div class="chat-container">
        <!-- 消息展示区域 -->
        <div ref="messagesContainer" class="messages-container">
            <div v-for="(msg, index) in messages" :key="index" class="message-row" :class="msg.role">
                <div class="message-bubble">
                    <div class="message-content">
                        <MarkdownRenderer v-if="msg.role === 'assistant'" :content="msg.content" />
                        <template v-else>{{ msg.content }}</template>
                    </div>
                    <div v-if="isGenerating && index === messages.length - 1" class="cursor-animation"></div>
                </div>
            </div>
            <div v-if="isGenerating && messages.length === 0" class="loading-indicator">
                <div class="wave-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-container">
            <form @submit.prevent="handleSubmit">
                <div class="input-wrapper">
                    <textarea ref="inputArea" v-model="inputQuestion" :disabled="isGenerating" placeholder="有什么可以帮您？"
                        rows="1" @input="autoResize" @keydown.enter.exact.prevent="handleSubmit" />
                    <button type="submit" class="submit-btn" :class="{ 'stop-generation': isGenerating }"
                        :disabled="!inputQuestion.trim()">
                        <svg v-if="!isGenerating" class="icon" viewBox="0 0 24 24">
                            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                        </svg>
                        <div v-else class="stop-icon"></div>
                    </button>
                </div>
            </form>
            <div class="footer-note">DeepSeek-R1</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'

const messages = ref([])
const inputQuestion = ref('')
const isGenerating = ref(false)
const messagesContainer = ref(null)
const inputArea = ref(null)
let abortController = null

// 自动调整输入框高度
const autoResize = () => {
    nextTick(() => {
        inputArea.value.style.height = 'auto'
        inputArea.value.style.height = `${inputArea.value.scrollHeight}px`
    })
}

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}

// 处理提交
const handleSubmit = async () => {
    if (!inputQuestion.value.trim() || isGenerating.value) return

    try {
        isGenerating.value = true
        abortController = new AbortController()

        // 添加用户消息
        messages.value.push({
            role: 'user',
            content: inputQuestion.value
        })

        // 添加初始AI消息
        const aiMessage = { role: 'assistant', content: '' }
        messages.value.push(aiMessage)

        const response = await fetch('http://localhost:3000/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: inputQuestion.value }),
            signal: abortController.signal
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            aiMessage.content += chunk
            messages.value[messages.value.length - 1] = { ...aiMessage }
            scrollToBottom()
        }

        inputQuestion.value = ''
    } catch (err) {
        if (err.name !== 'AbortError') {
            messages.value.push({
                role: 'system',
                content: `⚠️ 请求失败: ${err.message}`
            })
        }
    } finally {
        isGenerating.value = false
        autoResize()
    }
}

// 停止生成
const stopGeneration = () => {
    if (abortController) {
        abortController.abort()
        messages.value[messages.value.length - 1].content += '\n\n[已停止生成]'
        isGenerating.value = false
    }
}

// 自动滚动监听
watch(messages, scrollToBottom, { deep: true })
</script>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f7f7f8;
}

.messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px 12% 40px;
    scroll-behavior: smooth;
}

.message-row {
    margin: 20px 0;

    &.user {
        display: flex;
        justify-content: flex-end;

        .message-bubble {
            background: #e6f4ff;
            border-color: #cde0ff;
        }
    }

    &.assistant {
        .message-bubble {
            background: white;
            border-color: #e5e7eb;
        }
    }
}

.message-bubble {
    max-width: 800px;
    border: 1px solid;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: relative;
    line-height: 1.6;
    font-size: 15px;

    .cursor-animation {
        display: inline-block;
        width: 8px;
        height: 18px;
        background: #666;
        margin-left: 4px;
        animation: blink 1s step-end infinite;
    }
}

.input-container {
    background: white;
    border-top: 1px solid #e5e5e5;
    padding: 20px 0;
    position: sticky;
    bottom: 0;

    .input-wrapper {
        max-width: 800px;
        margin: 0 auto;
        position: relative;
        padding: 0 12%;
    }

    textarea {
        width: 100%;
        padding: 12px 48px 12px 16px;
        border: 1px solid #d9d9e3;
        border-radius: 12px;
        resize: none;
        font-size: 15px;
        line-height: 1.6;
        background: white;
        transition: all 0.2s;

        &:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
            border-color: #40a9ff;
        }

        &:disabled {
            background: #f7f7f8;
        }
    }
}

.submit-btn {
    position: absolute;
    right: 16px;
    bottom: 12px;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: #1677ff;
    color: white;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #4096ff;
    }

    &:disabled {
        background: #d9d9e3;
        cursor: not-allowed;
    }

    &.stop-generation {
        background: #ff4d4f;

        &:hover {
            background: #ff7875;
        }
    }

    .icon {
        width: 20px;
        height: 20px;
        fill: currentColor;
    }

    .stop-icon {
        width: 16px;
        height: 16px;
        margin: 8px;
        background: white;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
}

.footer-note {
    text-align: center;
    color: #999;
    font-size: 12px;
    margin-top: 12px;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1
    }

    50% {
        opacity: 0
    }
}

.wave-dots {
    display: flex;
    gap: 8px;
    justify-content: center;

    .dot {
        width: 8px;
        height: 8px;
        background: #1677ff;
        border-radius: 50%;
        animation: wave 1.2s ease-in-out infinite;

        &:nth-child(2) {
            animation-delay: 0.2s
        }

        &:nth-child(3) {
            animation-delay: 0.4s
        }
    }
}

@keyframes wave {

    0%,
    60%,
    100% {
        transform: translateY(0)
    }

    30% {
        transform: translateY(-10px)
    }
}
</style>