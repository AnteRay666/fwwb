<template>
    <el-dialog :model-value="visible" @update:modelValue="$emit('update:visible', $event)" width="30%" top="10vh">
        <!-- 头部模板保持不变 -->

        <!-- 修改组件切换逻辑 -->
        <div class="component-container">
            <LoginPage v-if="currentForm === 'login'" @success="handleSuccess"
                @switch-form="currentForm = 'register'" />
            <RegisterPage v-else @success="handleSuccess" @switch-form="currentForm = 'login'" />
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
        handleSuccess() {
            this.$emit('success')
            this.closeModal()
        },
        closeModal() {
            this.currentForm = 'login'
            this.$emit('update:visible', false)
        }
    }
}
</script>

<style>
.component-container {
    min-height: 300px;
    /* 保持内容高度稳定 */
}
</style>