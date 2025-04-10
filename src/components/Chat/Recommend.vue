<!-- @components/Chat/Recommend.vue -->
<template>
    <div class="recommend-container">
        <div class="question-grid">
            <el-card v-for="(question, index) in questions" :key="index" class="question-card"
                :body-style="{ padding: '12px' }">
                <div @click="$emit('select', question)" class="question-content">
                    <MarkdownRenderer :content="question" />
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ElCard } from 'element-plus'
import MarkdownRenderer from './MarkdownRenderer.vue'
defineProps({
    questions: {
        type: Array,
        default: () => []
    }
})

defineEmits(['select'])
</script>

<style scoped>
.recommend-container {
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 12px;
    margin: 1rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.question-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

.question-card {
    width: 80%;
    height: 50px;
    transition: all 0.2s ease;
}

.question-content {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    font-size: 0.9rem;
    color: #333;
}

.question-content:hover {
    color: #3b82f6;
    background-color: #f0f4ff;
    transform: translateY(-2px);
    border-radius: 4px;
}

@media (max-width: 768px) {
    .question-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .question-grid {
        grid-template-columns: 1fr;
    }
}
</style>