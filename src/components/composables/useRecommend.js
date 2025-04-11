// composables/useRecommend.js
import { ref } from 'vue'
import axios from 'axios'

export function useRecommend() {
    const questions = ref([])
    const references = ref('')

    const loading = ref(false)
    const error = ref(null)
    //根据全局环境变量设置apiurl
    const url = import.meta.env.VITE_API_URL;
    const authToken = localStorage.getItem('authToken')
    // console.log(authToken)
    const getRelatedQuestions = async (content) => {
        try {
            loading.value = true
            error.value = null
            const follow = import.meta.env.VITE_RELATED_QUESTIONS_API;
            const apiurl = url + follow;
            console.log("related_questions apiurl:", apiurl)



            const response = await axios.post(
                apiurl,
                { question: content },
                {
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json'
                    }
                }
            )

            console.log("related_questions:", response.data)

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
    const getRefence_file = async (content) => {
        try {
            loading.value = true
            error.value = null

            const follow = import.meta.env.VITE_REFERENCE_FILES_API;
            const apiurl = url + follow;
            console.log("REFERENCE_FILES apiurl:", apiurl)
            console.log(authToken)


            const response = await axios.post(
                apiurl,
                { question: content },
                {
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json'
                    }
                }
            )
            console.log("reference_files:", response.data)
            if (response.data.code === 1) {
                references.value = response.data.data?.references || ''
                return {
                    success: true,
                    references: references.value
                }
            } else {
                throw new Error(response.data.msg || '获取参考资料失败')
            }
        } catch (err) {
            error.value = err.response?.data?.message || err.message
            references.value = ''
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }

    }


    return {
        getRelatedQuestions,
        getRefence_file,
        questions,
        references,
        loading,
        error
    }
}