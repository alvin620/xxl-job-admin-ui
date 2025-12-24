import request from '@/utils/request'

// 登录
export function login(data) {
  // 后端接口期望表单数据格式，不是JSON
  const params = new URLSearchParams()
  params.append('userName', data.username)
  params.append('password', data.password)
  params.append('ifRemember', data.remember ? 'on' : '')
  
  return request({
    url: '/auth/doLogin',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

// 修改密码
export function updatePassword(data) {
  return request({
    url: '/auth/updatePwd',
    method: 'post',
    data: {
      password: data.password,
      newPassword: data.newPassword
    }
  })
}

