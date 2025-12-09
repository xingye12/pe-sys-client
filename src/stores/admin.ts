import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ClassInfo, ExamTask, VideoFile } from '@/types'

export const useAdminStore = defineStore('admin', () => {
  const allClasses = ref<ClassInfo[]>([])
  const examTasks = ref<ExamTask[]>([])
  const uploadProgress = ref<number>(0)

  // 获取所有班级信息
  const fetchAllClasses = async () => {
    // TODO: 调用后端接口
    // const data = await api.getAllClasses()
    // allClasses.value = data
  }

  // 发布考试任务
  const publishExamTask = async (task: ExamTask) => {
    // TODO: 调用后端接口
    // await api.publishExamTask(task)
  }

  // 批量上传视频
  const uploadVideos = async (files: File[], classId: string) => {
    // TODO: 调用后端接口，实现分片上传
    // await api.uploadVideos(files, classId, (progress) => {
    //   uploadProgress.value = progress
    // })
  }

  // 智能分析视频
  const analyzeVideo = async (videoId: string) => {
    // TODO: 调用AI分析接口
    // const result = await api.analyzeVideo(videoId)
    // return result
  }

  return {
    allClasses,
    examTasks,
    uploadProgress,
    fetchAllClasses,
    publishExamTask,
    uploadVideos,
    analyzeVideo
  }
})
