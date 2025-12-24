import request from '@/utils/request'
import dayjs from 'dayjs'
import { getJobList } from './job'
import { getJobGroupList } from './jobgroup'

// 获取仪表盘信息（默认过去30天，带时间）
export function getDashboardInfo() {
  const startDate = dayjs().subtract(30, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
  const endDate = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  return getChartInfo(startDate, endDate)
}

// 获取图表数据
export function getChartInfo(startDate, endDate) {
  return request({
    url: '/chartInfo',
    method: 'get',
    params: {
      startDate,
      endDate
    }
  })
}

// 获取任务总数
export async function getJobTotal() {
  const res = await getJobList({
    page: 1,
    pagesize: 1,
    jobGroup: -1,
    triggerStatus: -1,
    jobDesc: '',
    executorHandler: '',
    author: ''
  })
  return res?.content?.total || 0
}

// 获取执行器机器地址数量（去重）
export async function getExecutorCount() {
  const res = await getJobGroupList({
    page: 1,
    pagesize: 1000,
    appname: '',
    title: ''
  })
  const list = res?.content?.data || []
  const addrSet = new Set()
  list.forEach(item => {
    if (item.registryList && Array.isArray(item.registryList)) {
      item.registryList.forEach(a => addrSet.add(a))
    } else if (item.addressList) {
      item.addressList.split(',').map(s => s.trim()).filter(Boolean).forEach(a => addrSet.add(a))
    }
  })
  return addrSet.size
}

