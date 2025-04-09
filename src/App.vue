<template>
  <MainPage />
</template>

<script setup>
import MainPage from './views/MainPage.vue'


</script>
<script>
import { useUserStore } from './stores/user'
import { useChatMessages } from '@/components/composables/useChatMessages'
import { onMounted } from 'vue'


const { loadHistory } = useChatMessages()
export default {
  setup() {
    const userStore = useUserStore()

    // 确保没有在初始化时重新写入
    if (!userStore.isLoggedIn) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('username')
    }
  }
}
onMounted(() => {
  loadHistory()
})

</script>