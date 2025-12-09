<template>
  <div class="student-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学生成绩管理</span>
          <div>
            <el-button type="success" @click="handleExportClass">导出班级数据</el-button>
            <el-button type="primary" @click="handleRefresh">刷新</el-button>
          </div>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="姓名">
          <el-input v-model="queryForm.studentName" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="成绩范围">
          <el-select v-model="queryForm.scoreRange" placeholder="请选择" clearable>
            <el-option label="优秀(90-100)" value="excellent" />
            <el-option label="良好(80-89)" value="good" />
            <el-option label="及格(60-79)" value="pass" />
            <el-option label="不及格(0-59)" value="fail" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="queryForm.sortBy" placeholder="请选择">
            <el-option label="成绩降序" value="score_desc" />
            <el-option label="成绩升序" value="score_asc" />
            <el-option label="姓名" value="name" />
            <el-option label="学号" value="student_no" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 学生列表 -->
      <el-table :data="studentList" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="avgScore" label="平均成绩" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="getScoreTagType(row.avgScore)">{{ row.avgScore }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="班级排名" width="100" sortable />
        <el-table-column prop="examCount" label="考试次数" width="100" />
        <el-table-column prop="passRate" label="及格率" width="100">
          <template #default="{ row }">{{ row.passRate }}%</template>
        </el-table-column>
        <el-table-column prop="progress" label="进步幅度" width="100">
          <template #default="{ row }">
            <span :class="row.progress > 0 ? 'text-success' : 'text-danger'">
              {{ row.progress > 0 ? '+' : '' }}{{ row.progress }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleViewDetail(row)">详细信息</el-button>
            <el-button size="small" type="success" @click="handleExportStudent(row)">导出</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadStudentList"
        @current-change="loadStudentList"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>

    <!-- 学生详情对话框 -->
    <el-dialog v-model="detailVisible" title="学生详细信息" width="90%" top="5vh">
      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="学号">{{ studentDetail.studentNo }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ studentDetail.studentName }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ studentDetail.gender }}</el-descriptions-item>
            <el-descriptions-item label="班级">{{ studentDetail.className }}</el-descriptions-item>
            <el-descriptions-item label="平均成绩">{{ studentDetail.avgScore }}</el-descriptions-item>
            <el-descriptions-item label="班级排名">{{ studentDetail.rank }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 考试成绩 -->
        <el-tab-pane label="考试成绩" name="scores">
          <el-table :data="studentDetail.scores" style="width: 100%">
            <el-table-column prop="examDate" label="考试日期" width="120" />
            <el-table-column prop="project" label="考试项目" width="120" />
            <el-table-column prop="score" label="成绩" width="80">
              <template #default="{ row }">
                <el-tag :type="getScoreTagType(row.score)">{{ row.score }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="rank" label="排名" width="80" />
            <el-table-column prop="improvement" label="较上次" width="100">
              <template #default="{ row }">
                <span v-if="row.improvement" :class="row.improvement > 0 ? 'text-success' : 'text-danger'">
                  {{ row.improvement > 0 ? '+' : '' }}{{ row.improvement }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="technicalIssues" label="技术问题" width="150" />
            <el-table-column prop="suggestion" label="改进建议" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" @click="handleViewAnalysis(row)">查看分析</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 数据分析 -->
        <el-tab-pane label="数据分析" name="analysis">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <template #header>成绩趋势</template>
                <div ref="studentTrendChart" style="height: 300px;"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <template #header>各项目得分</template>
                <div ref="studentProjectChart" style="height: 300px;"></div>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="24">
              <el-card>
                <template #header>技术问题统计</template>
                <div ref="issueStatChart" style="height: 300px;"></div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { teacherApi } from '@/api'

const loading = ref(false)
const studentList = ref([])
const detailVisible = ref(false)
const activeTab = ref('basic')
const studentDetail = ref<any>({})
const studentTrendChart = ref<HTMLElement>()
const studentProjectChart = ref<HTMLElement>()
const issueStatChart = ref<HTMLElement>()

const queryForm = ref({
  studentName: '',
  scoreRange: '',
  sortBy: 'score_desc'
})

const pagination = ref({
  page: 1,
  size: 20,
  total: 0
})

const getScoreTagType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return ''
  if (score >= 60) return 'warning'
  return 'danger'
}

const loadStudentList = async () => {
  loading.value = true
  try {
    const res = await teacherApi.getStudentList({
      ...queryForm.value,
      page: pagination.value.page,
      size: pagination.value.size
    })
    studentList.value = res.data.list || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    ElMessage.error('加载学生列表失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  pagination.value.page = 1
  loadStudentList()
}

const handleReset = () => {
  queryForm.value = {
    studentName: '',
    scoreRange: '',
    sortBy: 'score_desc'
  }
  handleQuery()
}

const handleRefresh = () => {
  loadStudentList()
}

const handleViewDetail = async (row: any) => {
  try {
    const res = await teacherApi.getStudentDetail(row.studentId)
    studentDetail.value = res.data || {}
    detailVisible.value = true
    
    await nextTick()
    initStudentCharts()
  } catch (error) {
    ElMessage.error('加载学生详情失败')
  }
}

const handleViewAnalysis = (row: any) => {
  ElMessage.info(`查看考试分析：${row.project} - ${row.examDate}`)
}

const handleExportClass = async () => {
    try {
    const res = await teacherApi.exportClassData()
    // AxiosResponse.data 才是文件内容
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `班级数据_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleExportStudent = async (row: any) => {
  try {
    const res = await teacherApi.exportStudentData(row.studentId)
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${row.studentName}_成绩数据_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const initStudentCharts = () => {
  // 成绩趋势图
  if (studentTrendChart.value) {
    const chart = echarts.init(studentTrendChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['第1次', '第2次', '第3次', '第4次', '第5次', '第6次'] },
      yAxis: { type: 'value', max: 100 },
      series: [{
        data: [75, 78, 82, 85, 87, 90],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }]
    })
  }

  // 各项目得分
  if (studentProjectChart.value) {
    const chart = echarts.init(studentProjectChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      radar: {
        indicator: [
          { name: '50米跑', max: 100 },
          { name: '800米跑', max: 100 },
          { name: '立定跳远', max: 100 },
          { name: '仰卧起坐', max: 100 },
          { name: '跳绳', max: 100 }
        ]
      },
      series: [{
        type: 'radar',
        data: [{ value: [88, 85, 90, 92, 87], name: '当前成绩' }]
      }]
    })
  }

  // 技术问题统计
  if (issueStatChart.value) {
    const chart = echarts.init(issueStatChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'category', data: ['起跑姿势', '摆臂动作', '步频节奏', '呼吸配合', '冲刺技巧'] },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [3, 5, 2, 4, 1],
        itemStyle: { color: '#E6A23C' }
      }]
    })
  }
}

onMounted(() => {
  loadStudentList()
})
</script>

<style scoped lang="scss">
.student-manage {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .text-success {
    color: #67C23A;
  }

  .text-danger {
    color: #F56C6C;
  }
}
</style>
