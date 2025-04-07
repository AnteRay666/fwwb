<template>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="auth-form" @submit.prevent="handleLogin">
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
import axios from 'axios';
import sha256 from 'crypto-js/sha256';
import { local } from 'd3';

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
                // 表单验证
                const valid = await this.$refs.form.validate();
                if (!valid) return;

                this.isLoading = true;

                // 生成密码哈希
                const passwordHash = sha256(this.form.password).toString();
                console.log("1");
                console.log(passwordHash);
                // 发送登录请求
                const response = await axios.post(
                    'http://114.55.146.90:8080/api/user/login',
                    {
                        username: this.form.username,
                        passwordHash: passwordHash

                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': '*/*',
                            // 注意：浏览器可能会自动处理Connection和Host头
                        },
                        timeout: 5000
                    }
                );
                console.log("23");
                // console.log("完整响应:", response);
                console.log(response.data.data.token);
                // 处理登录成功

                if (response.data?.data?.token) {
                    // 确保payload结构正确
                    localStorage.setItem('authToken', response.data.data.token)
                    localStorage.setItem('username', this.form.username)
                    const payload = {
                        token: response.data.data.token,
                        username: this.form.username
                    }

                    // 添加调试日志
                    console.log('[LoginPage] 触发success事件', payload)

                    this.$emit('success', payload)  // 确保触发带参数的事件
                    this.$message.success('登录成功！')
                }
            } catch (error) {
                let errorMessage = '登录失败，请重试';
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            errorMessage = '请求参数错误：' +
                                (error.response.data.message || '请检查输入格式');
                            break;
                        case 401:
                            errorMessage = '用户名或密码错误';
                            break;
                        case 500:
                            errorMessage = '服务器内部错误，请稍后再试';
                            break;
                    }
                } else if (error.request) {
                    errorMessage = '无法连接到服务器，请检查网络连接';
                }
                this.$message.error(errorMessage);

            } finally {
                this.isLoading = false;
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