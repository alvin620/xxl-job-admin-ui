<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <span v-if="!isCollapse">XXL-JOB</span>
        <span v-else>XXL</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item
          v-for="item in menuList"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ userStore.userInfo.userName || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="skin">主题切换</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 标签页 -->
      <div class="tabs-container">
        <el-tabs
          v-model="activeTab"
          type="card"
          closable
          @tab-remove="removeTab"
          @tab-click="handleTabClick"
        >
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.name"
            :label="tab.title"
            :name="tab.name"
          />
        </el-tabs>
      </div>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules">
        <el-form-item label="原密码" prop="password">
          <el-input v-model="passwordForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePassword">确定</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { updatePassword } from '@/api/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeTab = ref('')
const tabs = ref([])
const passwordDialogVisible = ref(false)
const passwordFormRef = ref(null)

const activeMenu = computed(() => route.path)

const menuList = computed(() => {
  const root = router.getRoutes().find(r => r.path === '/')
  const routes = root && root.children ? root.children : []
  // 始终显示所有业务菜单（权限由后端控制），仅过滤显式 hidden
  return routes.filter(r => !(r.meta && r.meta.hidden))
})

const passwordForm = reactive({
  password: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  password: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
    })
  } else if (command === 'password') {
    passwordDialogVisible.value = true
  } else if (command === 'skin') {
    // 简单主题切换：在 body 上添加/移除 dark-theme 类
    const body = document.body
    body.classList.toggle('dark-theme')
    ElMessage.info(body.classList.contains('dark-theme') ? '已切换到暗色主题（示例）' : '已切换回默认主题')
  }
}

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updatePassword({
          password: passwordForm.password,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功')
        passwordDialogVisible.value = false
        passwordForm.password = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        ElMessage.error(error.message || '密码修改失败')
      }
    }
  })
}

const removeTab = (targetName) => {
  if (tabs.value.length === 1) {
    ElMessage.warning('至少保留一个标签页')
    return
  }
  
  const index = tabs.value.findIndex(tab => tab.name === targetName)
  tabs.value.splice(index, 1)
  
  if (activeTab.value === targetName) {
    const nextTab = tabs.value[index - 1] || tabs.value[0]
    activeTab.value = nextTab.name
    router.push(nextTab.path)
  }
}

const handleTabClick = (tab) => {
  const targetTab = tabs.value.find(t => t.name === tab.paneName)
  if (targetTab) {
    router.push(targetTab.path)
  }
}

// 监听路由变化，添加标签页
watch(
  () => route.path,
  (newPath) => {
    const routeItem = router.getRoutes().find(r => r.path === newPath)
    if (routeItem && routeItem.meta.title) {
      const tab = {
        name: routeItem.name,
        title: routeItem.meta.title,
        path: newPath
      }
      
      const exists = tabs.value.find(t => t.name === tab.name)
      if (!exists) {
        tabs.value.push(tab)
      }
      activeTab.value = tab.name
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  
  .logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: white;
    font-size: 20px;
    font-weight: bold;
    background-color: #2b3a4b;
  }
  
  .el-menu {
    border-right: none;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  
  .header-left {
    .collapse-icon {
      font-size: 20px;
      cursor: pointer;
      color: #606266;
      
      &:hover {
        color: #409EFF;
      }
    }
  }
  
  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #606266;
      
      span {
        margin: 0 5px;
      }
      
      &:hover {
        color: #409EFF;
      }
    }
  }
}

.tabs-container {
  background-color: #fff;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
  
  :deep(.el-tabs__header) {
    margin: 0;
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>

