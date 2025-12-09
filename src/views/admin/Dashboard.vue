<template>
  <div class="admin-dashboard">
    <el-row :gutter="20" class="header-cards">
      <el-col :span="6" v-for="card in statsCards" :key="card.title">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" :style="{ backgroundColor: card.color }">
              <el-icon :size="32"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ card.value }}</div>
              <div class="stats-title">{{ card.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-section">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>考试趋势分析</span>
              <el-select v-model="selectedTerm" size="small" style="width: 120px">
                <el-option label="本学期" value="current" />
                <el-option label="上学期" value="last" />
                <el-option label="全年" value="year" />
              </el-select>
            </div>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="quick-actions-card">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button 
              v-for="action in quickActions" 
              :key="action.name"
              :type="action.type"
              :icon="action.icon"
              class="action-btn"
              @click="handleAction(action.route)"
            >
              {{ action.name }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-section">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>最近考试任务</span>
          </template>
          <el-table :data="recentExams" style="width: 100%" height="300">
            <el-table-column prop="className" label="班级" width="120" />
            <el-table-column prop="examName" label="考试名称" />
            <el-table-column prop="examDate" label="考试日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewExamDetails(row)">查看</el-button>
                <el-button link type="primary" size="small" @click="editExam(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>待处理事项</span>
          </template>
          <el-timeline>
            <el-timeline-item 
              v-for="item in pendingTasks" 
              :key="item.id"
              :timestamp="item.time"
              :type="item.type"
            >
              <div class="task-item">
                <div>{{ item.content }}</div>
                <el-button link type="primary" size="small" @click="handleTask(item)">处理</el-button>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { User, Document, VideoCamera, TrendCharts } from '@element-plus/icons-vue'
import type { EChartsOption } from 'echarts'

const router = useRouter()

// 统计卡片数据
const statsCards = ref([
  { title: '班级总数', value: '24', icon: TrendCharts, color: '#409EFF' },
  { title: '学生总数', value: '1,268', icon: User, color: '#67C23A' },
  { title: '考试任务', value: '36', icon: Document, color: '#E6A23C' },
  { title: '待审核视频', value: '89', icon: VideoCamera, color: '#F56C6C' }
])

// 快捷操作
const quickActions = [
  { name: '发布考试任务', type: 'primary', icon: Document, route: '/admin/exam/create' },
  { name: '班级管理', type: 'success', icon: User, route: '/admin/class' },
  { name: '上传视频', type: 'warning', icon: VideoCamera, route: '/admin/video/upload' },
  { name: '数据大屏', type: 'danger', icon: TrendCharts, route: '/admin/databoard' }
]

// 最近考试任务
const recentExams = ref([
  { id: 1, className: '三年级1班', examName: '800米跑', examDate: '2024-01-15', status: '进行中' },
  { id: 2, className: '三年级2班', examName: '立定跳远', examDate: '2024-01-14', status: '已完成' },
  { id: 3, className: '四年级1班', examName: '仰卧起坐', examDate: '2024-01-13', status: '已完成' },
  { id: 4, className: '四年级2班', examName: '跳绳', examDate: '2024-01-12', status: '待开始' }
])

// 待处理事项
const pendingTasks = ref([
  { id: 1, content: '三年级1班有15个视频待审核', time: '2024-01-15 14:30', type: 'warning' },
  { id: 2, content: '四年级2班考试任务即将开始', time: '2024-01-15 13:20', type: 'primary' },
  { id: 3, content: '李老师提交了成绩申诉', time: '2024-01-15 11:00', type: 'danger' }
])

const selectedTerm = ref('current')
const trendChart = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    '进行中': 'warning',
    '已完成': 'success',
    '待开始': 'info'
  }
  return typeMap[status] || 'info'
}

// 初始化图表
const initChart = () => {
  if (!trendChart.value) return
  
  chartInstance = echarts.init(trendChart.value)
  
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['平均分', '及格率', '优秀率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '平均分',
        type: 'line',
        data: [75, 78, 80, 82, 85, 87, 89],
        smooth: true
      },
      {
        name: '及格率',
        type: 'line',
        data: [85, 87, 89, 90, 92, 94, 95],
        smooth: true
      },
      {
        name: '优秀率',
        type: 'line',
        data: [45, 48, 52, 55, 58, 62, 65],
        smooth: true
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 处理快捷操作
const handleAction = (route: string) => {
  router.push(route)
}

// 查看考试详情
const viewExamDetails = (row: any) => {
  router.push(`/admin/exam/detail/${row.id}`)
}

// 编辑考试
const editExam = (row: any) => {
  router.push(`/admin/exam/edit/${row.id}`)
}

// 处理任务
const handleTask = (item: any) => {
  console.log('处理任务:', item)
  // TODO: 实现具体任务处理逻辑
}

// 模拟API调用 - 获取统计数据
const fetchStats = async () => {
  // TODO: 调用后端API
  // const response = await api.getAdminStats()
  // statsCards.value = response.data
}

// 模拟API调用 - 获取最近考试
const fetchRecentExams = async () => {
  // TODO: 调用后端API
  // const response = await api.getRecentExams()
  // recentExams.value = response.data
}

onMounted(() => {
  initChart()
  fetchStats()
  fetchRecentExams()
  
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  padding: 20px;

  .header-cards {
    margin-bottom: 20px;
  }

  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stats-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .stats-info {
        flex: 1;

        .stats-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 4px;
        }

        .stats-title {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .content-section {
    margin-bottom: 20px;
  }

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 350px;
    }
  }

  .quick-actions-card {
    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .action-btn {
        width: 100%;
        height: 80px;
        font-size: 16px;
      }
    }
  }

  .task-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>