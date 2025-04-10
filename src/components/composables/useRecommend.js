// composables/useRecommend.js
import { ref } from 'vue'
import axios from 'axios'

export function useRecommend() {
    const questions = ref([])
    const loading = ref(false)
    const error = ref(null)

    const getRelatedQuestions = async (content) => {
        try {
            loading.value = true
            error.value = null
            const authToken = localStorage.getItem('authToken')
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.post(
                apiUrl + '/api.example.com/v1/related_questions',
                { question: content },
                {
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json'
                    }
                }
            )
            console.log(response.data)

            if (response.data.code === 1) {
                questions.value = response.data.data?.relatedQuestions || []
            } else {
                throw new Error(response.data.msg || '获取相关问题失败')
            }
            return {
                success: true,
                questions: response.data.data?.relatedQuestions || []
            }


        } catch (err) {
            error.value = err.response?.data?.message || err.message
            questions.value = []
        } finally {
            loading.value = false
        }
    }

    return {
        getRelatedQuestions,
        questions,
        loading,
        error
    }
}