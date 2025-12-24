import { defineStore } from 'pinia'
import { login, logout } from '@/api/auth'
import { getUserList } from '@/api/user'
import router from '@/router'

// 检查是否已登录（通过cookie）
function checkLoginStatus() {
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    const [name] = cookie.trim().split('=')
    if (name === 'xxl_job_login_token') {
      return true
    }
  }
  return false
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    isLoggedIn: checkLoginStatus() || !!localStorage.getItem('token')
  }),
  
  actions: {
    async login(loginForm) {
      try {
        const res = await login(loginForm)
        if (res.code === 200) {
          // 登录成功，设置登录状态
          this.token = res.content || 'logged_in'
          this.isLoggedIn = true
          localStorage.setItem('token', this.token)
          // 拉取当前用户信息（角色、权限）
          await this.fetchUserInfo(loginForm.username)
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    async fetchUserInfo(username) {
      try {
        const res = await getUserList({
          username: username || '',
          role: -1,
          page: 1,
          pagesize: 10
        })
        const list = res?.content?.data || []
        if (list.length > 0) {
          const user = list[0]
          this.userInfo = {
            id: user.id,
            username: user.username,
            role: user.role,
            permission: user.permission
          }
          this.isAdmin = user.role === 1
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          localStorage.setItem('isAdmin', String(this.isAdmin))
        }
      } catch (e) {
        console.error('Fetch user info error:', e)
      }
    },
    
    getUserInfo() {
      // 从cookie中解析用户信息（后端通过cookie传递）
      // 这里需要根据实际的后端实现来获取用户信息
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'xxl_job_login_token') {
          // 实际应该调用API获取用户信息
          // 这里简化处理，设置登录状态
          this.isLoggedIn = true
          // 尝试解析token获取用户信息（如果需要）
          try {
            if (value) {
              // 可以在这里解析JWT或调用API获取用户信息
              // 暂时不设置userInfo，因为需要从后端获取
            }
          } catch (e) {
            console.error('Parse user info error:', e)
          }
        }
      }
    },
    
    async logout() {
      try {
        await logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = ''
        this.userInfo = {}
        this.isAdmin = false
        this.isLoggedIn = false
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('isAdmin')
        router.push('/login')
      }
    },
    
    // 检查登录状态（通过cookie）
    checkLogin() {
      this.isLoggedIn = checkLoginStatus()
      if (this.isLoggedIn && !this.token) {
        this.token = 'logged_in'
        localStorage.setItem('token', this.token)
        // 如果本地没有用户信息，尝试从本地存储恢复
        if (!this.userInfo || !this.userInfo.username) {
          const info = localStorage.getItem('userInfo')
          if (info) {
            try {
              this.userInfo = JSON.parse(info)
              this.isAdmin = this.userInfo.role === 1
            } catch (e) {
              console.error('Parse userInfo from localStorage error:', e)
            }
          }
        }
      }
      return this.isLoggedIn
    }
  }
})

