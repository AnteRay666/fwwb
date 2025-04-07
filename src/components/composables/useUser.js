// composables/useUser.js
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

export function useUser() {

    const isLoggedIn = ref(!!localStorage.getItem('authToken'))
    const username = ref(localStorage.getItem('username') || '匿名用户')
    const showAuthModal = ref(false)
    const showUserInfo = ref(false)

    const checkLoginStatus = () => {
        isLoggedIn.value = !!localStorage.getItem('authToken')
        username.value = localStorage.getItem('username') || '匿名用户'
    }

    const handleLogout = () => {
        localStorage.clear()
        showUserInfo.value = false
        checkLoginStatus()
        ElMessage.success('已退出登录')
    }

    const handleAuthSuccess = (data) => {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('username', data.username)
        checkLoginStatus()
        ElMessage.success(`欢迎回来，${data.username}！`)
    }

    watch(
        () => localStorage.getItem('authToken'),
        checkLoginStatus
    )

    return {
        isLoggedIn,
        username,
        showAuthModal,
        showUserInfo,
        handleLogout,
        handleAuthSuccess,
        checkLoginStatus
    }
}