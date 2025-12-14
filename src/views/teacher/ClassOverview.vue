<template>
  <div class="class-overview">
    <!-- 关键指标卡片 -->
    <el-row :gutter="20" class="kpi-row">
      <el-col :span="6" v-for="item in kpiData" :key="item.title">
        <el-card class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon" :style="{ background: item.color }">
              <component :is="item.icon" />
            </div>
            <div class="kpi-info">
              <div class="kpi-value">{{ item.value }}</div>
              <div class="kpi-title">{{ item.title }}</div>
              <div class="kpi-trend" :class="item.trend > 0 ? 'up' : 'down'">
                {{ item.trend > 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据分析大屏 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card>
          <template #header>成绩趋势分析</template>
          <div ref="trendChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>成绩分布</template>
          <div ref="distributionChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>各项目平均分</template>
          <div ref="projectChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>近期考试完成情况</template>
          <div ref="completionChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw } from 'vue'
import * as echarts from 'echarts'
import { TrendCharts, PieChart, Histogram, DataAnalysis } from '@element-plus/icons-vue'
import { teacherApi } from '@/api'

const kpiData = ref([
  { title: '班级平均分', value: '85.6', trend: 3.2, color: '#409EFF', icon: markRaw(TrendCharts) },
  { title: '及格率', value: '96%', trend: 2.5, color: '#67C23A', icon: markRaw(PieChart) },
  { title: '优秀率', value: '68%', trend: 5.1, color: '#E6A23C', icon: markRaw(Histogram) },
  { title: '参考率', value: '98%', trend: 1.0, color: '#F56C6C', icon: markRaw(DataAnalysis) }
])

const trendChart = ref<HTMLElement>()
const distributionChart = ref<HTMLElement>()
const projectChart = ref<HTMLElement>()
const completionChart = ref<HTMLElement>()

const initTrendChart = () => {
  if (!trendChart.value) return
  const chart = echarts.init(trendChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均分', '及格率', '优秀率'] },
    xAxis: { type: 'category', data: ['第1次', '第2次', '第3次', '第4次', '第5次', '第6次'] },
    yAxis: { type: 'value' },
    series: [
      { name: '平均分', type: 'line', data: [78, 80, 82, 83, 85, 86], smooth: true },
      { name: '及格率', type: 'line', data: [88, 90, 92, 94, 95, 96], smooth: true },
      { name: '优秀率', type: 'line', data: [55, 58, 60, 63, 66, 68], smooth: true }
    ]
  })
}

const initDistributionChart = () => {
  if (!distributionChart.value) return
  const chart = echarts.init(distributionChart.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 28, name: '优秀(90-100)' },
        { value: 42, name: '良好(80-89)' },
        { value: 25, name: '及格(60-79)' },
        { value: 5, name: '不及格(0-59)' }
      ]
    }]
  })
}

const initProjectChart = () => {
  if (!projectChart.value) return
  const chart = echarts.init(projectChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: ['50米跑', '800米跑', '立定跳远', '仰卧起坐', '跳绳'] },
    yAxis: { type: 'value', max: 100 },
    series: [{
      type: 'bar',
      data: [88, 82, 85, 90, 87],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 1, color: '#188df0' }
        ])
      }
    }]
  })
}

const initCompletionChart = () => {
  if (!completionChart.value) return
  const chart = echarts.init(completionChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['已完成', '未完成'] },
    xAxis: { type: 'category', data: ['考试1', '考试2', '考试3', '考试4', '考试5'] },
    yAxis: { type: 'value' },
    series: [
      { name: '已完成', type: 'bar', stack: 'total', data: [48, 46, 50, 49, 47] },
      { name: '未完成', type: 'bar', stack: 'total', data: [2, 4, 0, 1, 3] }
    ]
  })
}

onMounted(async () => {
  // 加载数据
  try {
    const res = await teacherApi.getClassOverview(1)
    // 更新 kpiData
  } catch (error) {
    console.error('加载数据失败', error)
  }
  
  // 初始化图表
  initTrendChart()
  initDistributionChart()
  initProjectChart()
  initCompletionChart()

  window.addEventListener('resize', () => {
    echarts.getInstanceByDom(trendChart.value!)?.resize()
    echarts.getInstanceByDom(distributionChart.value!)?.resize()
    echarts.getInstanceByDom(projectChart.value!)?.resize()
    echarts.getInstanceByDom(completionChart.value!)?.resize()
  })
})
</script>

<style scoped lang="scss">
.class-overview {
  padding: 20px;

  .kpi-row {
    .kpi-card {
      .kpi-content {
        display: flex;
        align-items: center;
        gap: 15px;

        .kpi-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }

        .kpi-info {
          flex: 1;

          .kpi-value {
            font-size: 28px;
            font-weight: bold;
            color: #303133;
          }

          .kpi-title {
            font-size: 14px;
            color: #909399;
            margin: 5px 0;
          }

          .kpi-trend {
            font-size: 12px;
            
            &.up {
              color: #67C23A;
            }

            &.down {
              color: #F56C6C;
            }
          }
        }
      }
    }
  }
}
</style>
