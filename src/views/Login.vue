<template>
  <div class="login-container">
    <div class="decor decor-1"></div>
    <div class="decor decor-2"></div>
    <div class="login-wrapper">
      <div class="info-panel">
        <div class="brand">
          <div class="logo-circle">XXL</div>
          <div>
            <div class="brand-name">XXL-JOB 调度中心</div>
            <div class="brand-sub">Enterprise Task Orchestration</div>
          </div>
        </div>
        <p class="info-title">让任务调度更可视、更可靠、更高效</p>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">10w+</div>
            <div class="stat-label">日均触发</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">99.9%</div>
            <div class="stat-label">任务成功率</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">360°</div>
            <div class="stat-label">全链路监控</div>
          </div>
        </div>
        <div class="feature-list">
          <div
            class="feature-item"
            v-for="feature in featureList"
            :key="feature.title"
          >
            <div class="feature-icon">
              <el-icon :size="18">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <div>
              <div class="feature-title">{{ feature.title }}</div>
              <div class="feature-desc">{{ feature.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="login-box">
        <div class="login-header">
          <h2>调度中心登录</h2>
          <p>连接你的任务矩阵，实时掌握执行态势</p>
        </div>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名 / 邮箱"
              size="large"
              prefix-icon="User"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              立即登录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="login-footer">
          <span>安全加固 · 多节点容灾 · 实时报警</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Timer, TrendCharts, DataAnalysis, Connection } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const featureList = [
  {
    title: '分布式秒级调度',
    desc: '多节点并发触发，灵活分片分组，让批量任务更快完成',
    icon: Timer
  },
  {
    title: '全链路可观测',
    desc: '执行日志、耗时、QPS、失败率一目了然，指标实时刷新',
    icon: TrendCharts
  },
  {
    title: '智能告警与自愈',
    desc: '延迟、失败自动预警，支持重试与熔断，降低人工介入成本',
    icon: DataAnalysis
  },
  {
    title: '异构系统编排',
    desc: 'HTTP、脚本、RPC、数据同步多种类型任务统一编排',
    icon: Connection
  }
]

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm)
        ElMessage.success('登录成功')
        // 跳转到首页
        router.push('/dashboard')
      } catch (error) {
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100vh;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12), transparent 35%),
    radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.08), transparent 30%),
    linear-gradient(135deg, #15192c 0%, #1f2342 50%, #1b2a4a 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.decor {
  position: absolute;
  width: 320px;
  height: 320px;
  filter: blur(120px);
  opacity: 0.55;
}

.decor-1 {
  background: #4f8aff;
  top: -80px;
  right: 10%;
}

.decor-2 {
  background: #9c5bff;
  bottom: -120px;
  left: 12%;
}

.login-wrapper {
  width: 1100px;
  max-width: 92vw;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 32px;
  z-index: 1;
}

.info-panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  padding: 36px;
  border-radius: 16px;
  color: #e9ecf5;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.logo-circle {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #4f8aff, #6f79ff);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.brand-name {
  font-size: 22px;
  font-weight: 600;
  color: #fff;
}

.brand-sub {
  font-size: 12px;
  color: #b8bfd9;
}

.info-title {
  font-size: 18px;
  color: #f5f7ff;
  margin: 8px 0 18px;
  line-height: 1.5;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.stat-card {
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 12px;
  color: #c7cde2;
  margin-top: 4px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(79, 138, 255, 0.18), rgba(120, 98, 255, 0.18));
  display: grid;
  place-items: center;
  color: #c8d5ff;
}

.feature-title {
  color: #fff;
  font-weight: 600;
  margin-bottom: 4px;
}

.feature-desc {
  color: #c5cbe0;
  font-size: 13px;
  line-height: 1.4;
}

.login-box {
  width: 100%;
  padding: 34px 36px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.12);
}

.login-header {
  text-align: left;
  margin-bottom: 24px;
  
  h2 {
    color: #1f274d;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  
  p {
    color: #7a819c;
    font-size: 14px;
    margin: 0;
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #4f8aff, #6f79ff);
  border: none;
  box-shadow: 0 12px 30px rgba(79, 138, 255, 0.3);
}

.login-footer {
  margin-top: 8px;
  text-align: center;
  color: #8a92a9;
  font-size: 13px;
}

@media (max-width: 960px) {
  .login-wrapper {
    grid-template-columns: 1fr;
  }

  .info-panel {
    order: 2;
  }

  .login-box {
    order: 1;
  }
}
</style>
