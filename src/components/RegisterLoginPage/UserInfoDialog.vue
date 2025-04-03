<template>
    <el-dialog :model-value="visible" title="用户信息" width="500px" @close="handleClose">
        <div class="user-info-content">
            <el-card shadow="never">
                <!-- 用户信息展示 -->
                <div class="info-item">
                    <span class="label">用户名：</span>
                    <el-tag type="info" size="medium">
                        {{ storedUsername || '未登录用户' }}
                    </el-tag>
                </div>

                <!-- Token安全展示 -->
                <div class="info-item token-display">
                    <span class="label">访问令牌：</span>
                    <div class="token-wrapper">
                        <el-tooltip :content="storedToken" placement="top">
                            <span class="masked-token">{{ maskedToken }}</span>
                        </el-tooltip>
                        <el-button size="small" @click="copyToken" :disabled="!storedToken">
                            复制
                        </el-button>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-btns">
                    <el-button type="danger" plain @click="handleLogout" :disabled="!storedToken">
                        退出登录
                    </el-button>
                </div>
            </el-card>

            <!-- 安全提示 -->
            <div class="security-tip">
                <el-alert title="安全提示" type="warning" :closable="false" description="请妥善保管您的访问令牌，不要泄露给他人" />
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:visible', 'logout'])

// 实时获取用户信息
const storedUsername = computed(() => localStorage.getItem('username') || '')
const storedToken = computed(() => localStorage.getItem('authToken') || '')

// Token掩码处理
const maskedToken = computed(() => {
    if (!storedToken.value) return '无有效令牌'
    return `${storedToken.value.slice(0, 4)}****${storedToken.value.slice(-4)}`
})

// 复制令牌
const copyToken = () => {
    navigator.clipboard.writeText(storedToken.value)
    ElMessage.success('令牌已复制到剪贴板')
}

// 退出登录
const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('username')
    emit('logout')
    handleClose()
}

// 关闭弹窗
const handleClose = () => {
    emit('update:visible', false)
}
</script>

<style scoped>
.user-info-content {
    padding: 20px;
}

.info-item {
    margin: 18px 0;
    display: flex;
    align-items: center;
    min-height: 40px;
}

.label {
    width: 80px;
    color: #606266;
    font-weight: 600;
    flex-shrink: 0;
}

.token-display {
    align-items: flex-start;

    .token-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
        background: #f5f7fa;
        border-radius: 4px;
        padding: 8px 12px;

        .masked-token {
            flex: 1;
            font-family: monospace;
            color: #409eff;
            cursor: pointer;
            word-break: break-all;
        }
    }
}

.action-btns {
    margin-top: 32px;
    text-align: center;
}

.security-tip {
    margin-top: 24px;
}
</style>