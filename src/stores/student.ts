import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StudentScore, HistoryRecord, LearningResource } from '@/types'

export const useStudentStore = defineStore('student', () => {
  const currentScore = ref<StudentScore | null>(null)
  const historyRecords = ref<HistoryRecord[]>([])
  const learningResources = ref<LearningResource[]>([])

  // 获取当前考试成绩
  const fetchCurrentScore = async () => {
    // TODO: 调用后端接口
    // const data = await api.getCurrentScore()
    // currentScore.value = data
  }

  // 获取历史成绩
  const fetchHistoryRecords = async () => {
    // TODO: 调用后端接口
    // const data = await api.getHistoryRecords()
    // historyRecords.value = data
  }

  // 获取学习资源
  const fetchLearningResources = async () => {
    // TODO: 调用后端接口
    // const data = await api.getLearningResources()
    // learningResources.value = data
  }

  return {
    currentScore,
    historyRecords,
    learningResources,
    fetchCurrentScore,
    fetchHistoryRecords,
    fetchLearningResources
  }
})
