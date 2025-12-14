import request from './index'

export interface StudentQueryParams {
  classId?: number
  studentName?: string
  scoreRange?: 'excellent' | 'good' | 'pass' | 'fail'
  sortBy?: 'score_desc' | 'score_asc' | 'name' | 'student_no'
  page?: number
  size?: number
}

export interface StudentScoreVO {
  studentId: number
  studentNo: string
  studentName: string
  gender: string
  className: string
  avgScore: number
  class_rank: number
  examCount: number
  passRate: number
  progress: number
  latestExamType: string
  latestExamTime: string
}

export interface StudentListResponse {
  list: StudentScoreVO[]
  total: number
  page: number
  size: number
}

export interface ClassOverviewVO {
  classId: number
  className: string
  grade: string
  totalStudents: number
  avgScore: number
  passRate: number
  excellentRate: number
  examCount: number
  latestExamTime: string
  teacherName: string
}

export const teacherApi = {
  // ��Y���h
  getTeacherClasses: (teacherId: number) =>
    request.get(`/teacher/classes?teacherId=${teacherId}`),

  // ��f�h/��u	
  getStudentScores: (params: StudentQueryParams) =>
    request.get('/teacher/students/scores', { params }),

  // ��f���o
  getStudentDetail: (studentId: number) =>
    request.get(`/teacher/students/${studentId}`),

  // ��f�@	�
  getStudentAllScores: (studentId: number) =>
    request.get(`/teacher/students/${studentId}/scores`),

  // ������ߡ
  getTeacherClassOverview: (teacherId: number) =>
    request.get(`/teacher/class/overview?teacherId=${teacherId}`),

  // ����ߡ��
  getClassStatistics: (classId: number, examId?: number) =>
    request.get('/teacher/class/statistics', { params: { classId, examId } }),

  // ����pn
  exportClassData: (classId: number) =>
    request.get(`/teacher/export/class?classId=${classId}`, { responseType: 'blob' }),

  // ��fpn
  exportStudentData: (studentId: number) =>
    request.get(`/teacher/export/student/${studentId}`, { responseType: 'blob' }),
  getClassStudents:(classId: number)=>
    request.get(`/teacher/class/students?classId=${ classId }`),
}