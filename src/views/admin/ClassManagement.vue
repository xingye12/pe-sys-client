<template>
  <div class="class-management">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>班级管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAddClass">添加班级</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="年级">
          <el-select v-model="searchForm.grade" placeholder="请选择年级" clearable>
            <el-option label="一年级" value="1" />
            <el-option label="二年级" value="2" />
            <el-option label="三年级" value="3" />
            <el-option label="四年级" value="4" />
            <el-option label="五年级" value="5" />
            <el-option label="六年级" value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级名称">
          <el-input v-model="searchForm.className" placeholder="请输入班级名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="classList" style="width: 100%" v-loading="loading">
        <el-table-column prop="className" label="班级名称" width="150" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="teacherName" label="班主任" width="120" />
        <el-table-column prop="studentCount" label="学生人数" width="100" />
        <el-table-column prop="avgScore" label="平均成绩" width="100" />
        <el-table-column prop="passRate" label="及格率" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.passRate" :color="getProgressColor(row.passRate)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewClassDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="viewStudents(row)">学生列表</el-button>
            <el-button link type="warning" size="small" @click="editClass(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="deleteClass(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 班级详情对话框 -->
    <el-dialog v-model="classDialogVisible" title="班级详情" width="70%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="班级名称">{{ currentClass.className }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ currentClass.grade }}</el-descriptions-item>
        <el-descriptions-item label="班主任">{{ currentClass.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="学生人数">{{ currentClass.studentCount }}</el-descriptions-item>
        <el-descriptions-item label="平均成绩">{{ currentClass.avgScore }}</el-descriptions-item>
        <el-descriptions-item label="及格率">{{ currentClass.passRate }}%</el-descriptions-item>
      </el-descriptions>
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
  grade: '',
  className: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const loading = ref(false)
const classList = ref<any[]>([])
const classDialogVisible = ref(false)
const currentClass = ref<any>({})

// 获取班级列表
const fetchClassList = async () => {
  loading.value = true
  try {
    // TODO: 调用后端API
    // const response = await api.getClassList({ ...searchForm, ...pagination })
    // classList.value = response.data.list
    // pagination.total = response.data.total
    
    // 模拟数据
    classList.value = [
      { id: 1, className: '三年级1班', grade: '三年级', teacherName: '张老师', studentCount: 45, avgScore: 85, passRate: 92 },
      { id: 2, className: '三年级2班', grade: '三年级', teacherName: '李老师', studentCount: 42, avgScore: 82, passRate: 88 },
      { id: 3, className: '四年级1班', grade: '四年级', teacherName: '王老师', studentCount: 48, avgScore: 88, passRate: 95 }
    ]
    pagination.total = 24
  } finally {
    loading.value = false
  }
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return '#67C23A'
  if (percentage >= 80) return '#E6A23C'
  return '#F56C6C'
}

const handleSearch = () => {
  pagination.page = 1
  fetchClassList()
}

const handleReset = () => {
  searchForm.grade = ''
  searchForm.className = ''
  handleSearch()
}

const handleAddClass = () => {
  router.push('/admin/class/create')
}

const viewClassDetail = (row: any) => {
  currentClass.value = row
  classDialogVisible.value = true
}

const viewStudents = (row: any) => {
  router.push(`/admin/class/${row.id}/students`)
}

const editClass = (row: any) => {
  router.push(`/admin/class/edit/${row.id}`)
}

const deleteClass = (row: any) => {
  ElMessageBox.confirm('确定要删除该班级吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // TODO: 调用后端API删除
    // await api.deleteClass(row.id)
    ElMessage.success('删除成功')
    fetchClassList()
  })
}

const handleSizeChange = () => {
  fetchClassList()
}

const handleCurrentChange = () => {
  fetchClassList()
}

onMounted(() => {
  fetchClassList()
})
</script>

<style scoped lang="scss">
.class-management {
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
