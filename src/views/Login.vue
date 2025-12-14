<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <el-icon :size="50" color="#409EFF"><Trophy /></el-icon>
        <h1>中小学体育考试系统</h1>
        <p>Physical Education Examination System</p>
      </div>

      <el-form :model="loginForm" :rules="rules" ref="formRef" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item prop="role">
          <el-select
            v-model="loginForm.role"
            placeholder="请选择角色"
            size="large"
            style="width: 100%"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Trophy } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { authApi } from '@/api'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  role: 'admin'
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true

      try {
        // 调用登录API
        const response = await authApi.login({
          username: loginForm.username,
          password: loginForm.password,
          userType: loginForm.role // 注意：这里需要转换为后端期望的值
        })

        // 假设后端返回token和用户信息
        
        localStorage.setItem('role', loginForm.role)

        ElMessage.success('登录成功')
        console.log(loginForm.role)
        // 根据角色跳转到不同页面
        const routeMap: Record<string, string> = {
          admin: '/admin/dashboard',
          teacher: '/teacher/overview',
          student: '/student/scores'
        }
        router.push(routeMap[loginForm.role])

      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-box {
    width: 400px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      h1 {
        margin: 20px 0 10px;
        font-size: 28px;
        color: #303133;
      }

      p {
        font-size: 14px;
        color: #909399;
      }
    }

    .login-form {
      .el-form-item {
        margin-bottom: 24px;
      }
    }

    .login-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
