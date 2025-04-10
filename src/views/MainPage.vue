<!-- MainPage.vue-->

<template>
    <!-- 主体容器 -->
    <div class="flex-container">
        <!-- 侧边栏 -->
        <aside class="sidebar" :class="{ 'collapsed': isSidebarCollapsed }"
            :style="{ width: isSidebarCollapsed ? '64px' : '280px' }">
            <SiderPage :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar"
                @menu-item-click="handleMenuItemClick" />
        </aside>
        <!-- 主内容区 -->
        <main class="content">
            <ChatWindow :messages="messages" />
        </main>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import SiderPage from '../components/Sider/SiderPage.vue'
import ChatWindow from '../components/Chat/ChatWindow.vue'

import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
const route = useRoute()
const chatStore = useChatStore()

// 当路由变化时更新当前会话ID
watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            chatStore.setCurrentConversationId(newId)
        }
    },
    { immediate: true }
)

const messages = ref([])

const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const handleMenuItemClick = (menuItem) => {
    console.log('Menu item clicked:', menuItem)
}
</script>

<style>
.flex-container {
    flex: 1;
    height: 100%;
    display: flex;
    overflow: hidden;
}

.header {
    height: 60px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    z-index: 1000;

    .login-btn {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
}

.sidebar {
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 64px;
}

.content {
    flex: 1;
    padding: 0;
    background: #ffffff;
    border-left: 1px solid #e4e7ed;
    overflow: hidden;
    /* 防止内容溢出 */
}
</style>