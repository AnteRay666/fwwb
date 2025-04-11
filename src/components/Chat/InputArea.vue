<!-- @components/Chat/InputArea.vue -->
<template>
    <div class="input-container-fixed">
        <div class="input-wrapper">
            <div class="control-bar">
                <div class="model-selector">
                    <select v-model="selectedModel" class="model-select">
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="deepseek-r1">DeepSeek-R1</option>
                        <option value="qwen-max">Qwen-Max</option>
                    </select>
                </div>
                <div class="rag-selector">
                    <select v-model="selectedrag" class="rag-select">
                        <option value="BOOK">BOOK</option>
                        <option value="RECIPE">RECIPE</option>
                        <option value="GRAPH">GRAPH</option>
                    </select>
                </div>
                <button class="recommend-button" :class="{ 'active': isRecommendActive }" @click="toggleRecommend">
                    相关推荐
                    <span class="status-dot"></span>
                </button>
            </div>

            <div class="input-form">
                <textarea ref="inputArea" v-model="inputContent" :disabled="isGenerating" placeholder="请输入您的问题..."
                    rows="1" class="input-field" @keydown.enter.exact.prevent="handleSubmit" />
                <button type="button" class="send-button" :disabled="!canSubmit" @click="handleSubmit">
                    <svg v-if="!isGenerating" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
                        height="24">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path
                            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-6.636 2.812-.664-1.886c-.15-.529-.01-.818.356-.818l19.087-6.364c.367-.124.634.223.357.618l-5.454 19.086c-.278.974-.962 1.35-1.686 1.074L1 14.293l-1.313-3.938c-.24-.717.01-1.272.514-1.272h19.086c.504 0 .754.555.514 1.272L1.946 9.315z" />
                    </svg>
                    <svg v-else class="stop-indicator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
                        height="24">
                        <!-- 外框脉冲动画 -->
                        <path class="stop-outer" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20" fill="none"
                            stroke="currentColor" stroke-width="1.5">
                            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.5s" repeatCount="indefinite" />
                        </path>

                        <!-- 中心停止符号 -->
                        <path class="stop-inner" d="M8 8h8v8H8z" fill="currentColor" stroke="currentColor"
                            stroke-width="0.5">
                            <!-- 轻微缩放动画 -->
                            <animate attributeName="transform" type="translate" values="-0.5 -0.5; 0 0; -0.5 -0.5"
                                dur="0.8s" repeatCount="indefinite" />
                        </path>
                    </svg>
                </button>
            </div>
            <div class="status-bar">当前模型: {{ modelDisplayName }} | 当前RAG:{{ RagDisplayName }} | {{
                isRecommendActive ? '相关推荐启用' :
                    '相关推荐禁用' }}</div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import { useRecommend } from '../composables/useRecommend'
const { getRelatedQuestions, getRefence_file } = useRecommend()


const emit = defineEmits([
    'submit',
    'update:modelValue',
    'toggle-recommend',
    'recommend-data' // 新增事件
])
const inputContent = ref('')
const selectedModel = ref('qwen-max')
const selectedrag = ref('BOOK')

const isGenerating = ref(false)
const isRecommendActive = ref(false)  // 新增推荐状态


onMounted(() => {
    const savedState = localStorage.getItem('ifrecommend')
    if (savedState !== null) {
        isRecommendActive.value = savedState === 'true'
    }
})

const props = defineProps({
    isGenerating: Boolean,
    modelValue: String
})

const toggleRecommend = () => {
    // 切换状态时添加点击动画
    const button = document.querySelector('.recommend-button')
    button.classList.add('click-effect')

    // 状态切换逻辑
    isRecommendActive.value = !isRecommendActive.value

    // 同步到本地存储
    localStorage.setItem('ifrecommend', isRecommendActive.value)

    // 触发父组件事件
    emit('toggle-recommend', isRecommendActive.value)

    // 移除动画类
    setTimeout(() => {
        button.classList.remove('click-effect')
    }, 200)
}

// begin block-001
// 模型显示名称映射
const modelNames = {
    'deepseek-r1': 'DeepSeek-R1',
    'gpt-4o': 'GPT-4o',
    'qwen-max': 'Qwen-Max'
}

const RAGNames = {
    'BOOK': 'BOOK',
    'RECIPE': 'RECIPE',
    'GRAPH': 'GRAPH'
}

// 计算属性
const modelDisplayName = computed(() => modelNames[selectedModel.value])
const RagDisplayName = computed(() => RAGNames[selectedrag.value])

// end block-001
const canSubmit = computed(() =>
    !isGenerating.value
)



// 提交处理
const handleSubmit = async () => {
    const content = inputContent.value
    if (!content || props.isGenerating) return
    // 打印调试信息
    console.log('提交内容:', {
        content,
        model: selectedModel.value,
        rag: selectedrag.value
    })

    emit('submit', {
        content,
        model: selectedModel.value,
        rag: selectedrag.value
    })

    if (isRecommendActive.value) {
        try {
            // const { questions } = await getRelatedQuestions(content)
            // const { refence_file } = await getRefence_file(content)
            // emit('recommend-data', questions, refence_file) // 新增事件
            // 并行获取两个推荐数据
            const [questionsRes, refenceRes] = await Promise.all([
                getRelatedQuestions(content),
                getRefence_file(content)
            ])

            // 发射包含两个参数的事件
            emit('recommend-data', {
                questions: questionsRes.questions,
                refence_files: refenceRes.references
            })



        } catch (error) {
            console.error('获取推荐失败:', error)
            emit('recommend-data', { questions: [], refence_files: '' })
        }
    }


    inputContent.value = ''
}
watch(
    () => props.modelValue,
    (newVal) => {
        // 自动调整输入框高度
        autoResizeTextarea()
    }
)


const autoResizeTextarea = () => {
    nextTick(() => {
        const textarea = document.querySelector('.input-field')
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = `${textarea.scrollHeight}px`
        }
    })
}
</script>

<style>
.status-bar.active {
    background: #3b82f6;
    color: white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.status-indicator {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.15);
}

/* 优化控制栏布局 */
.control-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
}

/* 优化推荐按钮间距 */
.recommend-button {
    height: 2.8rem;
    margin: 12px;
    padding: 8px 16px;
    border-width: 1.5px;
    border-radius: 8px;
    width: 160px;
    border: 2px solid #E5E7EB;
    background: #F8F9FA;
    color: #6b7280;
    font-size: 0.875rem;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition:
        transform 0.2s ease,
        box-shadow 0.3s ease,
        background 0.3s ease;

    &:focus {
        outline: none;
        border-color: #6366F1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
}

.recommend-button::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(59, 130, 246, 0.15);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
}

/* 激活状态 */
.recommend-button.active {
    background: #3b82f6 !important;
    color: white !important;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.recommend-button.active .status-dot {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

/* 点击动画 */
.recommend-button.click-effect {
    transform: scale(0.95);
}

.recommend-button.click-effect::after {
    width: 120%;
    height: 120%;
    opacity: 0;
}

/* 禁用状态过渡 */
.recommend-button:not(.active) {
    transition:
        all 0.3s ease,
        transform 0.2s ease;
}


/* 保持输入区域对齐 */
.input-form {
    position: relative;
    display: flex;
    gap: 12px;
}

.input-field {
    flex: 1;
    min-height: 48px;
    padding: 12px 56px 12px 16px;
}

.send-button {
    position: absolute;
    right: 12px;
    bottom: 12px;
    transform: none;

}



/* 优化激活状态指示 */
.recommend-button.active {
    border-width: 2px;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
}

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

    width: 100%;
    flex: 1;
    max-width: 160px;
}

.model-select {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    background: #F8F9FA;
    color: #6b7280;
    font-size: 0.875rem;
    text-align: center;
    transition: all 0.3s ease;

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

.rag-selector {
    right: -1rem;
    position: relative;

    width: 100%;
    flex: 1;
    max-width: 160px;
}

.rag-select {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    background: #F8F9FA;
    color: #6b7280;
    font-size: 0.875rem;
    text-align: center;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #6366F1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
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
    /* border-top: 1px solid #E5E7EB;*/
    border: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.03);
    z-index: 10;
}

.input-wrapper {
    padding: 1rem 15%;
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

.stop-indicator {
    color: #ff4444;
    /* 警示红色 */
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(0.95);
    }
}

.stop-outer {
    stroke-dasharray: 60;
    stroke-dashoffset: 0;
    animation: rotate 3s linear infinite;
}

@keyframes rotate {
    to {
        stroke-dashoffset: -120;
    }
}
</style>