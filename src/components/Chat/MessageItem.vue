<!-- @components/Chat/MessageItem.vue -->
<template>
    <div class="message-item" :class="message.role">
        <div class="avatar-container">
            <el-icon v-if="message.role === 'assistant'">
                <Cpu />
            </el-icon>
            <el-icon v-else>
                <User />
            </el-icon>
        </div>
        <div class="message-content" :class="message.role">
            <!-- 添加加载状态 -->
            <div v-if="!message.content && isGenerating" class="loading-indicator">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <MarkdownRenderer v-if="message.role === 'assistant'" :content="message.content" />
            <template v-else>{{ message.content }}</template>

            <div class="message-meta">
                <span v-if="message.model" class="model-tag">{{ modelNames[message.model] }}</span>
                <!-- <span class="timestamp">{{ formatTime(message.timestamp) }}</span> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import { User, Cpu } from '@element-plus/icons-vue'
import { useChatMessages } from '../composables/useChatMessages'
import { watch } from 'vue'
const props = defineProps({
    message: Object,
    isGenerating: Boolean,
    isLast: Boolean
})
const modelNames = {
    'gpt-4o': 'GPT-4o',
    'deepseek-r1': 'DeepSeek',
    'qwen-max': 'Qwen'
}
const { conversationHistory } = useChatMessages()

const orderedMessages = computed(() => {
    return [...props.messages].sort((a, b) => a.timestamp - b.timestamp)
})
watch(conversationHistory, (newVal) => {
    localStorage.setItem('currentConversation', JSON.stringify(newVal))
    window.location.reload()
}, { deep: true })

</script>
<style scoped>
.message-item {
    display: flex;
    gap: 12px;
    margin: 16px 0;
}

.message-item.user {
    flex-direction: row-reverse;
}

.avatar-container {
    flex-shrink: 0;
}


.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.message-content {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 12px;
    background: var(--bg-color);
}

.message-content.user {
    --bg-color: #1890ff;
    color: white;
    border-radius: 12px 4px 12px 12px;
}

.message-content.assistant {
    --bg-color: #f0f2f5;
    color: #333;
    border-radius: 4px 12px 12px 12px;
}

.message-meta {
    margin-top: 8px;
    font-size: 0.8em;
    opacity: 0.8;
    display: flex;
    justify-content: space-between;
}

.loading-indicator {
    display: flex;
    gap: 6px;
    padding: 8px 0;
}

.loading-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ddd;
    animation: dot-pulse 1.4s infinite;
}

/* @keyframes dot-pulse {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-4px);
    }
} */

.message-content.assistant:not([data-loaded]) {
    background: linear-gradient(90deg, #f8f9fa 25%, #e9ecef 50%, #f8f9fa 75%);
    background-size: 200% 100%;
    animation: loading-shimmer 1.5s infinite;
}

/* @keyframes loading-shimmer {
    from {
        background-position: 200% 0;
    }

    to {
        background-position: -200% 0;
    }
} */
</style>
