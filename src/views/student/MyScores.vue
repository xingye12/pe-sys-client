<template>
  <div class="my-scores">
    <!-- 个人信息卡片 -->
    <el-card class="profile-card">
      <div class="profile-content">
        <el-avatar :size="80" :src="userInfo.avatar" />
        <div class="profile-info">
          <h2>{{ userInfo.studentName }}</h2>
          <p>学号：{{ userInfo.studentNo }} | 班级：{{ userInfo.className }}</p>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.avgScore }}</div>
            <div class="stat-label">平均分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.rank }}</div>
            <div class="stat-label">班级排名</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.examCount }}</div>
            <div class="stat-label">考试次数</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 最新成绩 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>最新考试成绩</span>
          <el-tag v-if="latestScore.score" :type="getScoreTagType(latestScore.score)" size="large">
            {{ latestScore.score }} 分
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border v-if="latestScore.examDate">
        <el-descriptions-item label="考试日期">{{ latestScore.examDate }}</el-descriptions-item>
        <el-descriptions-item label="考试项目">{{ latestScore.project }}</el-descriptions-item>
        <el-descriptions-item label="我的成绩">
          <el-tag :type="getScoreTagType(latestScore.score)" size="large">
            {{ latestScore.score }} 分
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="班级排名">第 {{ latestScore.rank }} 名</el-descriptions-item>
        <el-descriptions-item label="班级平均分">{{ latestScore.classAvg }}</el-descriptions-item>
        <el-descriptions-item label="较上次">
          <span :class="latestScore.improvement > 0 ? 'text-success' : 'text-danger'">
            {{ latestScore.improvement > 0 ? '+' : '' }}{{ latestScore.improvement }} 分
          </span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider>技术分析</el-divider>
      <el-alert
        v-if="latestScore.analysis"
        :title="latestScore.analysis"
        type="info"
        :closable="false"
        show-icon
      />

      <el-divider>改进建议</el-divider>
      <el-timeline v-if="latestScore.suggestions">
        <el-timeline-item
          v-for="(item, index) in latestScore.suggestions"
          :key="index"
          :icon="item.icon"
          :type="item.type"
        >
          {{ item.text }}
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 历史成绩 -->
    <el-card style="margin-top: 20px;">
      <template #header>历史考试成绩</template>
      <el-table :data="scoreHistory" style="width: 100%">
        <el-table-column prop="examDate" label="考试日期" width="120" />
        <el-table-column prop="project" label="考试项目" width="120" />
        <el-table-column prop="score" label="成绩" width="100">
          <template #default="{ row }">
            <el-tag :type="getScoreTagType(row.score)">{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="100" />
        <el-table-column prop="classAvg" label="班级平均" width="100" />
        <el-table-column prop="improvement" label="较上次" width="100">
          <template #default="{ row }">
            <span v-if="row.improvement" :class="row.improvement > 0 ? 'text-success' : 'text-danger'">
              {{ row.improvement > 0 ? '+' : '' }}{{ row.improvement }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleViewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 成绩分析图表 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>成绩趋势</template>
          <div ref="trendChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>各项目得分对比</template>
          <div ref="radarChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成绩详情对话框 -->
    <el-dialog v-model="detailVisible" title="考试详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="考试日期">{{ scoreDetail.examDate }}</el-descriptions-item>
        <el-descriptions-item label="考试项目">{{ scoreDetail.project }}</el-descriptions-item>
        <el-descriptions-item label="成绩">
          <el-tag :type="getScoreTagType(scoreDetail.score)" size="large">
            {{ scoreDetail.score }} 分
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="班级排名">第 {{ scoreDetail.rank }} 名</el-descriptions-item>
      </el-descriptions>

      <el-divider>动作分析</el-divider>
      <div v-if="scoreDetail.videoUrl" style="margin-bottom: 20px;">
        <video :src="scoreDetail.videoUrl" controls style="width: 100%; max-height: 400px;" />
      </div>

      <el-table :data="scoreDetail.issues" style="width: 100%">
        <el-table-column prop="timestamp" label="时间点" width="100" />
        <el-table-column prop="issue" label="问题描述" />
        <el-table-column prop="suggestion" label="改进建议" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { studentApi } from '@/api'

const userInfo = ref({
  studentName: '张三',
  studentNo: '2023001',
  className: '六年级1班',
  avatar: '',
  avgScore: 85.6,
  rank: 5,
  examCount: 12
})

const latestScore = ref<any>({})
const scoreHistory = ref([])
const detailVisible = ref(false)
const scoreDetail = ref<any>({})
const trendChart = ref<HTMLElement>()
const radarChart = ref<HTMLElement>()

const getScoreTagType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return ''
  if (score >= 60) return 'warning'
  return 'danger'
}

const loadMyScores = async () => {
  try {
    const res = await studentApi.getMyScores()
    latestScore.value = res.data.latest || {}
    scoreHistory.value = res.data.history || []
    
    initCharts()
  } catch (error) {
    ElMessage.error('加载成绩失败')
  }
}

const handleViewDetail = async (row: any) => {
  try {
    const res = await studentApi.getScoreDetail(row.scoreId)
    scoreDetail.value = res.data || {}
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('加载详情失败')
  }
}

const initCharts = () => {
  // 成绩趋势图
  if (trendChart.value) {
    const chart = echarts.init(trendChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['第1次', '第2次', '第3次', '第4次', '第5次', '第6次']
      },
      yAxis: { type: 'value', max: 100 },
      series: [
        {
          name: '我的成绩',
          data: [75, 78, 82, 85, 87, 90],
          type: 'line',
          smooth: true,
          itemStyle: { color: '#409EFF' }
        },
        {
          name: '班级平均',
          data: [80, 81, 82, 83, 84, 85],
          type: 'line',
          smooth: true,
          itemStyle: { color: '#67C23A' }
        }
      ],
      legend: { data: ['我的成绩', '班级平均'] }
    })
  }

  // 雷达图
  if (radarChart.value) {
    const chart = echarts.init(radarChart.value)
    chart.setOption({
      tooltip: {},
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
        data: [
          { value: [88, 85, 90, 92, 87], name: '我的成绩' },
          { value: [85, 83, 85, 87, 85], name: '班级平均' }
        ]
      }]
    })
  }
}

onMounted(() => {
  loadMyScores()
})
</script>

<style scoped lang="scss">
.my-scores {
  padding: 20px;

  .profile-card {
    .profile-content {
      display: flex;
      align-items: center;
      gap: 30px;

      .profile-info {
        flex: 1;

        h2 {
          margin: 0 0 10px 0;
          color: #303133;
        }

        p {
          margin: 0;
          color: #909399;
        }
      }

      .profile-stats {
        display: flex;
        gap: 40px;

        .stat-item {
          text-align: center;

          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #409EFF;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-top: 5px;
          }
        }
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .text-success {
    color: #67C23A;
    font-weight: bold;
  }

  .text-danger {
    color: #F56C6C;
    font-weight: bold;
  }
}
</style>
