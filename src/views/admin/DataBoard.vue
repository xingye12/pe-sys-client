<template>
  <div class="data-board">
    <div class="board-header">
      <h1>体育考试数据分析大屏</h1>
      <div class="date-time">{{ currentTime }}</div>
    </div>

    <el-row :gutter="20" class="board-row">
      <el-col :span="6">
        <div class="data-card">
          <div class="card-title">总体数据概览</div>
          <div ref="overviewChart" class="chart-box"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="data-card">
          <div class="card-title">各年级平均成绩对比</div>
          <div ref="gradeCompareChart" class="chart-box"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="data-card">
          <div class="card-title">考试项目分布</div>
          <div ref="projectChart" class="chart-box"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="board-row">
      <el-col :span="16">
        <div class="data-card">
          <div class="card-title">成绩趋势分析</div>
          <div ref="trendChart" class="chart-box-large"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="data-card">
          <div class="card-title">班级排名 TOP10</div>
          <div ref="rankChart" class="chart-box-large"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="board-row">
      <el-col :span="8">
        <div class="data-card">
          <div class="card-title">成绩分布</div>
          <div ref="distributionChart" class="chart-box"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="data-card">
          <div class="card-title">参考率统计</div>
          <div ref="attendanceChart" class="chart-box"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="data-card">
          <div class="card-title">优秀率对比</div>
          <div ref="excellentChart" class="chart-box"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const currentTime = ref('')
const charts: echarts.ECharts[] = []

// 图表引用
const overviewChart = ref<HTMLElement>()
const gradeCompareChart = ref<HTMLElement>()
const projectChart = ref<HTMLElement>()
const trendChart = ref<HTMLElement>()
const rankChart = ref<HTMLElement>()
const distributionChart = ref<HTMLElement>()
const attendanceChart = ref<HTMLElement>()
const excellentChart = ref<HTMLElement>()

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 初始化总体数据概览图表
const initOverviewChart = () => {
  if (!overviewChart.value) return
  const chart = echarts.init(overviewChart.value)
  charts.push(chart)

  const option: EChartsOption = {
    series: [
      {
        type: 'gauge',
        detail: { formatter: '{value}分' },
        data: [{ value: 85, name: '平均分' }],
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[0.6, '#F56C6C'], [0.8, '#E6A23C'], [1, '#67C23A']]
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

// 初始化年级对比图表
const initGradeCompareChart = () => {
  if (!gradeCompareChart.value) return
  const chart = echarts.init(gradeCompareChart.value)
  charts.push(chart)

  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均分', '及格率', '优秀率'] },
    xAxis: { type: 'category', data: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'] },
    yAxis: { type: 'value' },
    series: [
      { name: '平均分', type: 'bar', data: [78, 80, 82, 85, 87, 89] },
      { name: '及格率', type: 'line', data: [88, 90, 92, 94, 95, 96] },
      { name: '优秀率', type: 'line', data: [45, 50, 55, 60, 65, 70] }
    ]
  }
  chart.setOption(option)
}

// 初始化考试项目分布图表
const initProjectChart = () => {
  if (!projectChart.value) return
  const chart = echarts.init(projectChart.value)
  charts.push(chart)

  const option: EChartsOption = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: [
          { value: 235, name: '800米跑' },
          { value: 274, name: '立定跳远' },
          { value: 310, name: '仰卧起坐' },
          { value: 335, name: '跳绳' },
          { value: 400, name: '50米跑' }
        ],
        label: { fontSize: 12 }
      }
    ]
  }
  chart.setOption(option)
}

// 初始化成绩趋势图表
const initTrendChart = () => {
  if (!trendChart.value) return
  const chart = echarts.init(trendChart.value)
  charts.push(chart)

  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'] },
    yAxis: { type: 'value' },
    series: [
      { name: '一年级', type: 'line', data: [70, 72, 74, 76, 78, 80, 82, 84], smooth: true },
      { name: '二年级', type: 'line', data: [72, 74, 76, 78, 80, 82, 84, 86], smooth: true },
      { name: '三年级', type: 'line', data: [74, 76, 78, 80, 82, 84, 86, 88], smooth: true },
      { name: '四年级', type: 'line', data: [76, 78, 80, 82, 84, 86, 88, 90], smooth: true },
      { name: '五年级', type: 'line', data: [78, 80, 82, 84, 86, 88, 90, 92], smooth: true },
      { name: '六年级', type: 'line', data: [80, 82, 84, 86, 88, 90, 92, 94], smooth: true }
    ]
  }
  chart.setOption(option)
}

// 初始化班级排名图表
const initRankChart = () => {
  if (!rankChart.value) return
  const chart = echarts.init(rankChart.value)
  charts.push(chart)

  const option: EChartsOption = {
    grid: { left: '15%', right: '10%', top: '10%', bottom: '10%' },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: ['六1班', '五2班', '六2班', '五1班', '四3班', '四1班', '三2班', '三1班', '二1班', '一1班'].reverse()
    },
    series: [
      {
        type: 'bar',
        data: [92, 90, 89, 88, 87, 86, 85, 84, 83, 82],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#83bff6' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

// 初始化成绩分布图表
const initDistributionChart = () => {
  if (!distributionChart.value) return
  const chart = echarts.init(distributionChart.value)
  charts.push(chart)

  const option: EChartsOption = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 420, name: '优秀(90-100)' },
          { value: 580, name: '良好(80-89)' },
          { value: 180, name: '及格(60-79)' },
          { value: 88, name: '不及格(0-59)' }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 初始化参考率图表
const initAttendanceChart = () => {
  if (!attendanceChart.value) return
  const chart = echarts.init(attendanceChart.value)
  charts.push(chart)

  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'] },
    yAxis: { type: 'value', max: 100 },
    series: [
      {
        type: 'bar',
        data: [95, 96, 97, 98, 96, 97],
        itemStyle: { color: '#5470c6' }
      }
    ]
  }
  chart.setOption(option)
}

// 初始化优秀率对比图表
const initExcellentChart = () => {
  if (!excellentChart.value) return
  const chart = echarts.init(excellentChart.value)
  charts.push(chart)

  const option: EChartsOption = {
    radar: {
      indicator: [
        { name: '800米跑', max: 100 },
        { name: '立定跳远', max: 100 },
        { name: '仰卧起坐', max: 100 },
        { name: '跳绳', max: 100 },
        { name: '50米跑', max: 100 }
      ]
    },
    series: [
      {
        type: 'radar',
        data: [
          { value: [85, 90, 80, 88, 92], name: '本学期' },
          { value: [80, 85, 75, 82, 87], name: '上学期' }
        ]
      }
    ]
  }
  chart.setOption(option)
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)

  // 初始化所有图表
  initOverviewChart()
  initGradeCompareChart()
  initProjectChart()
  initTrendChart()
  initRankChart()
  initDistributionChart()
  initAttendanceChart()
  initExcellentChart()

  // 响应式调整
  window.addEventListener('resize', () => {
    charts.forEach(chart => chart.resize())
  })
})

onUnmounted(() => {
  charts.forEach(chart => chart.dispose())
})
</script>

<style scoped lang="scss">
.data-board {
  background: linear-gradient(to bottom, #0a1e3c 0%, #1a3a5c 100%);
  min-height: 100vh;
  padding: 20px;
  color: #fff;

  .board-header {
    text-align: center;
    margin-bottom: 30px;

    h1 {
      font-size: 42px;
      font-weight: bold;
      margin-bottom: 10px;
      background: linear-gradient(to right, #4facfe, #00f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .date-time {
      font-size: 18px;
      color: #67C23A;
    }
  }

  .board-row {
    margin-bottom: 20px;
  }

  .data-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 15px;
    backdrop-filter: blur(10px);

    .card-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #4facfe;
      border-left: 4px solid #4facfe;
      padding-left: 10px;
    }

    .chart-box {
      height: 280px;
    }

    .chart-box-large {
      height: 380px;
    }
  }
}
</style>
