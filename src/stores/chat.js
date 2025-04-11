// stores/chat.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useChatStore = defineStore('chat', () => {
    const chatHistory = ref([])
    const conversationList = ref()
    const currentConversationName = ref(localStorage.getItem('ccname') || '未命名会话')
    const currentConversationId = ref(null)

    const categorizedHistory = computed(() => {
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

    //根据全局环境变量设置apiurl
    const url = import.meta.env.VITE_API_URL;

    const fetchChatHistory = async () => {
        try {
            console.log('开始获取聊天记录...')
            const authToken = localStorage.getItem('authToken')
            if (!authToken) {
                console.error('未找到授权令牌')
                return
            }

            const follow = import.meta.env.VITE_HISTORTY_LIST_API;
            const apiurl = url + follow;
            console.log("ChatHistory apiurl:", apiurl)



            const response = await axios({
                method: 'get',
                url: apiurl,
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

            const follow = import.meta.env.VITE_HISTORY_GETBYID_API;
            const apiurl = url + follow;
            console.log("HconversationList apiurl:", apiurl)

            const response = await axios({
                method: 'get',
                url: apiurl + `/${id}`,
                headers: {
                    'Authorization': authToken,
                }
            })
            console.log('原始响应数据:', response.data.data)
            console.log("1")
            if (response.data.code === 1) {
                console.log("2")

                const converted = response.data.data.conversationList.map(item => ({
                    role: 'user',
                    content: item.question,
                    timestamp: item.recordTime
                })).concat(response.data.data.conversationList.map(item => ({
                    role: 'assistant',
                    content: item.recordContent,
                    timestamp: item.recordTime
                })))
                conversationList.value = converted

                localStorage.setItem('ccid', response.data.data.id)
                localStorage.setItem('ccname', response.data.data.recordName)
                console.log('转换后的对话列表:', converted)
                return {
                    recordName: response.data.data.recordName,
                    converted
                }
            }

            console.log("2")
        } catch (error) {
            console.error('获取失败:', error)
        }
    }



    const setCurrentConversationId = (id) => {
        currentConversationId.value = id
        localStorage.setItem('current_conversation_id', id)
    }

    const getCurrentConversationId = () => {
        return currentConversationId.value || localStorage.getItem('current_conversation_id')
    }


    const setCurrentConversationName = (name) => {
        currentConversationName.value = name
        localStorage.setItem('ccname', name)
    }



    // 获取当前对话名称
    const getCurrentConversationName = () => {
        return currentConversationName.value
    }

    return {
        chatHistory, categorizedHistory,
        fetchChatHistory,
        getconversationList,
        getCurrentConversationId,
        setCurrentConversationId,
        currentConversationName,
        setCurrentConversationName,
        getCurrentConversationName
    }
})