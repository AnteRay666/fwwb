<template>
    <el-dialog :model-value="visible" @update:modelValue="handleDialogUpdate" width="30%" top="10vh">
        <!-- 头部模板保持不变 -->

        <!-- 修改组件切换逻辑 -->
        <div class="component-container">
            <LoginPage v-if="currentForm === 'login'" @success="handleSuccess"
                @switch-form="currentForm = 'register'" />
            <RegisterPage v-else @success="handleRegisterSuccess" @switch-form="currentForm = 'login'" />
        </div>

        <!-- 底部模板保持不变 -->
    </el-dialog>
</template>

<script>
import LoginPage from './LoginPage.vue'
import RegisterPage from './RegisterPage.vue'

export default {
    components: {
        LoginPage,
        RegisterPage
    },
    props: {
        visible: Boolean
    },
    data() {
        return {
            currentForm: 'login'
        }
    },
    methods: {
        toggleForm() {
            this.currentForm = this.currentForm === 'login' ? 'register' : 'login'
        },
        handleSuccess(payload) {  // 添加参数接收
            this.$emit('success', payload)  // 传递登录数据
            this.closeModal()
        },
        closeModal() {
            this.currentForm = 'login'
            this.$emit('update:visible', false)
        },
        handleRegisterSuccess(payload) {
            this.registerData = {
                username: payload.username,
                password: payload.password
            }
            this.currentForm = 'login'
        },
        // 修改对话框关闭逻辑
        handleDialogUpdate(value) {
            if (!value) this.resetFormState()
            this.$emit('update:visible', value)
        },

        // 新增表单状态重置方法
        resetFormState() {
            this.currentForm = 'login'
            // 通过ref重置子组件表单（需要给子组件添加ref）
            if (this.$refs.loginForm) this.$refs.loginForm.resetFields()
            if (this.$refs.registerForm) this.$refs.registerForm.resetFields()
        }
    }
}

</script>
<script setup>
// 修正事件定义
defineEmits(['update:visible', 'success'])
</script>
<style scoped>
.component-container {
    min-height: 300px;
    /* 保持内容高度稳定 */
}
</style>
