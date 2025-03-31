<!-- SiderPage.vue -->
<template>
  <div class="sider-container">
    <!-- 折叠状态 -->
    <div v-show="isCollapsed" class="collapsed-content">
      <div class="icon-group">
        <el-tooltip content="新对话" placement="right">
          <el-button class="icon-btn" @click="startNewChat">
            <el-icon>
              <Plus />
            </el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip content="展开侧边栏" placement="right">
          <el-button class="icon-btn" @click="$emit('toggle-collapse')">
            <el-icon>
              <Expand />
            </el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip content="设置" placement="right">
          <el-button class="icon-btn" @click="openSettings">
            <el-icon>
              <Setting />
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 展开状态 -->
    <div v-show="!isCollapsed" class="expanded-content">
      <div class="header-bar">
        <el-input v-model="searchQuery" placeholder="搜索历史记录" clearable suffix-icon="Search" class="search-input" />
        <el-button class="collapse-btn" @click="$emit('toggle-collapse')">
          <el-icon>
            <Fold />
          </el-icon>
        </el-button>
      </div>

      <div class="new-chat-btn">
        <el-button type="primary" round @click="startNewChat">
          <el-icon>
            <Plus />
          </el-icon>
          <span>新对话</span>
        </el-button>
      </div>

      <div class="history-list">
        <el-scrollbar>
          <el-menu :default-active="activeIndex" @select="handleSelect" class="history-menu">
            <el-menu-item v-for="item in filteredHistory" :key="item.id" :index="item.id"
              @contextmenu.prevent="openContextMenu($event, item)">
              <el-icon>
                <ChatDotRound />
              </el-icon>
              <span class="truncate-text">{{ item.title }}</span>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { Plus, Fold, Expand, Setting, ChatDotRound } from '@element-plus/icons-vue'

const props = defineProps({
  isCollapsed: Boolean
})

const emit = defineEmits(['toggle-collapse', 'start-resize'])

const searchQuery = ref('')
const activeIndex = ref('')
const chatHistory = ref([
  { id: '1', title: '如何学习Vue3' },
  { id: '2', title: 'Python数据分析' },
  { id: '3', title: '项目需求讨论' }


]) // 保持原有数据

const filteredHistory = computed(() => {
  return chatHistory.value.filter(item =>
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const openContextMenu = (e, item) => {
  emit('open-context-menu', {
    x: e.clientX,
    y: e.clientY,
    items: [
      { command: 'delete', label: '删除对话' },
      { command: 'rename', label: '重命名' }
    ],
    item
  })
}

// 其他方法保持原有逻辑...
</script>

<!-- 样式部分保持原有优化 -->
<style scoped>
.sider-container {
  --collapsed-width: 64px;
  --expanded-width: 240px;
  height: 100%;
  background: #f7f7f8;
  transition: width 0.3s ease;
}

/* 折叠状态样式 */
.sider-container.collapsed {
  width: var(--collapsed-width);
}

.collapsed-content {
  padding: 12px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.icon-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 8px;
}

/* 展开状态样式 */
.sider-container:not(.collapsed) {
  width: var(--expanded-width);
}

.expanded-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
}

.title {
  font-size: 16px;
  font-weight: 500;
}

.collapse-btn {
  padding: 6px;
  border: none;
}

.new-chat-btn :deep(.el-button) {
  width: 100%;
  justify-content: center;
  margin-bottom: 16px;
  padding: 10px 16px;
}

.history-list {
  flex: 1;
  overflow: hidden;
}

.history-menu {
  border-right: none;
}

.history-menu :deep(.el-menu-item) {
  height: 40px;
  margin: 4px 0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-menu :deep(.el-menu-item:hover) {
  background-color: #ededed;
}

.history-menu :deep(.el-menu-item.is-active) {
  background-color: #e6f0ff;
}

.truncate-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>