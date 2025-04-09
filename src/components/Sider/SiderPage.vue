<template>
  <div class="sider-container" :class="{ 'collapsed': isCollapsed }">
    <!-- 折叠状态 -->
    <div v-show="isCollapsed" class="collapsed-mode">
      <div class="icon-wrapper">
        <div class="icon-group">
          <el-tooltip content="展开" placement="right">
            <el-button class="icon-btn" @click="$emit('toggle')">
              <el-icon>
                <Expand />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>
        <div class="icon-group">
          <!-- 统一使用icon-btn样式 -->
          <el-tooltip content="新对话" placement="right">
            <el-button class="icon-btn" @click="startNewChat">
              <el-icon>
                <Plus />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>
        <div class="settings-btn">
          <el-tooltip content="设置" placement="right">
            <el-button class="icon-btn" @click="openSettings">
              <el-icon>
                <Setting />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <!-- 展开状态 -->
    <div v-show="!isCollapsed" class="expanded-mode">
      <!-- 统一使用icon-btn样式 -->
      <el-button class="icon-btn collapse-btn" @click="$emit('toggle')">
        <el-icon>
          <Fold />
        </el-icon>
      </el-button>
      <div class="new-chat-btn">
        <el-button type="primary" round @click="startNewChat" class="full-width-btn">
          <el-icon class="mr-2">
            <Plus />
          </el-icon>
          新对话
        </el-button>
      </div>

      <div class="header">
        <span class="title">对话历史</span>
      </div>

      <div class="history-list">
        <el-scrollbar>
          <el-menu>
            <!-- 今天 -->
            <template v-if="chatStore.categorizedHistory.today.length">
              <el-menu-item-group title="今天">
                <el-menu-item v-for="item in chatStore.categorizedHistory.today" :key="item.id" :index="item.id"
                  class="history-item" @click="handleSelect(item)">
                  <el-icon>
                    <ChatDotRound />
                  </el-icon>
                  <span class="truncate">{{ item.title }}</span>
                </el-menu-item>
              </el-menu-item-group>
            </template>

            <!-- 昨天 -->
            <template v-if="chatStore.categorizedHistory.yesterday.length">
              <el-menu-item-group title="昨天">
                <el-menu-item v-for="item in chatStore.categorizedHistory.yesterday" :key="item.id" :index="item.id"
                  class="history-item" @click="handleSelect(item)">
                  <el-icon>
                    <ChatDotRound />
                  </el-icon>
                  <span class="truncate">{{ item.title }}</span>
                </el-menu-item>
              </el-menu-item-group>
            </template>

            <!-- 最近7天 -->
            <template v-if="chatStore.categorizedHistory.last7Days.length">
              <el-menu-item-group title="最近7天">
                <el-menu-item v-for="item in chatStore.categorizedHistory.last7Days" :key="item.id" :index="item.id"
                  class="history-item" @click="handleSelect(item)">
                  <el-icon>
                    <ChatDotRound />
                  </el-icon>
                  <span class="truncate">{{ item.title }}</span>
                </el-menu-item>
              </el-menu-item-group>
            </template>

            <!-- 最近30天 -->
            <template v-if="chatStore.categorizedHistory.last30Days.length">
              <el-menu-item-group title="最近30天">
                <el-menu-item v-for="item in chatStore.categorizedHistory.last30Days" :key="item.id" :index="item.id"
                  class="history-item" @click="handleSelect(item)">
                  <el-icon>
                    <ChatDotRound />
                  </el-icon>
                  <span class="truncate">{{ item.title }}</span>
                </el-menu-item>
              </el-menu-item-group>
            </template>

            <el-empty v-if="!hasHistory" description="暂无历史记录" :image-size="100" />
          </el-menu>

        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Fold, Expand, Plus, Setting, User, ChatDotRound } from '@element-plus/icons-vue'
import { onMounted, computed, ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { ElMessage } from 'element-plus'
defineProps({
  isCollapsed: Boolean
})
const conversationHistory = ref()
const chatStore = useChatStore()

const handleSelect = async (item) => {
  try {
    // 获取并转换历史记录
    const history = await chatStore.getconversationList(item.id)
    console.log(history)
    // 注入到当前会话
    // messages.value = history
    conversationHistory.value = history

    // 持久化当前会话
    localStorage.setItem('currentConversation', JSON.stringify(history))
    console.log(localStorage.getItem('currentConversation'))
  } catch (error) {
    ElMessage.error('加载历史对话失败: ' + error.message)
  }
}

const hasHistory = computed(() => {
  const hasData = Object.values(chatStore.categorizedHistory).some(cat => cat.length > 0)
  console.log('是否有历史数据:', hasData)
  return hasData
})

onMounted(async () => {
  console.log('组件挂载，开始获取历史记录...')
  try {
    await chatStore.fetchChatHistory()
    console.log('获取到的分类数据:', chatStore.categorizedHistory)
  } catch (error) {
    console.error('获取历史记录失败:', error)
  }
})
const startNewChat = () => {


}
const openSettings = () => {


}



</script>

<style scoped lang="scss">
.sider-container {
  height: 100%;
  background: #f7f7f8;
  border-right: 1px solid #e4e7ed;
  transition: all 0.3s ease;

  /* 统一图标按钮样式 */
  .icon-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px auto;
    transition: all 0.2s;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .el-icon {
      font-size: 18px;
      color: #606266;
    }
  }

  /* 折叠状态样式 */
  .collapsed-mode {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;

    .icon-wrapper {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .icon-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: auto;
    }

    .user-btn {
      margin-top: auto;
      padding-bottom: 40px;
    }

    .settings-btn {
      margin-top: auto;
      padding-bottom: 60px;
    }
  }

  /* 展开状态样式 */
  .expanded-mode {
    padding: 20px;

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;

      .title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        flex: 1;
      }
    }

    .full-width-btn {
      width: 100%;
      padding: 12px 20px;
      margin-bottom: 20px;
      border-radius: 24px;
      font-weight: 500;
    }

    .history-list {
      :deep(.el-menu) {
        border: none;

        .el-menu-item {
          height: 40px;
          line-height: 40px;
          margin: 4px 0;
          border-radius: 8px;
          padding-left: 16px !important;
          transition: all 0.2s;

          &:hover {
            background: #f0f2f5;
          }

          &.is-active {
            background: #e6f4ff;
            color: #409EFF;

            .el-icon {
              color: #409EFF;
            }
          }

          .truncate {
            max-width: 160px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-left: 12px;
          }
        }
      }
    }
  }
}
</style>

<style>
/* 添加以下样式 */
.history-menu {
  border-right: none !important;
}

.history-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
}

.history-list {
  height: calc(100vh - 160px);
  /* 根据实际布局调整 */
}
</style>