import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '调度中心', icon: 'HomeFilled' }
      },
      {
        path: 'jobinfo',
        name: 'JobInfo',
        component: () => import('@/views/JobInfo.vue'),
        meta: { title: '任务管理', icon: 'Clock' }
      },
      {
        path: 'joblog',
        name: 'JobLog',
        component: () => import('@/views/JobLog.vue'),
        meta: { title: '执行日志', icon: 'Document' }
      },
      {
        path: 'jobgroup',
        name: 'JobGroup',
        component: () => import('@/views/JobGroup.vue'),
        meta: { title: '执行器管理', icon: 'Cloudy', requireAdmin: true }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/User.vue'),
        meta: { title: '用户管理', icon: 'User', requireAdmin: true }
      },
      {
        path: 'help',
        name: 'Help',
        component: () => import('@/views/Help.vue'),
        meta: { title: '使用教程', icon: 'HelpFilled' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 检查登录状态（通过cookie）
  const isLoggedIn = userStore.checkLogin() || userStore.token
  
  if (to.path === '/login') {
    if (isLoggedIn) {
      next('/')
    } else {
      next()
    }
  } else {
    if (!isLoggedIn) {
      next('/login')
    } else {
      // 不在前端做角色限制，具体权限交给后端控制
      next()
    }
  }
})

export default router

