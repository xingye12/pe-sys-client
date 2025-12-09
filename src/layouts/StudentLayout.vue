<template>
  <el-container class="student-layout">
    <el-aside width="200px">
      <div class="logo">
        <el-icon :size="30"><Medal /></el-icon>
        <span>学生中心</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#13c2c2"
        text-color="#e6fffb"
        active-text-color="#fff"
        router
      >
        <el-menu-item index="/student/scores">
          <el-icon><TrendCharts /></el-icon>
          <span>我的成绩</span>
        </el-menu-item>
        <el-menu-item index="/student/resources">
          <el-icon><VideoPlay /></el-icon>
          <span>学习资源</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/student/scores' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userAvatar" />
              <span>{{ username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Medal, TrendCharts, VideoPlay, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const username = ref('张三')
const userAvatar = ref('')

const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    '/student/scores': '我的成绩',
    '/student/resources': '学习资源'
  }
  return titleMap[route.path] || '首页'
})

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心')
      break
    case 'logout':
      ElMessage.success('退出成功')
      router.push('/login')
      break
  }
}
</script>

<style scoped lang="scss">
.student-layout {
  height: 100vh;

  .el-aside {
    background-color: #13c2c2;
    color: #fff;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 18px;
      font-weight: bold;
      color: #fff;
      border-bottom: 1px solid #08979c;
    }

    .sidebar-menu {
      border-right: none;
    }
  }

  .app-header {
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .header-left {
      flex: 1;
    }

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 4px;
        transition: background-color 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }

  .app-main {
    background-color: #f0f2f5;
    overflow-y: auto;
  }
}
</style>
