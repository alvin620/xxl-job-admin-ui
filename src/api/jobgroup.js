import request from '@/utils/request'

// 仅保留后端需要的字段，避免 updateTime 等类型不匹配
function buildJobGroupParams(data) {
  const params = new URLSearchParams()
  const allowKeys = ['id', 'appname', 'title', 'addressType', 'addressList']
  allowKeys.forEach(key => {
    const val = data[key]
    if (val !== undefined && val !== null && val !== '') {
      params.append(key, val)
    }
  })
  return params
}

// 执行器列表
export function getJobGroupList(params) {
  return request({
    url: '/jobgroup/pageList',
    method: 'get',
    params: {
      offset: (params.page - 1) * params.pagesize,
      pagesize: params.pagesize,
      appname: params.appname || '',
      title: params.title || ''
    }
  })
}

// 获取所有执行器
export function getAllJobGroups() {
  return request({
    url: '/jobgroup/pageList',
    method: 'get',
    params: {
      offset: 0,
      pagesize: 1000
    }
  })
}

// 添加执行器
export function addJobGroup(data) {
  const params = buildJobGroupParams(data || {})
  return request({
    url: '/jobgroup/insert',
    method: 'post',
    data: params
  })
}

// 更新执行器
export function updateJobGroup(data) {
  const params = buildJobGroupParams(data || {})
  return request({
    url: '/jobgroup/update',
    method: 'post',
    data: params
  })
}

// 删除执行器
export function deleteJobGroup(id) {
  return request({
    url: '/jobgroup/delete',
    method: 'post',
    params: { 'ids[]': [id] }
  })
}

// 根据ID获取执行器
export function getJobGroupById(id) {
  return request({
    url: '/jobgroup/loadById',
    method: 'get',
    params: { id }
  })
}

