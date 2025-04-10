<!-- UserInfo.vue -->
<template>
    <div class="user-info-container">
        <div v-if="isLoggedIn" class="user-info-wrapper">
            <el-button class="user-btn" @click="userStore.showUserInfoDialog()">
                <el-icon>
                    <User />
                </el-icon>
                <span class="username">{{ username }}</span>
            </el-button>
            <div class="ccname-container">{{ ccname || "未命名会话" }}</div>
        </div>
        <div v-else class="auth-buttons">
            <el-button type="primary" @click="userStore.toggleAuthModal(true)">
                登录/注册
            </el-button>
        </div>
        <RegisterLoginPage v-model:visible="userStore.showAuthModal" @success="handleAuthSuccess"
            @hook:mounted="handleMounted" />
        <UserInfoDialog v-model:visible="userStore.showUserInfo" :username="username"
            @logout="userStore.handleLogout()" />
    </div>

</template>

<script setup>
import { storeToRefs } from 'pinia'
import { User } from '@element-plus/icons-vue'
import UserInfoDialog from '../RegisterLoginPage/UserInfoDialog.vue'
import RegisterLoginPage from '../RegisterLoginPage/RegisterLoginPage.vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
// const ccname = localStorage.getItem('ccname')
// 使用 storeToRefs 保持响应式
const { isLoggedIn, username } = storeToRefs(userStore)

const handleAuthSuccess = (payload) => {
    // console.log('[UserInfo] 收到登录数据:', payload)
    userStore.handleAuthSuccess(payload)
}
const props = defineProps({
    ccname: String  // 添加 prop 定义
})
const handleMounted = () => {
    console.log('RegisterLoginPage 已挂载') // 调试用
}
</script>

<style scoped>
.user-info-wrapper {
    display: flex;
    align-items: center;
    margin: 10px;
}

.ccname-container {
    flex-grow: 1;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
}

.auth-buttons {
    margin: 10px;
}
</style>
