<template>
  <div class="learning-resources">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学习资源中心</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索资源"
            style="width: 300px;"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <!-- 分类标签 -->
      <div class="category-tabs">
        <el-tag
          v-for="cat in categories"
          :key="cat.value"
          :type="currentCategory === cat.value ? 'primary' : 'info'"
          :effect="currentCategory === cat.value ? 'dark' : 'plain'"
          size="large"
          style="margin-right: 10px; cursor: pointer;"
          @click="handleCategoryChange(cat.value)"
        >
          {{ cat.label }}
        </el-tag>
      </div>

      <!-- 资源列表 -->
      <el-row :gutter="20" style="margin-top: 30px;">
        <el-col :span="6" v-for="resource in resourceList" :key="resource.id">
          <el-card class="resource-card" shadow="hover">
            <div class="video-thumbnail" @click="handlePlayVideo(resource)">
              <img :src="resource.thumbnail" :alt="resource.title" />
              <div class="play-overlay">
                <el-icon :size="50"><VideoPlay /></el-icon>
              </div>
              <div class="duration">{{ resource.duration }}</div>
            </div>
            <div class="resource-info">
              <h3>{{ resource.title }}</h3>
              <p>{{ resource.description }}</p>
              <div class="resource-meta">
                <span><el-icon><View /></el-icon> {{ resource.views }}</span>
                <span><el-icon><Star /></el-icon> {{ resource.likes }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 视频播放对话框 -->
    <el-dialog v-model="playerVisible" :title="currentVideo.title" width="80%" top="5vh">
      <div class="video-player">
        <video
          v-if="currentVideo.url"
          :src="currentVideo.url"
          controls
          autoplay
          style="width: 100%;"
        />
      </div>
      <div class="video-description">
        <h3>视频说明</h3>
        <p>{{ currentVideo.detailDescription }}</p>
        
        <el-divider>动作要点</el-divider>
        <ul>
          <li v-for="(point, index) in currentVideo.keyPoints" :key="index">{{ point }}</li>
        </ul>

        <el-divider>常见错误</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="(error, index) in currentVideo.commonErrors"
            :key="index"
            type="danger"
          >
            <strong>{{ error.title }}</strong>
            <p>{{ error.description }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, VideoPlay, View, Star } from '@element-plus/icons-vue'
import { studentApi } from '@/api'

const searchKeyword = ref('')
const currentCategory = ref('all')
const resourceList = ref<any[]>([])
const playerVisible = ref(false)
const currentVideo = ref<any>({})

const categories = [
  { label: '全部', value: 'all' },
  { label: '50米跑', value: '50m' },
  { label: '800米跑', value: '800m' },
  { label: '立定跳远', value: 'jump' },
  { label: '仰卧起坐', value: 'situp' },
  { label: '跳绳', value: 'rope' }
]

const loadResources = async () => {
  try {
    const res = await studentApi.getVideoResources(currentCategory.value === 'all' ? undefined : currentCategory.value)
    resourceList.value = res.data || []
  } catch (error) {
    ElMessage.error('加载资源失败')
  }
}

const handleCategoryChange = (category: string) => {
  currentCategory.value = category
  loadResources()
}

const handleSearch = () => {
  // 实现搜索逻辑
  console.log('搜索:', searchKeyword.value)
}

const handlePlayVideo = (resource: any) => {
  currentVideo.value = resource
  playerVisible.value = true
}

onMounted(() => {
  loadResources()
})
</script>

<style scoped lang="scss">
.learning-resources {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .category-tabs {
    padding: 20px 0;
  }

  .resource-card {
    margin-bottom: 20px;
    cursor: pointer;

    .video-thumbnail {
      position: relative;
      width: 100%;
      height: 180px;
      overflow: hidden;
      border-radius: 8px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }

      &:hover img {
        transform: scale(1.1);
      }

      .play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
        color: white;
      }

      &:hover .play-overlay {
        opacity: 1;
      }

      .duration {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
    }

    .resource-info {
      padding: 15px 0;

      h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      p {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #909399;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .resource-meta {
        display: flex;
        gap: 15px;
        font-size: 12px;
        color: #909399;

        span {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }
    }
  }

  .video-player {
    margin-bottom: 20px;
  }

  .video-description {
    h3 {
      color: #303133;
      margin-bottom: 10px;
    }

    p {
      color: #606266;
      line-height: 1.6;
    }

    ul {
      padding-left: 20px;

      li {
        color: #606266;
        line-height: 2;
      }
    }
  }
}
</style>
