import request from '@/utils/request'

// 执行日志列表
export function getJobLogList(params) {
  return request({
    url: '/joblog/pageList',
    method: 'get',
    params: {
      offset: (params.page - 1) * params.pagesize,
      pagesize: params.pagesize,
      jobGroup: params.jobGroup || -1,
      jobId: params.jobId || -1,
      logStatus: params.logStatus || -1,
      filterTime: params.filterTime || ''
    }
  })
}

// 查看日志详情
export function getJobLogDetail(logId) {
  return request({
    url: '/joblog/logDetailCat',
    method: 'get',
    params: { logId, fromLineNum: 1 }
  })
}

// 终止任务
export function killJob(logId) {
  return request({
    url: '/joblog/logKill',
    method: 'post',
    params: { id: logId }
  })
}

// 清理日志
export function clearLog(jobGroup, jobId, type) {
  return request({
    url: '/joblog/clearLog',
    method: 'post',
    params: {
      jobGroup,
      jobId,
      type
    }
  })
}

