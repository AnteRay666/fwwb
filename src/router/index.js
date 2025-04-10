// router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'

const routes = [
    {
        path: '/',
        name: 'Main',
        component: MainPage
    },
    {
        path: '/chat/:id',
        name: 'ChatDetail',
        component: MainPage // 复用主布局
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})
// import { useChatStore } from '@/stores/chat'
// const chatStore = useChatStore()
// router.beforeEach(async (to) => {
//     if (to.name === 'ChatDetail') {
//         const exists = await chatStore.checkConversationExists(to.params.id)
//         if (!exists) return '/'
//     }
// })
export default router