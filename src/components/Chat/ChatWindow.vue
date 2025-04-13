<!-- @components/Chat/ChatWindow.vue -->
<template>
    <div class="chat-container">
        <UserInfo :ccname="ccname" />
        <div ref="messagesContainer" class="messages-wrapper">
            <div class="messages-scroller">
                <MessageItem v-for="(msg, index) in sortedMessages" :key="msg.tempId || msg.id" :message="msg"
                    :is-generating="isGenerating && index === messages.length - 1"
                    :is-last="index === messages.length - 1" />
                <Recommend v-if="recommendData.length > 0" :questions="recommendData" :refence_files="refence_filesData"
                    @select="handleSelectQuestion" />
            </div>
        </div>
        <InputArea :model-value="currentInput" :is-generating="isGenerating" @recommend-data="handleRecommendData"
            @submit="handleSubmit" />
    </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

import UserInfo from './UserInfo.vue'
import InputArea from './InputArea.vue'
import MessageItem from './MessageItem.vue'
import Recommend from './Recommend.vue'

import { useChatMessages } from '../composables/useChatMessages'
import { useRecommend } from '../composables/useRecommend.js'

import { useChatStore } from '@/stores/chat'

const route = useRoute()
const chatStore = useChatStore()
const ccname = ref()
const currentInput = ref('')


const handleSelectQuestion = (question) => {
    currentInput.value = null
    currentInput.value = question
    // recommendData.value = []
    // 自动聚焦输入框
    nextTick(() => {
        const input = document.querySelector('.input-field')
        if (input) {
            // 确保触发双向绑定
            input.value = question
            const event = new Event('input', { bubbles: true })
            input.dispatchEvent(event)

            // 聚焦并移动光标到末尾
            input.focus()
            input.setSelectionRange(question.length, question.length)
        }
    })
}


const {
    messages,
    isGenerating,
    handleSubmit: submitToAI,
    stopGeneration, handleError,
} = useChatMessages()
const isLoading = ref(false)

const sortedMessages = computed(() => {
    // 双重保障：确保始终返回数组
    const msgArray = Array.isArray(messages.value) ? messages.value : []
    return [...msgArray].sort((a, b) => a.timestamp - b.timestamp)
})

const loadHistoryMessages = async (id) => {
    try {
        const cached = localStorage.getItem(`conversation_${id}`)
        if (cached) {
            messages.value = JSON.parse(cached)
        }
        // console.log('开始加载对话记录，ID:', id)
        const data = await chatStore.getconversationList(id)
        console.log('加载到的数据:', data)
        if (data) {
            ccname.value = data.recordName
            messages.value = data.converted
            // console.log('ccname 设置为:', data.recordName)
            console.log('消息列表设置为:', data.converted)
        }
        localStorage.setItem(`conversation_${id}`, JSON.stringify(data))
    } catch (err) {
        // error handling
    }
}



const { getRelatedQuestions, getRefence_file } = useRecommend()
const recommendData = ref([])
const refence_filesData = ref()
const handleRecommendData = ({ questions, refence_files }) => {
    recommendData.value = questions
    refence_filesData.value = refence_files
}

// 处理用户提交
const handleSubmit = async ({ content, model, rag }) => {
    try {

        recommendData.value = []
        refence_filesData.value = ''
        await submitToAI({ content, model, rag })
        if (localStorage.getItem('ifrecommend') === 'true') {
            const [
                { questions },
                { references }
            ] = await Promise.all([
                getRelatedQuestions(content),
                getRefence_file(content)
            ])
            recommendData.value = questions
            refence_filesData.value = references
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
            ccname.value = ''
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
/* .user-info-container {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 10;
} */

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
.inputArea {
    position: sticky;
    bottom: 0;
    background-color: white;
    padding: 16px;
    z-index: 10;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.03);
}
</style>
