import request from '@/utils/request'

function buildJobParams(data) {
  const params = new URLSearchParams()
  const allowKeys = [
    'id',
    'jobGroup',
    'jobDesc',
    'author',
    'alarmEmail',
    'scheduleType',
    'scheduleConf',
    'glueType',
    'executorHandler',
    'executorParam',
    'executorRouteStrategy',
    'childJobId',
    'misfireStrategy',
    'executorBlockStrategy',
    'executorTimeout',
    'executorFailRetryCount'
  ]
  allowKeys.forEach(key => {
    const val = data[key]
    if (val !== undefined && val !== null && val !== '') {
      params.append(key, val)
    }
  })
  return params
}

// 任务列表
export function getJobList(params) {
  return request({
    url: '/jobinfo/pageList',
    method: 'get',
    params: {
      offset: (params.page - 1) * params.pagesize,
      pagesize: params.pagesize,
      jobGroup: params.jobGroup || -1,
      triggerStatus: params.triggerStatus || -1,
      jobDesc: params.jobDesc || '',
      executorHandler: params.executorHandler || '',
      author: params.author || ''
    }
  })
}

// 添加任务
export function addJob(data) {
  const params = buildJobParams(data || {})
  return request({
    url: '/jobinfo/insert',
    method: 'post',
    data: params
  })
}

// 更新任务
export function updateJob(data) {
  const params = buildJobParams(data || {})
  return request({
    url: '/jobinfo/update',
    method: 'post',
    data: params
  })
}

// 删除任务
export function deleteJob(ids) {
  return request({
    url: '/jobinfo/delete',
    method: 'post',
    params: {
      'ids[]': ids
    }
  })
}

// 启动任务
export function startJob(id) {
  return request({
    url: '/jobinfo/start',
    method: 'post',
    params: { 'ids[]': [id] }
  })
}

// 停止任务
export function stopJob(id) {
  return request({
    url: '/jobinfo/stop',
    method: 'post',
    params: { 'ids[]': [id] }
  })
}

// 执行一次
export function triggerJob(id, executorParam) {
  return request({
    url: '/jobinfo/trigger',
    method: 'post',
    params: {
      id,
      executorParam: executorParam || '',
      addressList: '' // 后端需要该参数，传空字符串表示默认
    }
  })
}

// 获取下次执行时间
export function getNextTriggerTime(scheduleType, scheduleConf) {
  return request({
    url: '/jobinfo/nextTriggerTime',
    method: 'post',
    params: {
      scheduleType,
      scheduleConf
    }
  })
}

