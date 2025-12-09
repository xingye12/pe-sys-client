<template>
  <div class="teacher-dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="metric in keyMetrics" :key="metric.label">
        <el-card class="metric-card">
          <div class="metric-content">
            <el-icon :size="40" :color="metric.color">
              <component :is="metric.icon" />
            </el-icon>
            <div class="metric-info">
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-trend" :class="metric.trend > 0 ? 'up' : 'down'">
                <el-icon><CaretTop v-if="metric.trend > 0" /><CaretBottom v-else /></el-icon>
                {{ Math.abs(metric.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>成绩分布分析</span>
          </template>
          <div ref="distributionChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>班级学生列表</span>
          </template>
          <el-table :data="studentList" height="400" size="small">
            <el-table-column prop="name" label="姓名" width="80" />
            <el-table-column prop="score" label="最新成绩" width="80" />
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button link size="small" @click="viewStudent(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between;">
              <span>成绩趋势对比</span>
              <el-button type="primary" size="small" @click="exportData">导出Excel</el-button>
            </div>
          </template>
          <div ref="trendChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, TrendCharts, Check, Star, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const keyMetrics = ref([
  { label: '班级平均分', value: '85.6', trend: 2.3, color: '#409EFF', icon: TrendCharts },
  { label: '及格率', value: '92%', trend: 1.5, color: '#67C23A', icon: Check },
  { label: '优秀率', value: '65%', trend: 3.2, color: '#E6A23C', icon: Star },
  { label: '参考率', value: '98%', trend: 0.5, color: '#F56C6C', icon: User }
])

const studentList = ref([
  { id: 1, name: '张三', score: 92 },
  { id: 2, name: '李四', score: 88 },
  { id: 3, name: '王五', score: 85 },
  { id: 4, name: '赵六', score: 90 },
  { id: 5, name: '孙七', score: 87 }
])

const distributionChart = ref<HTMLElement>()
const trendChart = ref<HTMLElement>()

const initDistributionChart = () => {
  if (!distributionChart.value) return
  const chart = echarts.init(distributionChart.value)
  
  chart.setOption({
    tooltip: {},
    legend: { data: ['人数'] },
    xAxis: { data: ['0-59分', '60-69分', '70-79分', '80-89分', '90-100分'] },
    yAxis: {},
    series: [{
      name: '人数',
      type: 'bar',
      data: [3, 8, 15, 20, 12],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 1, color: '#188df0' }
        ])
      }
    }]
  })
}

const initTrendChart = () => {
  if (!trendChart.value) return
  const chart = echarts.init(trendChart.value)
  
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均分', '及格率', '优秀率'] },
    xAxis: { data: ['第1次', '第2次', '第3次', '第4次', '第5次', '第6次'] },
    yAxis: {},
    series: [
      { name: '平均分', type: 'line', data: [78, 80, 82, 84, 85, 86], smooth: true },
      { name: '及格率', type: 'line', data: [85, 87, 89, 90, 91, 92], smooth: true },
      { name: '优秀率', type: 'line', data: [55, 58, 60, 62, 64, 65], smooth: true }
    ]
  })
}

const viewStudent = (row: any) => {
  console.log('查看学生:', row)
  // TODO: 跳转到学生详情页
}

const exportData = () => {
  // TODO: 调用导出Excel接口
  ElMessage.success('导出成功')
}

onMounted(() => {
  initDistributionChart()
  initTrendChart()
})
</script>

<style scoped lang="scss">
.teacher-dashboard {
  padding: 20px;

  .metric-card {
    .metric-content {
      display: flex;
      align-items: center;
      gap: 15px;

      .metric-info {
        flex: 1;

        .metric-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
        }

        .metric-label {
          font-size: 14px;
          color: #909399;
          margin: 5px 0;
        }

        .metric-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 2px;

          &.up { color: #67C23A; }
          &.down { color: #F56C6C; }
        }
      }
    }
  }
}
</style>
