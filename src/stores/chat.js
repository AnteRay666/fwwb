// stores/chat.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useChatStore = defineStore('chat', () => {
    const chatHistory = ref([])
    const conversationList = ref()

    const categorizedHistory = computed(() => {
        console.log('重新计算分类...')
        const now = new Date()
        console.log('当前时间:', now.toISOString())
        const categories = {
            today: [],
            yesterday: [],
            last7Days: [],
            last30Days: []
        }

        chatHistory.value.forEach(item => {
            const itemDate = new Date(item.time)
            const diffDays = getDayDiff(itemDate, now)

            if (diffDays === 0) {
                categories.today.push(item)
            } else if (diffDays === 1) {
                categories.yesterday.push(item)
            } else if (diffDays <= 7) {
                categories.last7Days.push(item)
            } else if (diffDays <= 30) {
                categories.last30Days.push(item)
            }
        })

        // 对每个分类排序（最新在前）
        Object.values(categories).forEach(cat => {
            cat.sort((a, b) => new Date(b.time) - new Date(a.time))
        })
        console.log('最终分类结果:', categories)
        return categories
    })

    // 计算日期差函数
    const getDayDiff = (itemDate, currentDate) => {
        const utc1 = Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
        )
        const utc2 = Date.UTC(
            itemDate.getFullYear(),
            itemDate.getMonth(),
            itemDate.getDate()
        )
        const diffDays = Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const fetchChatHistory = async () => {
        try {
            console.log('开始获取聊天记录...')
            const authToken = localStorage.getItem('authToken')
            if (!authToken) {
                console.error('未找到授权令牌')
                return
            }

            const response = await axios({
                method: 'get',
                url: 'http://114.55.146.90:8080/api/record/list',
                headers: {
                    'Authorization': authToken,
                }
            })

            if (response.data.code === 1) {
                console.log('原始响应数据:', response.data.data)
                chatHistory.value = response.data.data.map(item => {
                    const converted = {
                        id: String(item.id),
                        title: item.recordName,
                        time: item.lastChatTime
                    }
                    // console.log('转换记录:', converted)
                    return converted
                })
            }
        } catch (error) {
            console.error('获取失败:', error)
        }
    }

    const getconversationList = async (id) => {
        try {
            const authToken = localStorage.getItem('authToken')
            if (!authToken) {
                console.error('未找到授权令牌')
                return
            }
            const response = await axios({
                method: 'get',
                url: `http://114.55.146.90:8080/api/record/getAll/${id}`,
                headers: {
                    'Authorization': authToken,
                }
            })
            console.log('原始响应数据:', response.data.data)
            console.log("1")
            if (response.data.code === 1) {
                // 转换数据结构
                const converted = response.data.data.conversationList.map(item => ({
                    role: 'user',
                    content: item.question,
                    timestamp: new Date().getTime() // 根据实际返回时间字段调整
                })).concat(response.data.data.conversationList.map(item => ({
                    role: 'assistant',
                    content: item.recordContent,
                    timestamp: new Date().getTime() + 1000 // 假设AI回复稍晚
                })))
                conversationList.value = converted
                console.log('转换后的对话列表:', converted)
                return converted
            }

            console.log("2")
        } catch (error) {
            console.error('获取失败:', error)
        }
    }


    return { chatHistory, fetchChatHistory, categorizedHistory, getconversationList }
})