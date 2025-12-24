import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 基础地址：开发环境强制走 Vite 代理，避免 CORS
const baseURL = import.meta.env.DEV
  ? '/xxl-job-admin'
  : (import.meta.env.VITE_API_BASE_URL || '/xxl-job-admin')

// 创建axios实例
const service = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true // 允许携带cookie
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 如果 data 是 URLSearchParams 实例，确保 Content-Type 正确设置
    if (config.data instanceof URLSearchParams) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码不是200，则认为是错误
    if (res.code && res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      
      // 401: 未登录或token过期
      if (res.code === 500 && res.msg && res.msg.includes('登录')) {
        const userStore = useUserStore()
        userStore.logout()
      }
      
      return Promise.reject(new Error(res.msg || '请求失败'))
    } else {
      // 统一兼容后端返回：data 和 content 两种写法
      const dataField = res.data !== undefined ? res.data : res.content
      return {
        ...res,
        content: dataField
      }
    }
  },
  error => {
    console.error('Response error:', error)
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service

