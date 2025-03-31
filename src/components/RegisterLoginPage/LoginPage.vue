<template>
    <el-form :model="form" :rules="rules" label-width="80px" class="auth-form" @submit.prevent="handleLogin">
        <h2 class="form-title">用户登录</h2>

        <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" clearable autocomplete="off" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password autocomplete="off" />
        </el-form-item>

        <el-button type="primary" class="submit-btn" native-type="submit" :loading="isLoading">
            立即登录
        </el-button>

        <div class="form-footer">
            <el-link type="primary" @click="$emit('switch-form')">
                没有账号？立即注册
            </el-link>
        </div>
    </el-form>
</template>

<script>
export default {
    data() {
        return {
            isLoading: false,
            form: {
                username: '',
                password: ''
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        async handleLogin() {
            try {
                this.isLoading = true
                await new Promise(resolve => setTimeout(resolve, 1000))
                this.$emit('success')
            } finally {
                this.isLoading = false
            }
        }
    }
}
</script>

<style scoped>
.auth-form {
    padding: 30px 20px;
    max-width: 380px;
    margin: 0 auto;
}

.form-title {
    text-align: center;
    margin-bottom: 25px;
    font-size: 24px;
    color: #303133;
}

.el-form-item {
    margin-bottom: 24px;
}

.el-input {
    width: 100%;
}

.submit-btn {
    width: 100%;
    height: 48px;
    margin-top: 20px;
    border-radius: 8px;
    font-size: 16px;
    transition: transform 0.2s;
}

.submit-btn:hover {
    transform: translateY(-2px);
}

.form-footer {
    margin-top: 25px;
    text-align: center;
}
</style>