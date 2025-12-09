<template>
  <div class="exam-management">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>考试任务管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">发布考试任务</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" placeholder="请选择班级" clearable>
            <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试项目">
          <el-select v-model="searchForm.project" placeholder="请选择项目" clearable>
            <el-option label="800米跑" value="800m" />
            <el-option label="立定跳远" value="jump" />
            <el-option label="仰卧起坐" value="situp" />
            <el-option label="跳绳" value="rope" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待开始" value="pending" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="examList" v-loading="loading" style="width: 100%">
        <el-table-column prop="examName" label="考试名称" width="180" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="project" label="考试项目" width="120" />
        <el-table-column prop="examDate" label="考试日期" width="120" />
        <el-table-column prop="totalStudents" label="参考人数" width="100" />
        <el-table-column prop="completedCount" label="已完成" width="100">
          <template #default="{ row }">
            <el-progress :percentage="Math.round(row.completedCount / row.totalStudents * 100)" :color="getProgressColor(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="avgScore" label="平均分" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="260">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button link type="success" size="small" @click="viewScores(row)">成绩</el-button>
            <el-button link type="warning" size="small" @click="editExam(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="deleteExam(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchExamList"
        @current-change="fetchExamList"
        class="pagination"
      />
    </el-card>

    <!-- 创建/编辑考试任务对话框 -->
    <el-dialog v-model="examDialogVisible" :title="isEdit ? '编辑考试任务' : '发布考试任务'" width="50%">
      <el-form :model="examForm" :rules="examRules" ref="examFormRef" label-width="100px">
        <el-form-item label="考试名称" prop="examName">
          <el-input v-model="examForm.examName" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="选择班级" prop="classId">
          <el-select v-model="examForm.classId" placeholder="请选择班级" style="width: 100%">
            <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试项目" prop="projects">
          <el-checkbox-group v-model="examForm.projects">
            <el-checkbox label="800m">800米跑</el-checkbox>
            <el-checkbox label="jump">立定跳远</el-checkbox>
            <el-checkbox label="situp">仰卧起坐</el-checkbox>
            <el-checkbox label="rope">跳绳</el-checkbox>
            <el-checkbox label="50m">50米跑</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker
            v-model="examForm.examDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="考试时间" prop="examTime">
          <el-time-picker
            v-model="examForm.examTime"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="考试地点" prop="location">
          <el-input v-model="examForm.location" placeholder="请输入考试地点" />
        </el-form-item>
        <el-form-item label="考试说明">
          <el-input
            v-model="examForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入考试说明和注意事项"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="examDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitExam">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchForm = reactive({
  classId: '',
  project: '',
  status: ''
})

const examForm = reactive({
  examName: '',
  classId: '',
  projects: [],
  examDate: '',
  examTime: '',
  location: '',
  description: ''
})

const examRules = {
  examName: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  projects: [{ required: true, message: '请至少选择一个考试项目', trigger: 'change' }],
  examDate: [{ required: true, message: '请选择考试日期', trigger: 'change' }],
  location: [{ required: true, message: '请输入考试地点', trigger: 'blur' }]
}

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const loading = ref(false)
const examDialogVisible = ref(false)
const isEdit = ref(false)
const examFormRef = ref()

const classList = ref([
  { id: 1, name: '三年级1班' },
  { id: 2, name: '三年级2班' },
  { id: 3, name: '四年级1班' }
])

const examList = ref([
  { id: 1, examName: '第一学期期末体育考试', className: '三年级1班', project: '800米跑', examDate: '2024-01-20', totalStudents: 45, completedCount: 38, avgScore: 85, status: 'ongoing' },
  { id: 2, examName: '立定跳远专项测试', className: '三年级2班', project: '立定跳远', examDate: '2024-01-18', totalStudents: 42, completedCount: 42, avgScore: 82, status: 'completed' },
  { id: 3, examName: '体能综合测试', className: '四年级1班', project: '综合', examDate: '2024-01-25', totalStudents: 48, completedCount: 0, avgScore: null, status: 'pending' }
])

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'info',
    ongoing: 'warning',
    completed: 'success'
  }
  return map[status]
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待开始',
    ongoing: '进行中',
    completed: '已完成'
  }
  return map[status]
}

const getProgressColor = (row: any) => {
  const percent = row.completedCount / row.totalStudents * 100
  if (percent >= 90) return '#67C23A'
  if (percent >= 60) return '#E6A23C'
  return '#F56C6C'
}

const fetchExamList = async () => {
  loading.value = true
  try {
    // TODO: 调用后端API
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchExamList()
}

const handleReset = () => {
  Object.assign(searchForm, { classId: '', project: '', status: '' })
  handleSearch()
}

const handleCreate = () => {
  isEdit.value = false
  Object.assign(examForm, {
    examName: '',
    classId: '',
    projects: [],
    examDate: '',
    examTime: '',
    location: '',
    description: ''
  })
  examDialogVisible.value = true
}

const editExam = (row: any) => {
  isEdit.value = true
  // TODO: 填充表单数据
  examDialogVisible.value = true
}

const submitExam = async () => {
  await examFormRef.value?.validate()
  try {
    // TODO: 调用后端API
    ElMessage.success(isEdit.value ? '更新成功' : '发布成功')
    examDialogVisible.value = false
    fetchExamList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const viewDetail = (row: any) => {
  router.push(`/admin/exam/detail/${row.id}`)
}

const viewScores = (row: any) => {
  router.push(`/admin/exam/${row.id}/scores`)
}

const deleteExam = (row: any) => {
  ElMessageBox.confirm('确定要删除该考试任务吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // TODO: 调用后端API
    ElMessage.success('删除成功')
    fetchExamList()
  })
}

onMounted(() => {
  fetchExamList()
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
