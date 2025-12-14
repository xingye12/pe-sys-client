<template>
    <div class="exam-detail">
      <!-- 顶部导航与基本信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="header-actions">
            <el-page-header @back="goBack" :content="examInfo.name" />
          </div>
        </template>
        <el-descriptions border :column="2">
          <el-descriptions-item label="考试内容">{{ examInfo.content }}</el-descriptions-item>
          <el-descriptions-item label="考试时间">{{ examInfo.startTime }} ~ {{ examInfo.endTime }}</el-descriptions-item>
          <el-descriptions-item label="参考人数">{{ examInfo.participantCount }} / {{ examInfo.totalStudents }} 人</el-descriptions-item>
          <el-descriptions-item label="班级平均分">
            <span class="score-text">{{ examInfo.averageScore }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
  
      <!-- 统计指标卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card excellent">
            <div class="stat-content">
              <div class="stat-value">{{ examInfo.excellentRate }}%</div>
              <div class="stat-label">优秀率 (≥85分)</div>
            </div>
            <el-progress type="circle" :percentage="examInfo.excellentRate" status="success" :width="60" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card good">
            <div class="stat-content">
              <div class="stat-value">{{ examInfo.goodRate }}%</div>
              <div class="stat-label">良好率 (≥70分)</div>
            </div>
            <el-progress type="circle" :percentage="examInfo.goodRate" color="#409EFF" :width="60" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card pass">
            <div class="stat-content">
              <div class="stat-value">{{ examInfo.passRate }}%</div>
              <div class="stat-label">及格率 (≥60分)</div>
            </div>
            <el-progress type="circle" :percentage="examInfo.passRate" color="#E6A23C" :width="60" />
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 班级选择 -->
      <el-card class="filter-card" v-if="classList.length > 0">
        <template #header>
          <div class="filter-header">
            <span>筛选条件</span>
          </div>
        </template>
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="选择班级">
            <el-select v-model="filterForm.classId" placeholder="请选择班级" clearable @change="handleClassChange">
              <el-option label="全部班级" :value="0" />
              <el-option v-for="cls in classList" :key="cls.classId" :label="cls.className" :value="cls.classId" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadExamStudents">查询</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 学生成绩列表 -->
      <el-card class="list-card">
        <template #header>
          <div class="list-header">
            <span>学生成绩排名</span>
            <el-button type="success" plain size="small" @click="exportExamResults">导出成绩单</el-button>
          </div>
        </template>
        
        <el-table 
          :data="studentList" 
          style="width: 100%" 
          :default-sort="{ prop: 'score', order: 'descending' }"
          stripe
        >
          <el-table-column type="index" label="排名" width="80" align="center">
            <template #default="{ $index }">
              <div class="rank-badge" :class="'rank-' + ($index + 1)">{{ $index + 1 }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="studentId" label="学号" width="150" />
          <el-table-column prop="score" label="总分" sortable width="120" align="center">
            <template #default="{ row }">
              <span :class="getScoreClass(row.score)">{{ row.score }}</span>
            </template>
          </el-table-column>
          <el-table-column label="较上次进步" width="180" align="center">
            <template #default="{ row }">
              <div class="trend" :class="getTrendClass(row.trend)">
                <span v-if="row.trend > 0">
                  <el-icon><Top /></el-icon> 进步 {{ row.trend }} 分
                </span>
                <span v-else-if="row.trend < 0">
                  <el-icon><Bottom /></el-icon> 退步 {{ Math.abs(row.trend) }} 分
                </span>
                <span v-else class="trend-flat">
                  <el-icon><Minus /></el-icon> 持平
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewStudentReport(row.studentId)">
                查看个人报告
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { Top, Bottom, Minus } from '@element-plus/icons-vue'
  import { teacherApi } from '@/api'
  import { ElMessage } from 'element-plus'
  
  const router = useRouter()
  const route = useRoute()

  // 班级列表和筛选条件
  const classList = ref([])
  const filterForm = ref({
    classId: 0
  })

  // 考试详情数据
  const examInfo = ref({
    id: 1,
    name: '2025春季学期第一次体能测试',
    content: '50米跑, 立定跳远, 引体向上',
    startTime: '2025-03-10 09:00',
    endTime: '2025-03-10 11:30',
    participantCount: 45,
    totalStudents: 45,
    averageScore: 82.5,
    excellentRate: 35,
    goodRate: 45,
    passRate: 98
  })

  // 学生列表数据
  const studentList = ref([
    { studentId: '2023001', name: '张三', score: 95, trend: 5 },
    { studentId: '2023002', name: '李四', score: 88, trend: -2 },
    { studentId: '2023003', name: '王五', score: 92, trend: 3 },
    { studentId: '2023004', name: '赵六', score: 76, trend: 0 },
    { studentId: '2023005', name: '钱七', score: 58, trend: -5 },
    { studentId: '2023006', name: '孙八', score: 85, trend: 8 },
  ])
  
  const goBack = () => {
    router.back()
  }
  
  const getScoreClass = (score: number) => {
    if (score >= 85) return 'text-excellent'
    if (score >= 70) return 'text-good'
    if (score >= 60) return 'text-pass'
    return 'text-fail'
  }
  
  const getTrendClass = (trend: number) => {
    if (trend > 0) return 'trend-up'
    if (trend < 0) return 'trend-down'
    return 'trend-flat'
  }
  
  const viewStudentReport = (studentId: string) => {
    // 跳转到学生个人报告页面，假设路由为 /teacher/student-report/:id
    router.push(`/teacher/student-report/${studentId}`)
  }

  const loadClassList = async () => {
    try {
      const res = await teacherApi.getClassOverview()
      if (res.data && res.data.classes) {
        classList.value = res.data.classes
      }
    } catch (error) {
      console.error('加载班级列表失败', error)
    }
  }

  const handleClassChange = () => {
    if (filterForm.value.classId) {
      loadExamStudents()
    } else {
      loadAllExamStudents()
    }
  }

  const loadExamStudents = async () => {
    try {
      const res = await teacherApi.getClassStudents(filterForm.value.classId)
      if (res.data && Array.isArray(res.data)) {
        studentList.value = res.data.map((student: any, index: number) => ({
          studentId: student.studentId,
          name: student.name,
          // 临时使用模拟数据，实际应该调用考试相关的API获取真实成绩
          score: Math.floor(Math.random() * 40) + 60, // 模拟成绩 60-100
          trend: Math.floor(Math.random() * 11) - 5 // 模拟进步 -5 到 +5
        })).sort((a: any, b: any) => b.score - a.score)
      }
    } catch (error) {
      ElMessage.error('加载班级学生失败')
    }
  }

  const loadAllExamStudents = () => {
    // 加载所有班级的学生（模拟数据）
    studentList.value = [
      { studentId: '2023001', name: '张三', score: 95, trend: 5 },
      { studentId: '2023002', name: '李四', score: 88, trend: -2 },
      { studentId: '2023003', name: '王五', score: 92, trend: 3 },
      { studentId: '2023004', name: '赵六', score: 76, trend: 0 },
      { studentId: '2023005', name: '钱七', score: 58, trend: -5 },
      { studentId: '2023006', name: '孙八', score: 85, trend: 8 },
    ]
  }

  const exportExamResults = () => {
    ElMessage.success('导出成绩单功能开发中')
  }

  onMounted(async () => {
    const id = route.params.id
    console.log('Load exam detail for id:', id)
    // TODO: 这里调用后端API获取真实数据

    // 加载班级列表
    await loadClassList()
  })
  </script>
  
  <style scoped lang="scss">
  .exam-detail {
    padding: 20px;
  
    .info-card {
      margin-bottom: 20px;
      .score-text {
        font-size: 20px;
        font-weight: bold;
        color: #409EFF;
      }
    }

    .filter-card {
      margin-bottom: 20px;
      .filter-header {
        font-weight: bold;
      }
    }
  
    .stats-row {
      margin-bottom: 20px;
      .stat-card {
        :deep(.el-card__body) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
        }
        
        .stat-content {
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .stat-label {
            color: #909399;
            font-size: 14px;
          }
        }
        
        &.excellent .stat-value { color: #67C23A; }
        &.good .stat-value { color: #409EFF; }
        &.pass .stat-value { color: #E6A23C; }
      }
    }
  
    .list-card {
      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
  
      .rank-badge {
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        border-radius: 50%;
        background: #f0f2f5;
        color: #606266;
        margin: 0 auto;
        font-weight: bold;
  
        &.rank-1 { background: #F56C6C; color: white; }
        &.rank-2 { background: #E6A23C; color: white; }
        &.rank-3 { background: #409EFF; color: white; }
      }
  
      .text-excellent { color: #67C23A; font-weight: bold; }
      .text-good { color: #409EFF; }
      .text-pass { color: #E6A23C; }
      .text-fail { color: #F56C6C; font-weight: bold; }
  
      .trend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: 13px;
        
        &.trend-up { color: #67C23A; }
        &.trend-down { color: #F56C6C; }
        &.trend-flat { color: #909399; }
      }
    }
  }
  </style>