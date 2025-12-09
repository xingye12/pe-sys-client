<template>
  <div class="student-management">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>学生成绩管理</span>
          <div>
            <el-button type="success" :icon="Download" @click="exportClassData">导出班级数据</el-button>
            <el-button type="primary" :icon="Download" @click="exportAllData">导出全部数据</el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.name" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="考试项目">
          <el-select v-model="searchForm.project" placeholder="请选择项目" clearable>
            <el-option label="全部" value="" />
            <el-option label="800米跑" value="800m" />
            <el-option label="立定跳远" value="jump" />
            <el-option label="仰卧起坐" value="situp" />
            <el-option label="跳绳" value="rope" />
          </el-select>
        </el-form-item>
        <el-form-item label="成绩范围">
          <el-select v-model="searchForm.scoreRange" placeholder="请选择范围" clearable>
            <el-option label="优秀(90-100)" value="excellent" />
            <el-option label="良好(80-89)" value="good" />
            <el-option label="及格(60-79)" value="pass" />
            <el-option label="不及格(0-59)" value="fail" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="studentList" v-loading="loading" style="width: 100%">
        <el-table-column prop="studentNo" label="学号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column prop="latestScore" label="最新成绩" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="getScoreType(row.latestScore)">{{ row.latestScore }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="avgScore" label="平均分" width="100" sortable />
        <el-table-column prop="examCount" label="参考次数" width="100" />
        <el-table-column prop="trend" label="成绩趋势" width="120">
          <template #default="{ row }">
            <div class="trend-cell">
              <el-icon v-if="row.trend > 0" color="#67C23A"><CaretTop /></el-icon>
              <el-icon v-else-if="row.trend < 0" color="#F56C6C"><CaretBottom /></el-icon>
              <el-icon v-else color="#909399"><Minus /></el-icon>
              <span :style="{ color: row.trend > 0 ? '#67C23A' : row.trend < 0 ? '#F56C6C' : '#909399' }">
                {{ Math.abs(row.trend) }}%
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="classRank" label="班级排名" width="100" sortable />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button link type="success" size="small" @click="viewHistory(row)">历史</el-button>
            <el-button link type="warning" size="small" @click="viewAnalysis(row)">分析</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchStudentList"
        @current-change="fetchStudentList"
        class="pagination"
      />
    </el-card>

    <!-- 学生详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="学生详细成绩" width="80%">
      <div v-if="currentStudent">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="学号">{{ currentStudent.studentNo }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentStudent.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentStudent.gender }}</el-descriptions-item>
          <el-descriptions-item label="班级排名">{{ currentStudent.classRank }}</el-descriptions-item>
          <el-descriptions-item label="平均分">{{ currentStudent.avgScore }}</el-descriptions-item>
          <el-descriptions-item label="参考次数">{{ currentStudent.examCount }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">各项目得分</el-divider>
        <el-table :data="currentStudent.projectScores" border>
          <el-table-column prop="project" label="考试项目" />
          <el-table-column prop="score" label="得分" />
          <el-table-column prop="ranking" label="班级排名" />
          <el-table-column prop="evaluation" label="评价" />
        </el-table>

        <el-divider content-position="left">技术问题统计</el-divider>
        <div ref="issueChart" style="height: 300px;"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Search, Refresh, CaretTop, CaretBottom, Minus } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchForm = reactive({
  name: '',
  project: '',
  scoreRange: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const loading = ref(false)
const detailDialogVisible = ref(false)
const issueChart = ref<HTMLElement>()
const currentStudent = ref<any>(null)

const studentList = ref([
  { studentNo: '20230101', name: '张三', gender: '男', latestScore: 92, avgScore: 88, examCount: 6, trend: 5, classRank: 1 },
  { studentNo: '20230102', name: '李四', gender: '女', latestScore: 88, avgScore: 85, examCount: 6, trend: 2, classRank: 3 },
  { studentNo: '20230103', name: '王五', gender: '男', latestScore: 85, avgScore: 83, examCount: 5, trend: -3, classRank: 5 },
  { studentNo: '20230104', name: '赵六', gender: '女', latestScore: 90, avgScore: 87, examCount: 6, trend: 8, classRank: 2 }
])

const getScoreType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return ''
  if (score >= 60) return 'warning'
  return 'danger'
}

const fetchStudentList = async () => {
  loading.value = true
  try {
    // TODO: 调用后端API
    // const response = await teacherApi.getStudentScores({ ...searchForm, ...pagination })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchStudentList()
}

const handleReset = () => {
  Object.assign(searchForm, { name: '', project: '', scoreRange: '' })
  handleSearch()
}

const exportClassData = async () => {
  try {
    // TODO: 调用导出API
    // const blob = await teacherApi.exportClassScores({ classId: xxx })
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

const exportAllData = async () => {
  try {
    // TODO: 调用导出API
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

const viewDetail = (row: any) => {
  currentStudent.value = {
    ...row,
    projectScores: [
      { project: '800米跑', score: 92, ranking: 1, evaluation: '优秀' },
      { project: '立定跳远', score: 88, ranking: 3, evaluation: '良好' },
      { project: '仰卧起坐', score: 90, ranking: 2, evaluation: '优秀' }
    ]
  }
  detailDialogVisible.value = true
  
  setTimeout(() => {
    if (issueChart.value) {
      const chart = echarts.init(issueChart.value)
      chart.setOption({
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '60%',
          data: [
            { value: 2, name: '起跑姿势' },
            { value: 1, name: '摆臂动作' },
            { value: 3, name: '呼吸节奏' },
            { value: 1, name: '冲刺技巧' }
          ]
        }]
      })
    }
  }, 100)
}

const viewHistory = (row: any) => {
  router.push(`/teacher/student/${row.studentNo}/history`)
}

const viewAnalysis = (row: any) => {
  router.push(`/teacher/student/${row.studentNo}/analysis`)
}

onMounted(() => {
  fetchStudentList()
})
</script>

<style scoped lang="scss">
.student-management {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .trend-cell {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
