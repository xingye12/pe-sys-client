<template>
  <div class="video-upload">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>视频上传管理</span>
          <el-button type="primary" :icon="Upload" @click="uploadDialogVisible = true">批量上传</el-button>
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
        <el-form-item label="分析状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待分析" value="pending" />
            <el-option label="分析中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="分析失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="videoList" v-loading="loading" style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="project" label="考试项目" width="120" />
        <el-table-column prop="uploadTime" label="上传时间" width="160" />
        <el-table-column prop="fileSize" label="文件大小" width="100" />
        <el-table-column prop="status" label="分析状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="AI评分" width="100">
          <template #default="{ row }">
            <span v-if="row.score !== null">{{ row.score }}</span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="playVideo(row)">播放</el-button>
            <el-button link type="success" size="small" @click="analyzeVideo(row)" :disabled="row.status === 'processing'">
              分析
            </el-button>
            <el-button link type="info" size="small" @click="viewResult(row)" :disabled="!row.score">结果</el-button>
            <el-button link type="danger" size="small" @click="deleteVideo(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchVideoList"
        @current-change="fetchVideoList"
        class="pagination"
      />
    </el-card>

    <!-- 批量上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="批量上传视频" width="60%" @close="handleUploadClose">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="选择班级" required>
          <el-select v-model="uploadForm.classId" placeholder="请选择班级" style="width: 100%">
            <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试项目" required>
          <el-select v-model="uploadForm.project" placeholder="请选择项目" style="width: 100%">
            <el-option label="800米跑" value="800m" />
            <el-option label="立定跳远" value="jump" />
            <el-option label="仰卧起坐" value="situp" />
            <el-option label="跳绳" value="rope" />
            <el-option label="50米跑" value="50m" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传视频" required>
          <el-upload
            ref="uploadRef"
            :action="uploadAction"
            :headers="uploadHeaders"
            :data="uploadForm"
            :file-list="fileList"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            :before-upload="beforeUpload"
            multiple
            drag
            accept="video/*"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持mp4、avi、mov等视频格式，单个文件不超过500MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="uploading">确定上传</el-button>
      </template>
    </el-dialog>

    <!-- 视频播放对话框 -->
    <el-dialog v-model="playDialogVisible" title="视频播放" width="70%">
      <video v-if="currentVideo" :src="currentVideo.url" controls style="width: 100%; max-height: 500px;"></video>
    </el-dialog>

    <!-- 分析结果对话框 -->
    <el-dialog v-model="resultDialogVisible" title="AI分析结果" width="70%">
      <el-descriptions :column="2" border v-if="currentResult">
        <el-descriptions-item label="学生姓名">{{ currentResult.studentName }}</el-descriptions-item>
        <el-descriptions-item label="考试项目">{{ currentResult.project }}</el-descriptions-item>
        <el-descriptions-item label="综合得分">
          <el-tag :type="currentResult.score >= 90 ? 'success' : currentResult.score >= 80 ? '' : 'warning'" size="large">
            {{ currentResult.score }} 分
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="动作评级">{{ currentResult.rating }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider content-position="left">技术分析</el-divider>
      <el-timeline>
        <el-timeline-item v-for="issue in currentResult.issues" :key="issue.id" :type="issue.level">
          <p><strong>{{ issue.timestamp }}</strong></p>
          <p>{{ issue.description }}</p>
        </el-timeline-item>
      </el-timeline>

      <el-divider content-position="left">改进建议</el-divider>
      <el-alert
        v-for="suggestion in currentResult.suggestions"
        :key="suggestion.id"
        :title="suggestion.title"
        :type="suggestion.type"
        :description="suggestion.content"
        style="margin-bottom: 10px;"
        show-icon
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Search, Refresh, UploadFilled } from '@element-plus/icons-vue'

const searchForm = reactive({
  classId: '',
  project: '',
  status: ''
})

const uploadForm = reactive({
  classId: '',
  project: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const loading = ref(false)
const uploading = ref(false)
const uploadDialogVisible = ref(false)
const playDialogVisible = ref(false)
const resultDialogVisible = ref(false)

const classList = ref([
  { id: 1, name: '三年级1班' },
  { id: 2, name: '三年级2班' },
  { id: 3, name: '四年级1班' }
])

const videoList = ref([
  { id: 1, studentName: '张三', className: '三年级1班', project: '800米跑', uploadTime: '2024-01-15 14:30', fileSize: '125MB', status: 'completed', score: 88 },
  { id: 2, studentName: '李四', className: '三年级1班', project: '立定跳远', uploadTime: '2024-01-15 14:25', fileSize: '98MB', status: 'processing', score: null },
  { id: 3, studentName: '王五', className: '三年级2班', project: '仰卧起坐', uploadTime: '2024-01-15 14:20', fileSize: '110MB', status: 'pending', score: null }
])

const fileList = ref([])
const uploadRef = ref()
const currentVideo = ref<any>(null)
const currentResult = ref<any>(null)

const uploadAction = ref('/api/admin/videos/upload')
const uploadHeaders = ref({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待分析',
    processing: '分析中',
    completed: '已完成',
    failed: '分析失败'
  }
  return map[status] || status
}

const fetchVideoList = async () => {
  loading.value = true
  try {
    // TODO: 调用后端API
    // const response = await adminApi.getVideoList({ ...searchForm, ...pagination })
    // videoList.value = response.data.list
    // pagination.total = response.data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchVideoList()
}

const handleReset = () => {
  Object.assign(searchForm, { classId: '', project: '', status: '' })
  handleSearch()
}

const beforeUpload = (file: File) => {
  const isVideo = file.type.startsWith('video/')
  const isLt500M = file.size / 1024 / 1024 < 500

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return false
  }
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过 500MB!')
    return false
  }
  return true
}

const handleUploadSuccess = (response: any, file: any) => {
  ElMessage.success(`${file.name} 上传成功`)
}

const handleUploadError = (error: any, file: any) => {
  ElMessage.error(`${file.name} 上传失败`)
}

const handleUploadProgress = (event: any, file: any) => {
  // 处理上传进度
}

const submitUpload = () => {
  if (!uploadForm.classId || !uploadForm.project) {
    ElMessage.warning('请先选择班级和考试项目')
    return
  }
  uploadRef.value?.submit()
}

const handleUploadClose = () => {
  fileList.value = []
  Object.assign(uploadForm, { classId: '', project: '' })
}

const playVideo = (row: any) => {
  currentVideo.value = {
    ...row,
    url: `https://example.com/videos/${row.id}.mp4` // TODO: 替换为实际视频URL
  }
  playDialogVisible.value = true
}

const analyzeVideo = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要对该视频进行AI分析吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    ElMessage.info('视频分析已开始，请稍后查看结果')
    // TODO: 调用后端API
    // await adminApi.analyzeVideo(row.id)
    fetchVideoList()
  } catch {}
}

const viewResult = (row: any) => {
  // TODO: 从后端获取分析结果
  currentResult.value = {
    studentName: row.studentName,
    project: '800米跑',
    score: 88,
    rating: '优秀',
    issues: [
      { id: 1, timestamp: '00:15', description: '起跑姿势标准，反应迅速', level: 'success' },
      { id: 2, timestamp: '01:30', description: '中途跑步节奏稳定，呼吸均匀', level: 'success' },
      { id: 3, timestamp: '02:45', description: '冲刺阶段摆臂幅度可以更大', level: 'warning' }
    ],
    suggestions: [
      { id: 1, title: '起跑技巧', content: '保持良好的起跑姿势，继续保持', type: 'success' },
      { id: 2, title: '冲刺提升', content: '建议加强冲刺阶段的爆发力训练，增大摆臂幅度', type: 'warning' }
    ]
  }
  resultDialogVisible.value = true
}

const deleteVideo = (row: any) => {
  ElMessageBox.confirm('确定要删除该视频吗？删除后无法恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // TODO: 调用后端API
    ElMessage.success('删除成功')
    fetchVideoList()
  })
}

onMounted(() => {
  fetchVideoList()
})
</script>

<style scoped lang="scss">
.video-upload {
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
