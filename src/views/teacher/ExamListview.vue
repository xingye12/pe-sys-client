<template>
    <div class="exam-list-container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="title">班级体育考试列表</span>
            <div class="actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索考试名称"
                style="width: 200px; margin-right: 10px"
                clearable
              />
              <el-button type="primary">发布新考试</el-button>
            </div>
          </div>
        </template>
  
        <el-table :data="exams" style="width: 100%" stripe v-loading="loading">
          <el-table-column prop="name" label="考试名称" min-width="180" />
          <el-table-column prop="content" label="考试内容" min-width="150" show-overflow-tooltip />
          <el-table-column label="考试时间" min-width="280">
            <template #default="{ row }">
              {{ row.startTime }} 至 {{ row.endTime }}
            </template>
          </el-table-column>
          <el-table-column prop="participantCount" label="参考人数" width="100" align="center" />
          <el-table-column prop="averageScore" label="班级平均分" width="120" align="center">
            <template #default="{ row }">
              <span :class="getScoreClass(row.averageScore)">{{ row.averageScore }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'finished' ? 'success' : 'warning'">
                {{ row.status === 'finished' ? '已结束' : '进行中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewDetail(row.id)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination layout="prev, pager, next" :total="total" />
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { onMounted, ref } from 'vue'
  import { teacherApi } from '@/api'
import { json } from 'stream/consumers'
  const router = useRouter()
  const searchKeyword = ref('')
  const loading = ref(false)
  const total = ref(0)
  const exams = ref<any[]>([])
  
  // 模拟数据
  const loadExams = async () => {
    loading.value = true
    try {
    /* 默认先查“全部班级”的考试，后端 classId=0 表示全部 */
      const res = await teacherApi.getClassExams(1)
      console.log(JSON.stringify(res.data))
      if (res.code === 1 && Array.isArray(res.data)) {
        exams.value = res.data.map((v: any) => ({
        id: v.examId,
        name: v.examName,
        content: v.description,
        startTime: v.startTime,
        endTime: v.endTime,
        participantCount: v.studentCount ?? 0,
        averageScore: v.avgScore ?? 0,
        status: v.state
      }))
      total.value = res.data.length          // 简单分页示例
    }
  } catch (e) {
    console.error('获取考试列表失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() =>{
  console.log('组件已挂载，开始加载考试数据'),
  loadExams()
})
  
  const getScoreClass = (score: number) => {
    if (score === 0) return ''
    if (score >= 85) return 'score-excellent'
    if (score >= 70) return 'score-good'
    if (score >= 60) return 'score-pass'
    return 'score-fail'
  }
  
  const viewDetail = (id: number) => {
    router.push(`/teacher/exam/${id}`)
  }
  </script>
  
  <style scoped lang="scss">
  .exam-list-container {
    padding: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 18px;
        font-weight: bold;
        color: #303133;
      }
      
      .actions {
        display: flex;
      }
    }
  
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  
    .score-excellent { color: #67C23A; font-weight: bold; }
    .score-good { color: #409EFF; }
    .score-pass { color: #E6A23C; }
    .score-fail { color: #F56C6C; }
  }
  </style>