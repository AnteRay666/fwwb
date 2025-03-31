import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'

// 移除登录注册路由，只保留主路由
const routes = [
    {
        path: '/',
        name: 'Main',
        component: MainPage
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router