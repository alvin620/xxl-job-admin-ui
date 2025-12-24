import request from '@/utils/request'

function buildUserParams(data) {
  const params = new URLSearchParams()
  const allowKeys = ['id', 'username', 'password', 'role', 'permission']
  allowKeys.forEach(key => {
    const val = data[key]
    if (val !== undefined && val !== null && val !== '') {
      params.append(key, val)
    }
  })
  return params
}

// 用户列表
export function getUserList(params) {
  return request({
    url: '/user/pageList',
    method: 'get',
    params: {
      offset: (params.page - 1) * params.pagesize,
      pagesize: params.pagesize,
      username: params.username || '',
      role: params.role || -1
    }
  })
}

// 添加用户
export function addUser(data) {
  const params = buildUserParams(data || {})
  return request({
    url: '/user/insert',
    method: 'post',
    data: params
  })
}

// 更新用户
export function updateUser(data) {
  const params = buildUserParams(data || {})
  return request({
    url: '/user/update',
    method: 'post',
    data: params
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: '/user/delete',
    method: 'post',
    params: { 'ids[]': [id] }
  })
}

