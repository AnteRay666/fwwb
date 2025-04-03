<template>
    <!-- 主容器 -->
    <div class="chat-container">
        <div class="user-info-container">
            <div v-if="userInfo.isLoggedIn" class="user-info-wrapper">
                <el-button class="user-btn" @click="showUserInfoDialog">
                    <el-icon>
                        <User />
                    </el-icon>
                    <span class="username">{{ userInfo.username }}</span>
                </el-button>
            </div>
            <div v-else class="auth-buttons">
                <el-button type="primary" @click="showAuthModal = true">登录/注册</el-button>
            </div>
        </div>

        <RegisterLoginPage v-model:visible="showAuthModal" @success="showAuthModal = false, handleLoginSuccess" />

        <!-- 新增用户信息弹窗 -->
        <UserInfoDialog v-model:visible="showUserInfo" :username="userInfo.username" @logout="handleLogout" />
        <!-- 消息展示区域 -->
        <div ref="messagesContainer" class="messages-wrapper">
            <div class="messages-scroller">
                <div v-for="(msg, index) in messages" :key="index" class="message-item">
                    <div class="avatar" :class="msg.role"></div>
                    <div class="message-card" :class="msg.role">
                        <div class="message-content">
                            <MarkdownRenderer v-if="msg.role === 'assistant'" :content="msg.content" />
                            <template v-else>{{ msg.content }}</template>
                        </div>
                        <div v-if="isGenerating && index === messages.length - 1" class="typing-indicator">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                </div>
                <div v-if="isGenerating && messages.length === 0" class="loading-container">
                    <svg class="loading-spinner" viewBox="0 0 50 50">
                        <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                    </svg>
                </div>
            </div>
        </div>
        <div class="input-container-fixed">
            <!-- 输入区域 -->
            <div class="input-wrapper">
                <div class="model-selector">
                    <select v-model="selectedModel" class="model-select">
                        <option value="deepseek-r1">DeepSeek-R1</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="qwen-max">Qwen-Max</option>
                    </select>
                    <svg class="select-arrow" viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5H7z" />
                    </svg>
                </div>
                <form @submit.prevent="handleSubmit" class="input-form">
                    <textarea ref="inputArea" v-model="inputQuestion" :disabled="isGenerating" placeholder="请输入您的问题..."
                        rows="1" @input="autoResize" class="input-field" />

                    <button type="submit" class="send-button" :class="{ generating: isGenerating }">
                        <svg v-if="!isGenerating" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
                            height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-6.636 2.812-.664-1.886c-.15-.529-.01-.818.356-.818l19.087-6.364c.367-.124.634.223.357.618l-5.454 19.086c-.278.974-.962 1.35-1.686 1.074L1 14.293l-1.313-3.938c-.24-.717.01-1.272.514-1.272h19.086c.504 0 .754.555.514 1.272L1.946 9.315z" />
                        </svg>
                        <div v-else class="stop-indicator"></div>
                    </button>
                </form>
                <div class="status-bar">By ante</div>
            </div>
        </div>


    </div>
</template>
<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import RegisterLoginPage from '../RegisterLoginPage/RegisterLoginPage.vue'
import UserInfoDialog from '../RegisterLoginPage/UserInfoDialog.vue'
import { User } from '@element-plus/icons-vue'
const messages = ref([])
const inputQuestion = ref('')

const showAuthModal = ref(false)
const isGenerating = ref(false)
const messagesContainer = ref(null)
const inputArea = ref(null)
let abortController = null

// 用户信息状态
const userInfo = ref({
    isLoggedIn: !!localStorage.getItem('authToken'),
    username: localStorage.getItem('username') || '匿名用户'
})
// 监听localStorage变化（跨标签页同步）
onMounted(() => {
    window.addEventListener('storage', (event) => {
        if (event.key === 'authToken') {
            userInfo.value.isLoggedIn = !!event.newValue
            if (!event.newValue) handleLogout()
        }
        if (event.key === 'username') {
            userInfo.value.username = event.newValue || '匿名用户'
        }
    })
})

// 检查本地存储状态
const checkLoginStatus = () => {
    const token = localStorage.getItem('authToken')
    userInfo.value.isLoggedIn = !!token
    userInfo.value.username = localStorage.getItem('username') || ''
}

// 显示用户信息弹窗
const showUserInfo = ref(false)
const showUserInfoDialog = () => {
    showUserInfo.value = true
}


// 处理退出登录
const handleLogout = () => {
    localStorage.clear()
    showUserInfo.value = false
    // 添加登出后的消息提示
    ElMessage.success('已退出登录')
}

// 登录成功处理
const handleLoginSuccess = (data) => {
    localStorage.setItem('authToken', data.token)
    localStorage.setItem('username', data.username)

    // 手动更新用户信息
    userInfo.value = {
        isLoggedIn: true,
        username: data.username
    }
    console.log('登录成功，当前用户状态：', userInfo.value)
    showAuthModal.value = false
    ElMessage.success(`欢迎回来，${data.username}！`)
}

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
window.addEventListener('storage', (event) => {
    if (event.key === 'authToken') {
        userInfo.value.isLoggedIn = !!event.newValue
    }
    if (event.key === 'username') {
        userInfo.value.username = event.newValue || '匿名用户'
    }
})
// 添加 watch 监听 localStorage 变化
watch(
    () => localStorage.getItem('authToken'),
    () => checkLoginStatus()
)
// 自动滚动监听
watch(messages, scrollToBottom, { deep: true })
</script>

<style scoped>
/* 添加新样式 */
.auth-button-container {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
}

.login-btn {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-radius: 16px;
}


.model-selector {
    right: -1rem;
    position: relative;
    margin-bottom: 1rem;
    width: 100%;
    max-width: 160px;
}

.model-select {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    background: #F8F9FA;
    font-size: 0.875rem;
    appearance: none;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #6366F1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
}

.select-arrow {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    width: 1.25rem;
    height: 1.25rem;
    fill: #64748B;
}

/* 调整输入区域布局 */
.input-form {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;

    align-items: end;
}

.input-field {
    grid-column: 2 / 3;
    margin-bottom: 0;
}

.send-button {
    grid-column: 3 / 4;
    margin-left: 0;
}



.chat-container {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.messages-wrapper {
    flex: 1;
    padding: 2rem;
    overflow: hidden;
}

.messages-scroller {
    height: 100%;
    overflow-y: auto;
    padding-right: 1rem;

    /* 隐藏滚动条 */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE/Edge */

    &::-webkit-scrollbar {
        display: none;
        /* Chrome/Safari */
    }

}

.message-item {
    display: flex;
    margin: 1.5rem 0;
    gap: 1rem;

    &:first-child {
        margin-top: 0;
    }
}

.avatar {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #6366F1;

    &.user {
        background: linear-gradient(135deg, #FF6B6B 0%, #EA580C 100%);
    }
}

.message-card {
    max-width: 75%;
    border-radius: 12px;
    padding: 1.25rem;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: relative;
    animation: fadeIn 0.3s ease-out;

    &.user {
        margin-left: auto;
        background: linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%);
        color: #1E293B;
    }

    &.assistant {
        background: white;
        color: #334155;
    }
}

.typing-indicator {
    display: flex;
    gap: 4px;
    margin-top: 0.5rem;

    .dot {
        width: 8px;
        height: 8px;
        background: #64748b;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;

        &:nth-child(1) {
            animation-delay: 0s
        }

        &:nth-child(2) {
            animation-delay: 0.2s
        }

        &:nth-child(3) {
            animation-delay: 0.4s
        }
    }
}

.input-container-fixed {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #E5E7EB;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.03);
    z-index: 10;
}

.input-wrapper {
    padding: 1.5rem 15%;
    max-width: 1200px;
    margin: 0 auto;
}

.input-form {
    position: relative;
}

.input-field {
    width: 100%;
    padding: 1rem 3rem 1rem 1.25rem;
    border: 2px solid #E5E7EB;
    border-radius: 12px;
    background: #F8F9FA;
    font-size: 1rem;
    line-height: 1.5;
    resize: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
        outline: none;
        border-color: #6366F1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
}

.send-button {
    position: absolute;
    right: -3.5rem;
    bottom: 0.5rem;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background: #6366F1;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        fill: white;
        width: 20px;
        height: 20px;
        transition: transform 0.2s ease;
    }

    &:hover:not(:disabled) {
        background: #4F46E5;
    }

    &.generating {
        background: #DC2626;

        &:hover {
            background: #B91C1C;
        }

        .stop-indicator {
            width: 24px;
            height: 24px;
            background: white;
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        }
    }
}

.auth-buttons {
    margin: 10px;

}

.status-bar {
    margin-top: 0.75rem;
    text-align: center;
    color: #64748B;
    font-size: 0.875rem;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-8px);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>