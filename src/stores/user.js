// stores/user.js
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
    state: () => ({
        isLoggedIn: !!localStorage.getItem('authToken'),
        username: localStorage.getItem('username') || '匿名用户',
        AuthToken: localStorage.getItem('authToken') || '',
        showAuthModal: false,  // 登录弹窗状态
        showUserInfo: false    // 用户信息弹窗状态
    }),
    actions: {
        // 切换认证弹窗
        toggleAuthModal(visible) {
            this.showAuthModal = visible
        },

        // 显示用户信息弹窗
        showUserInfoDialog() {
            this.showUserInfo = true
        },

        // 处理退出登录
        handleLogout() {
            // 强制同步清除
            localStorage.clear()

            // 重置 Store 状态
            this.$reset() // 或手动重置
            this.isLoggedIn = false
            this.username = '匿名用户'

            // 添加调试日志
            console.log('[Logout] LocalStorage已清除:',
                localStorage.getItem('authToken'),
                localStorage.getItem('username')
            )
        },
        // 处理登录成功
        handleAuthSuccess(data) {
            // 强制同步更新
            this.$patch({
                isLoggedIn: true,
                username: data.username,
                showAuthModal: false
            })

            // 添加状态验证
            console.log('[Pinia] 当前弹窗状态:', this.showAuthModal)
        }
    }
})