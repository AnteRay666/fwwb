<template>
    <el-form :model="form" label-width="100px" class="auth-form">
        <h2 class="form-title">用户注册</h2>

        <el-form-item label="用户名" required>
            <el-input v-model="form.username" placeholder="4-16位字母数字组合" clearable />
        </el-form-item>

        <el-form-item label="密码" required>
            <el-input v-model="form.password" type="password" placeholder="至少6位字符" show-password />
        </el-form-item>

        <el-form-item label="确认密码" required>
            <el-input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" show-password />
        </el-form-item>

        <el-button type="success" class="submit-btn" @click="handleRegister">
            立即注册
        </el-button>

        <div class="form-footer">
            <el-link type="info" @click="$emit('switch-form')">
                已有账号？去登录
            </el-link>
        </div>
    </el-form>
</template>

<script>
export default {
    data() {
        return {
            form: {
                username: '',
                password: '',
                confirmPassword: ''
            }
        }
    },
    methods: {
        // 保留原有注册逻辑，添加表单验证
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