export interface ClassInfo {
  id: string
  name: string
  grade: string
  teacherId: string
  teacherName: string
  studentCount: number
}

export interface Student {
  id: string
  name: string
  classId: string
  studentNumber: string
  gender: string
}

export interface ExamTask {
  id: string
  title: string
  classIds: string[]
  items: ExamItem[]
  deadline: string
  description: string
}

export interface ExamItem {
  name: string
  type: string
  totalScore: number
}

export interface StudentScore {
  id: string
  studentId: string
  studentName: string
  examId: string
  totalScore: number
  rank: number
  items: ItemScore[]
  technicalIssues: string[]
  analysisResult?: string
}

export interface ItemScore {
  itemName: string
  score: number
  maxScore: number
}

export interface ClassStatistics {
  classId: string
  averageScore: number
  passRate: number
  excellentRate: number
  participationRate: number
  scoreDistribution: ScoreDistribution[]
}

export interface ScoreDistribution {
  range: string
  count: number
}

export interface HistoryRecord {
  examDate: string
  totalScore: number
  rank: number
  items: ItemScore[]
}

export interface LearningResource {
  id: string
  title: string
  type: string
  videoUrl: string
  description: string
}

export interface VideoFile {
  id: string
  fileName: string
  classId: string
  uploadTime: string
  status: 'pending' | 'analyzing' | 'completed'
  analysisResult?: any
}