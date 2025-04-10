<!-- @components/Chat/ChatWindow.vue -->
<template>
    <div class="chat-container">
        <UserInfo :ccname="ccname" />
        <div ref="messagesContainer" class="messages-wrapper">
            <div class="messages-scroller">
                <MessageItem v-for="(msg, index) in messages" :key="msg.tempId || msg.id" :message="msg"
                    :is-generating="isGenerating && index === messages.length - 1"
                    :is-last="index === messages.length - 1" />
                <Recommend v-if="recommendData.length > 0" :questions="recommendData" @select="handleSelectQuestion" />
            </div>

        </div>
        <InputArea class="InputArea" :model-value="currentInput" :is-generating="isGenerating"
            @recommend-data="handleRecommendData" @submit="handleSubmit" />
    </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import UserInfo from './UserInfo.vue'
import InputArea from './InputArea.vue'
import MessageItem from './MessageItem.vue'
import Recommend from './Recommend.vue'
import { useChatMessages } from '../composables/useChatMessages'
import { useRecommend } from '../composables/useRecommend.js'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
const route = useRoute()
const chatStore = useChatStore()
const ccname = ref()

const {
    messages,
    isGenerating,
    handleSubmit: submitToAI,
    stopGeneration, handleError,
} = useChatMessages()
const isLoading = ref(false)

const loadHistoryMessages = async (id) => {
    try {
        const cached = localStorage.getItem(`conversation_${id}`)
        if (cached) {
            messages.value = JSON.parse(cached)
        }
        // console.log('开始加载对话记录，ID:', id)
        const data = await chatStore.getconversationList(id)
        // console.log('加载到的数据:', data)
        if (data) {
            ccname.value = data.recordName
            messages.value = data.converted
            // console.log('ccname 设置为:', data.recordName)
            // console.log('消息列表设置为:', data.converted)   
        }
        localStorage.setItem(`conversation_${id}`, JSON.stringify(data))
    } catch (err) {
        // error handling
    }
}


const { getRelatedQuestions } = useRecommend()
const recommendData = ref([])

const handleRecommendData = (questions) => {
    recommendData.value = questions
}


const currentInput = ref('')
const handleSelectQuestion = (question) => {
    currentInput.value = question
    recommendData.value = []
    // 自动聚焦输入框
    nextTick(() => {
        document.querySelector('.input-field')?.focus()
    })
}

// 处理用户提交
const handleSubmit = async ({ content, model }) => {
    try {
        recommendData.value = []
        await submitToAI({ content, model })
        if (localStorage.getItem('ifrecommend') === 'true') {
            const { questions } = await getRelatedQuestions(content)
            recommendData.value = questions
        }
    } catch (error) {
        ElMessage.error(error.message)
    }
}
const messagesContainer = ref(null)
const scrollToBottom = () => {
    if (messagesContainer.value) {
        const container = messagesContainer.value
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
        if (isNearBottom) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            })
        }
    }
}
watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            loadHistoryMessages(newId)
        } else {
            // 处理新建对话逻辑
            messages.value = []
        }
    },
    { immediate: true }
)
onMounted(() => {
    if (route.params.id) {
        loadHistoryMessages(route.params.id)
    }
})
</script>
<style scoped>
.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* 确保 UserInfo 固定在顶部 */
.user-info-container {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 10;
}

/* 确保 messages-wrapper 可以滚动 */
.messages-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

.messages-scroller {
    height: 100%;
    overflow-y: auto;
}

/* 确保 InputArea 固定在底部 */
.InputArea {
    position: sticky;
    bottom: 0;
    background-color: white;
    padding: 16px;
    z-index: 10;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.03);
}
</style>
