<template>
  <div class="exam-management">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>考试任务管理</span>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" placeholder="请选择班级" clearable>
            <el-option v-for="cls in classList" :key="cls.classId" :label="cls.className" :value="cls.classId" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试项目">
          <el-select v-model="searchForm.project" placeholder="请选择项目" clearable>
            <el-option label="50米跑" value="50米跑" />
            <el-option label="800米跑" value="800米跑" />
            <el-option label="立定跳远" value="立定跳远" />
            <el-option label="仰卧起坐" value="仰卧起坐" />
            <el-option label="跳绳" value="跳绳" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="未开始" value="未开始" />
            <el-option label="正在进行" value="正在进行" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="examList" v-loading="loading" style="width: 100%">
        <el-table-column prop="examName" label="任务名称" width="180">
          <template #default="{ row }">
            {{ row.examName || row.taskName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="考试项目" width="120" />
        <el-table-column prop="description" label="任务描述" width="200">
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="考试时间" width="250">
          <template #default="{ row }">
            <div v-if="row.begin_time && row.end_time">
              <div>开始: {{ formatDateTime(row.begin_time) }}</div>
              <div>结束: {{ formatDateTime(row.end_time) }}</div>
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.state)">{{ getStatusText(row.state) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="260">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button link type="success" size="small" @click="viewScores(row)">成绩</el-button>
            <el-button link type="danger" size="small" @click="deleteExam(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { adminApi } from '@/api'

const router = useRouter()

const searchForm = reactive({
  classId: '',
  project: '',
  status: ''
})


const loading = ref(false)

const classList = ref([])
const examList = ref([])

const getStatusType = (state: string) => {
  const map: Record<string, any> = {
    '未开始': 'info',
    '正在进行': 'warning',
    '已结束': 'success'
  }
  return map[state] || 'info'
}

const getStatusText = (state: string) => {
  const map: Record<string, string> = {
    '未开始': '未开始',
    '正在进行': '进行中',
    '已结束': '已结束'
  }
  return map[state] || state
}

const getProgressColor = (row: any) => {
  const percent = row.completedCount / row.totalStudents * 100
  if (percent >= 90) return '#67C23A'
  if (percent >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 格式化日期时间
const formatDateTime = (dateTime: string | null) => {
  if (!dateTime) return '-'
  try {
    const date = new Date(dateTime)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateTime
  }
}

const fetchExamList = async () => {
  loading.value = true
  try {
    console.log('正在获取任务列表...')
    const res = await adminApi.getTaskList()
    console.log('API响应:', res)
    examList.value = res.data || []
    console.log('任务列表数据:', examList.value)
    console.log('任务列表长度:', examList.value.length)
  } catch (error) {
    console.error('获取任务列表失败:', error)
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const fetchClassList = async () => {
  try {
    const res = await adminApi.getClassList()
    classList.value = res.data || []
  } catch (error) {
    console.error('获取班级列表失败:', error)
  }
}

const handleSearch = () => {
  fetchExamList()
}

const handleReset = () => {
  Object.assign(searchForm, { classId: '', project: '', status: '' })
  handleSearch()
}


const viewDetail = (row: any) => {
  router.push(`/admin/exam/detail/${row.id}`)
}

const viewScores = (row: any) => {
  router.push(`/admin/exam/${row.id}/scores`)
}

const deleteExam = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除考试任务 "${row.taskName || row.type || row.description}" 吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用后端API删除任务
    console.log('删除考试任务，ID:', row.examId)
    await adminApi.deleteTask(row.examId)

    ElMessage.success('删除成功')
    fetchExamList() // 重新加载列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除考试任务失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '删除失败'
      ElMessage.error(errorMessage)
    }
  }
}

onMounted(() => {
  fetchExamList()
  fetchClassList()
})
</script>

<style scoped lang="scss">
.exam-management {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
