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
import { ref } from 'vue'
import SiderPage from '../components/Sider/SiderPage.vue'
import ChatWindow from '../components/Chat/ChatWindow.vue'


const messages = ref([])

const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const handleMenuItemClick = (menuItem) => {
    console.log('Menu item clicked:', menuItem)
}
</script>

<style lang="scss">
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

.flex-container {
    flex: 1;
    height: 100%;
    display: flex;
    overflow: hidden;
    -ms-overflow-style: none;
}

.sidebar {
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    // border-right: 1px solid #2a3f54;
    min-width: 64px;
}

.content {
    flex: 1;
    padding: 0px;
    background: #ffffff;
    border-left: 1px solid #e4e7ed;
    overflow-y: auto;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-left: 0;
}
</style>