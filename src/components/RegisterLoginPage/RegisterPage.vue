<!-- RegisterPage.vue -->
<template>
    <el-form :model="form" :rules="rules" label-width="100px" class="auth-form" @submit.prevent="handleRegister">
        <h2 class="form-title">用户注册</h2>

        <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="4-16位字母数字组合" clearable autocomplete="off" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="至少6位字符" show-password autocomplete="off" />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" show-password
                autocomplete="off" />
        </el-form-item>

        <el-button type="success" class="submit-btn" native-type="submit" :loading="isLoading">
            立即注册
        </el-button>

        <div class="form-footer">
            <el-link type="primary" @click="$emit('switch-form')">
                已有账号？去登录
            </el-link>
        </div>
    </el-form>
</template>

<script>
export default {
    data() {
        const validatePass = (rule, value, callback) => {
            if (value !== this.form.password) {
                callback(new Error('两次输入密码不一致'))
            } else {
                callback()
            }
        }

        return {
            isLoading: false,
            form: {
                username: '',
                password: '',
                confirmPassword: ''
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 4, max: 16, message: '长度在4到16个字符', trigger: 'blur' },
                    { pattern: /^[a-zA-Z0-9]+$/, message: '只能包含字母和数字', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, message: '至少6个字符', trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, message: '请确认密码', trigger: 'blur' },
                    { validator: validatePass, trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        async handleRegister() {
            this.isLoading = true
            try {
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

.el-input__inner {
    height: 48px;
    border-radius: 8px;
}

.submit-btn {
    width: 100%;
    height: 48px;
    margin-top: 20px;
    border-radius: 8px;
    font-size: 16px;
}

.form-footer {
    margin-top: 25px;
    text-align: center;
}
</style>