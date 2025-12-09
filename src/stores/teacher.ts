import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ClassInfo, StudentScore, ClassStatistics } from '@/types'

export const useTeacherStore = defineStore('teacher', () => {
  const classList = ref<ClassInfo[]>([])
  const currentClass = ref<ClassInfo | null>(null)
  const studentScores = ref<StudentScore[]>([])
  const classStats = ref<ClassStatistics | null>(null)

  // 获取教师的班级列表
  const fetchClassList = async () => {
    // TODO: 调用后端接口
    // const data = await api.getTeacherClasses()
    // classList.value = data
  }

  // 获取班级学生成绩
  const fetchStudentScores = async (classId: string) => {
    // TODO: 调用后端接口
    // const data = await api.getStudentScores(classId)
    // studentScores.value = data
  }

  // 获取班级统计数据
  const fetchClassStatistics = async (classId: string) => {
    // TODO: 调用后端接口
    // const data = await api.getClassStatistics(classId)
    // classStats.value = data
  }

  // 导出班级成绩表格
  const exportClassScores = async (classId: string) => {
    // TODO: 调用后端接口导出Excel
    // await api.exportClassScores(classId)
  }

  return {
    classList,
    currentClass,
    studentScores,
    classStats,
    fetchClassList,
    fetchStudentScores,
    fetchClassStatistics,
    exportClassScores
  }
})
