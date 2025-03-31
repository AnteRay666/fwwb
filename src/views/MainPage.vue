<!-- MainPage.vue -->
<template>
    <div class="main-layout">
        <div class="header">
            <el-button type="primary" class="login-btn" :icon="User" @click="showAuthModal = true">
                登录/注册
            </el-button>
        </div>
        <RegisterLoginPage v-model:visible="showAuthModal" @success="showAuthModal = false" />

        <div class="content-wrapper">
            <!-- 可拖拽侧边栏 -->
            <div class="sidebar-container" :style="{ width: sidebarWidth + 'px' }"
                :class="{ 'collapsed': isSidebarCollapsed }">
                <SiderPage :is-collapsed="isSidebarCollapsed" @toggle-collapse="toggleSidebar"
                    @start-resize="startResize" />
                <div class="drag-handle" @mousedown.prevent="startResize"></div>
            </div>

            <!-- 主内容区域 -->
            <div class="main-content" :style="{ 'margin-left': sidebarWidth + 'px' }">
                <div v-show="isSidebarCollapsed" class="fold-indicator" @click="toggleSidebar">
                    <el-icon>
                        <Expand />
                    </el-icon>
                </div>
                <ChatWindow :messages="messages" />
            </div>
        </div>

        <!-- 右键菜单 -->
        <ContextMenu v-model:visible="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y"
            :menu-items="contextMenu.items" @select="handleMenuSelect" />
    </div>
</template>


<script setup>
import { ref, provide } from 'vue'
import { User, Expand } from '@element-plus/icons-vue'
import SiderPage from '..//components/Sider/SiderPage.vue'
import ChatWindow from '../components/Chat/ChatWindow.vue'
import RegisterLoginPage from '../components/RegisterLoginPage/RegisterLoginPage.vue'
import ContextMenu from '../components/Sider/ContextMenu.vue'

const messages = ref([])
const showAuthModal = ref(false)
const isSidebarCollapsed = ref(false)
const sidebarWidth = ref(240)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    items: [],
    selectedItem: null
})

provide('sidebarWidth', sidebarWidth)

const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    sidebarWidth.value = isSidebarCollapsed.value ? 64 : 240
}

const startResize = (e) => {
    isResizing.value = true
    startX.value = e.clientX
    startWidth.value = sidebarWidth.value
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
}

const handleResize = (e) => {
    if (!isResizing.value) return
    const delta = e.clientX - startX.value
    const newWidth = Math.min(Math.max(startWidth.value + delta, 200), 400)
    sidebarWidth.value = newWidth
    isSidebarCollapsed.value = false
}

const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
}

const handleMenuSelect = (command) => {
    const item = contextMenu.value.selectedItem
    switch (command) {
        case 'delete':
            // 处理删除逻辑
            break
        case 'rename':
            // 处理重命名逻辑
            break
    }
    contextMenu.value.visible = false
}
</script>

<style scoped>
.main-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    padding: 16px;
    display: flex;
    justify-content: flex-end;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
    flex: 1;
    display: flex;
    position: relative;
}

.sidebar-container {
    position: relative;
    height: 100%;
    background: #f7f7f8;
    transition: width 0.3s ease;
}

.drag-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: col-resize;
    z-index: 100;
    background-color: transparent;
    transition: background-color 0.2s;
}

.drag-handle:hover {
    background-color: var(--el-color-primary);
}

.main-content {
    flex: 1;
    height: calc(100vh - 60px);
    transition: margin-left 0.3s ease;
}


/* 折叠指示器 */
.fold-indicator {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    z-index: 100;
    background: #ffffff;
    padding: 8px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
}

.fold-indicator:hover {
    background: #f5f7fa;
    transform: translateY(-50%) scale(1.1);
}

.main-content {
    height: 100%;
    background: #f8fafc;
    position: relative;
    transition: all 0.3s;
}
</style>