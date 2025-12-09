<template>
  <div class="class-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>班级管理</span>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </template>

      <el-table :data="classList" style="width: 100%" v-loading="loading">
        <el-table-column prop="className" label="班级名称" width="150" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="teacherName" label="班主任" width="120" />
        <el-table-column prop="studentCount" label="学生人数" width="100" />
        <el-table-column prop="avgScore" label="平均成绩" width="100" />
        <el-table-column prop="passRate" label="及格率" width="100">
          <template #default="{ row }">{{ row.passRate }}%</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="300">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="handlePublishTask(row)">发布任务</el-button>
            <el-button size="small" type="success" @click="handleUploadVideo(row)">上传视频</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 班级详情对话框 -->
    <el-dialog v-model="detailVisible" title="班级详情" width="80%">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="学生列表" name="students">
          <el-table :data="studentList" style="width: 100%">
            <el-table-column prop="studentName" label="姓名" />
            <el-table-column prop="studentNo" label="学号" />
            <el-table-column prop="gender" label="性别" />
            <el-table-column prop="avgScore" label="平均成绩" />
            <el-table-column prop="rank" label="班级排名" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="考试任务" name="tasks">
          <el-table :data="taskList" style="width: 100%">
            <el-table-column prop="taskName" label="任务名称" />
            <el-table-column prop="project" label="考试项目" />
            <el-table-column prop="startTime" label="开始时间" />
            <el-table-column prop="endTime" label="结束时间" />
            <el-table-column prop="status" label="状态" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 发布任务对话框 -->
    <el-dialog v-model="taskVisible" title="发布考试任务" width="600px">
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.taskName" />
        </el-form-item>
        <el-form-item label="考试项目">
          <el-select v-model="taskForm.projects" multiple placeholder="请选择">
            <el-option label="50米跑" value="50m" />
            <el-option label="800米跑" value="800m" />
            <el-option label="立定跳远" value="jump" />
            <el-option label="仰卧起坐" value="situp" />
            <el-option label="跳绳" value="rope" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="taskForm.startTime" type="datetime" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="taskForm.endTime" type="datetime" />
        </el-form-item>
        <el-form-item label="任务说明">
          <el-input v-model="taskForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitTask">发布</el-button>
      </template>
    </el-dialog>

    <!-- 视频上传对话框 -->
    <el-dialog v-model="uploadVisible" title="批量上传视频" width="600px">
      <el-upload
        drag
        multiple
        :auto-upload="false"
        :file-list="fileList"
        :on-change="handleFileChange"
        accept="video/*"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">支持批量上传视频文件，单个文件不超过500MB</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitUpload" :loading="uploading">
          上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { adminApi } from '@/api'

const loading = ref(false)
const classList = ref([])
const detailVisible = ref(false)
const taskVisible = ref(false)
const uploadVisible = ref(false)
const activeTab = ref('students')
const studentList = ref([])
const taskList = ref([])
const uploading = ref(false)
const fileList = ref<any[]>([])
const currentClass = ref<any>(null)

const taskForm = ref({
  taskName: '',
  projects: [],
  startTime: '',
  endTime: '',
  description: ''
})

const loadClassList = async () => {
  loading.value = true
  try {
    const res = await adminApi.getClassList()
    classList.value = res.data || []
  } catch (error) {
    ElMessage.error('加载班级列表失败')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadClassList()
}

const handleViewDetail = async (row: any) => {
  currentClass.value = row
  detailVisible.value = true
  // 加载班级详情数据
  try {
    const res = await adminApi.getClassDetail(row.classId)
    studentList.value = res.data.students || []
    taskList.value = res.data.tasks || []
  } catch (error) {
    ElMessage.error('加载班级详情失败')
  }
}

const handlePublishTask = (row: any) => {
  currentClass.value = row
  taskVisible.value = true
}

const handleSubmitTask = async () => {
  try {
    await adminApi.publishTask({
      classId: currentClass.value.classId,
      ...taskForm.value
    })
    ElMessage.success('任务发布成功')
    taskVisible.value = false
  } catch (error) {
    ElMessage.error('任务发布失败')
  }
}

const handleUploadVideo = (row: any) => {
  currentClass.value = row
  uploadVisible.value = true
}

const handleFileChange = (file: any, files: any[]) => {
  fileList.value = files
}

const handleSubmitUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的视频文件')
    return
  }
  
  uploading.value = true
  const formData = new FormData()
  fileList.value.forEach((file: any) => {
    formData.append('videos', file.raw)
  })
  formData.append('classId', currentClass.value.classId)
  
  try {
    await adminApi.uploadVideos(formData)
    ElMessage.success('视频上传成功')
    uploadVisible.value = false
    fileList.value = []
  } catch (error) {
    ElMessage.error('视频上传失败')
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  loadClassList()
})
</script>

<style scoped lang="scss">
.class-manage {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
