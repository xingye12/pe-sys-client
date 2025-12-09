<template>
  <div class="student-dashboard">
    <el-card class="profile-card">
      <div class="profile-header">
        <el-avatar :size="80" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        <div class="profile-info">
          <h2>{{ studentInfo.name }}</h2>
          <p>{{ studentInfo.className }} | 学号: {{ studentInfo.studentNo }}</p>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>本次考试成绩</span>
          </template>
          <div class="score-display">
            <div class="total-score">{{ latestExam.totalScore }}</div>
            <div class="score-label">总分</div>
            <el-divider />
            <div class="rank-info">
              <span>班级排名: <strong>{{ latestExam.classRank }}</strong></span>
              <span>年级排名: <strong>{{ latestExam.gradeRank }}</strong></span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>各项目得分</span>
          </template>
          <div ref="projectScoreChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>技术分析</span>
          </template>
          <el-timeline>
            <el-timeline-item 
              v-for="issue in technicalIssues" 
              :key="issue.id"
              :type="issue.level"
              :timestamp="issue.project"
            >
              {{ issue.description }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>改进建议</span>
          </template>
          <el-alert 
            v-for="suggestion in suggestions" 
            :key="suggestion.id"
            :title="suggestion.title"
            :type="suggestion.type"
            :description="suggestion.content"
            style="margin-bottom: 10px;"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>历史成绩趋势</span>
          </template>
          <div ref="historyChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>学习资源</span>
          </template>
          <el-row :gutter="15">
            <el-col :span="6" v-for="resource in learningResources" :key="resource.id">
              <el-card shadow="hover" class="resource-card" @click="viewResource(resource)">
                <el-icon :size="50" color="#409EFF"><VideoCamera /></el-icon>
                <div class="resource-title">{{ resource.title }}</div>
                <div class="resource-desc">{{ resource.description }}</div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { VideoCamera } from '@element-plus/icons-vue'

const studentInfo = ref({
  name: '张三',
  className: '三年级1班',
  studentNo: '20230101'
})

const latestExam = ref({
  totalScore: 88,
  classRank: 5,
  gradeRank: 23
})

const technicalIssues = ref([
  { id: 1, project: '800米跑', description: '起跑姿势需要改进,重心过高', level: 'warning' },
  { id: 2, project: '立定跳远', description: '摆臂动作不够充分', level: 'info' },
  { id: 3, project: '仰卧起坐', description: '动作规范,保持良好', level: 'success' }
])

const suggestions = ref([
  { id: 1, title: '跑步训练', content: '建议每周进行3次耐力训练,每次30分钟', type: 'warning' },
  { id: 2, title: '跳远技巧', content: '观看标准动作视频,注意摆臂和起跳时机', type: 'info' }
])

const learningResources = ref([
  { id: 1, title: '800米跑标准动作', description: '详细讲解长跑技巧' },
  { id: 2, title: '立定跳远教学', description: '从起跳到落地的完整过程' },
  { id: 3, title: '仰卧起坐要领', description: '核心力量训练方法' },
  { id: 4, title: '跳绳技巧提升', description: '提高跳绳速度和耐力' }
])

const projectScoreChart = ref<HTMLElement>()
const historyChart = ref<HTMLElement>()

const initProjectScoreChart = () => {
  if (!projectScoreChart.value) return
  const chart = echarts.init(projectScoreChart.value)
  
  chart.setOption({
    radar: {
      indicator: [
        { name: '800米跑', max: 100 },
        { name: '立定跳远', max: 100 },
        { name: '仰卧起坐', max: 100 },
        { name: '跳绳', max: 100 },
        { name: '50米跑', max: 100 }
      ]
    },
    series: [{
      type: 'radar',
      data: [{
        value: [85, 90, 88, 92, 87],
        name: '我的成绩',
        areaStyle: { color: 'rgba(64, 158, 255, 0.3)' }
      }, {
        value: [82, 85, 84, 88, 83],
        name: '班级平均',
        areaStyle: { color: 'rgba(103, 194, 58, 0.3)' }
      }]
    }]
  })
}

const initHistoryChart = () => {
  if (!historyChart.value) return
  const chart = echarts.init(historyChart.value)
  
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['总分', '班级平均'] },
    xAxis: { data: ['第1次', '第2次', '第3次', '第4次', '第5次', '第6次'] },
    yAxis: { max: 100 },
    series: [
      { 
        name: '总分', 
        type: 'line', 
        data: [75, 78, 82, 85, 87, 88], 
        smooth: true,
        markPoint: {
          data: [{ type: 'max', name: '最高分' }]
        }
      },
      { 
        name: '班级平均', 
        type: 'line', 
        data: [80, 81, 82, 83, 84, 85], 
        smooth: true 
      }
    ]
  })
}

const viewResource = (resource: any) => {
  console.log('查看资源:', resource)
  // TODO: 打开视频播放页面
}

onMounted(() => {
  initProjectScoreChart()
  initHistoryChart()
})
</script>

<style scoped lang="scss">
.student-dashboard {
  padding: 20px;

  .profile-card {
    .profile-header {
      display: flex;
      align-items: center;
      gap: 20px;

      .profile-info {
        h2 { margin: 0 0 10px 0; }
        p { margin: 0; color: #909399; }
      }
    }
  }

  .score-display {
    text-align: center;

    .total-score {
      font-size: 60px;
      font-weight: bold;
      color: #409EFF;
    }

    .score-label {
      font-size: 16px;
      color: #909399;
      margin-bottom: 15px;
    }

    .rank-info {
      display: flex;
      justify-content: space-around;
      font-size: 14px;
      color: #606266;
    }
  }

  .resource-card {
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .resource-title {
      font-size: 16px;
      font-weight: bold;
      margin: 10px 0 5px;
    }

    .resource-desc {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
