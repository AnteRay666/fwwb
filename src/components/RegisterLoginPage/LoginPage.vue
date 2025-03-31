<template>
    <el-form :model="form" label-width="80px" class="auth-form">
        <h2 class="form-title">用户登录</h2>
        <!-- 添加缺失的el-form-item包裹结构 -->'
        <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" clearable />
        </el-form-item>

        <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-button type="primary" class="submit-btn" @click="handleLogin">
            立即登录
        </el-button>

        <div class="form-footer">
            <el-link type="info" @click="$emit('switch-form')">
                没有账号？立即注册
            </el-link>
        </div>
    </el-form>
</template>

<script>
// 添加必要的Element组件导入
import { ElForm, ElFormItem, ElInput, ElButton, ElLink } from 'element-plus'

export default {
    components: {
        ElForm: ElForm,
        ElFormItem: ElFormItem,
        ElInput: ElInput,
        ElButton: ElButton,
        ElLink: ElLink
    },
    data() {
        return {
            form: {  // 修复数据结构嵌套问题
                username: '',
                password: ''
            }
        }
    },
    methods: {
        async handleLogin() {
            // 保持原有逻辑
        }
    }
}
</script>

<style scoped>
.auth-form {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
}

.form-content {
    padding: 20px 40px;
}

.centered-input {
    width: 100%;
}

:deep(.el-form-item__label) {
    justify-content: center !important;
}

.submit-btn {
    width: 100%;
    margin-top: 30px;
    padding: 12px 24px;
    font-size: 16px;
    transition: all 0.3s;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(66, 185, 131, 0.3);
}

.form-footer {
    margin-top: 25px;
    text-align: center;
}

.switch-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.highlight {
    color: #42b983;
    font-weight: 500;
    transition: color 0.3s;
}

.highlight:hover {
    color: #3aa876;
}

.form-title {
    text-align: center;
    font-size: 24px;
    color: #303133;
    margin-bottom: 40px;
    position: relative;
    padding-bottom: 10px;
}

.form-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: #42b983;
    border-radius: 2px;
}
</style>