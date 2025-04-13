<!-- @components/Chat/Recommend.vue -->
<template>
    <div class="recommend-container">
        <!-- 相关问题部分 -->
        <div class="section" v-if="questions.length">
            <h3 class="section-title">
                <el-icon class="icon">
                    <Collection />
                </el-icon>
                相关问题
            </h3>
            <div class="question-grid">
                <el-card v-for="(question, index) in questions" :key="index" class="question-card" shadow="hover"
                    @click="handleClick(question)">
                    <div class="question-content">
                        <MarkdownRenderer :content="`${index + 1}. ${question}`" />
                    </div>
                </el-card>
            </div>
        </div>

        <!-- 参考资料部分 -->
        <div class="section" v-if="refence_files">
            <h3 class="section-title">
                <el-icon class="icon">
                    <Document />
                </el-icon>
                学习资料
            </h3>
            <el-card class="reference-card" shadow="never">
                <MarkdownRenderer :content="refence_files" class="reference-content" />
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ElCard, ElIcon } from 'element-plus'
import { Collection, Document } from '@element-plus/icons-vue'
import MarkdownRenderer from './MarkdownRenderer.vue'

defineProps({
    questions: {
        type: Array,
        default: () => []
    },
    refence_files: {
        type: String,
        default: ''
    }
})
const emit = defineEmits(['select'])

const handleClick = (question) => {
    console.log('触发选择:', question) // 添加调试日志
    emit('select', question)
}


</script>

<style scoped lang="scss">
.recommend-container {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    margin: 1.5rem 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section {
    margin-bottom: 2rem;

    &:last-child {
        margin-bottom: 0;
    }
}

.section-title {
    display: flex;
    align-items: center;
    color: #1e293b;
    font-size: 1.1rem;
    margin: 0 0 1.2rem;
    padding-bottom: 0.8rem;
    border-bottom: 2px solid #e2e8f0;

    .icon {
        margin-right: 0.6rem;
        color: #64748b;
        font-size: 1.2rem;
    }
}

.question-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.question-card {
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 8px;
    border: 1px solid #f1f5f9;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        border-color: #c7d2fe;
    }

    :deep(.el-card__body) {
        padding: 1rem;
    }
}

.question-content {
    color: #475569;
    font-size: 0.95rem;
    line-height: 1.5;

    &:hover {
        color: #3b82f6;
    }
}

.reference-card {
    background: #ffffff;
    border-radius: 8px;

    :deep(.el-card__body) {
        padding: 1.2rem;
    }
}

.reference-content {
    color: #475569;
    font-size: 0.95rem;
    line-height: 1.7;

    h4 {
        color: #1e293b;
        margin: 1.2rem 0 0.8rem;
    }

    ul {
        padding-left: 1.8rem;
    }

    li {
        margin-bottom: 0.6rem;
    }

    a {
        color: #3b82f6;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
}

@media (max-width: 768px) {
    .recommend-container {
        padding: 1rem;
        margin: 1rem 0;
    }

    .question-grid {
        grid-template-columns: 1fr;
    }

    .section-title {
        font-size: 1rem;
    }
}
</style>