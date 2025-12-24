<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #409EFF;">
              <el-icon><Flag /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.jobInfoCount || 0 }}</div>
              <div class="stat-label">任务数量</div>
              <div class="stat-desc">调度中心运行的任务数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #F2A340;">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.jobLogCount || 0 }}</div>
              <div class="stat-label">调度次数</div>
              <div class="stat-desc">调度中心触发的调度次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #67C23A;">
              <el-icon><Operation /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.executorCount || 0 }}</div>
              <div class="stat-label">执行器数量</div>
              <div class="stat-desc">调度中心在线的执行器机器数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <div class="report-header">
        <span class="report-title">调度报表</span>
        <el-popover placement="bottom-end" trigger="click" width="360">
          <template #reference>
            <el-button circle type="primary">
              <el-icon><Calendar /></el-icon>
            </el-button>
          </template>
          <div class="popover-content">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :default-time="['00:00:00', '23:59:59']"
              @change="handleDateChange"
              style="width: 100%;"
            />
            <div class="shortcut-btns">
              <el-button size="small" @click="shortcutRange(7)">近7天</el-button>
              <el-button size="small" @click="shortcutRange(30)">近30天</el-button>
            </div>
          </div>
        </el-popover>
      </div>
      <div class="report-sub-header">
        <span class="report-sub-title">日期分布图</span>
        <div class="report-legend">
          <span class="legend-item">
            <span class="legend-dot success"></span>成功
          </span>
          <span class="legend-item">
            <span class="legend-dot fail"></span>失败
          </span>
          <span class="legend-item">
            <span class="legend-dot running"></span>进行中
          </span>
        </div>
      </div>
      <div class="charts">
        <div class="chart-item" ref="chartRef"></div>
        <div class="chart-item" ref="pieRef"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { getChartInfo, getJobTotal, getExecutorCount } from '@/api/dashboard'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { Flag, Calendar, Operation } from '@element-plus/icons-vue'

const chartRef = ref(null)
const pieRef = ref(null)
let chartInstance = null
let pieInstance = null
const dateRange = ref([
  dayjs().subtract(7, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
])

const stats = ref({
  jobInfoCount: 0,
  jobLogCount: 0,
  jobLogSuccessCount: 0,
  jobLogFailCount: 0,
  jobLogRunningCount: 0,
  executorCount: 0
})

const initChart = () => {
  if (chartRef.value && !chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  if (pieRef.value && !pieInstance) {
    pieInstance = echarts.init(pieRef.value)
  }

  if (chartInstance) {
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show: false
      },
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '执行成功',
          type: 'line',
          data: [],
          itemStyle: { color: '#67C23A' }
        },
        {
          name: '执行失败',
          type: 'line',
          data: [],
          itemStyle: { color: '#F56C6C' }
        },
        {
          name: '运行中',
          type: 'line',
          data: [],
          itemStyle: { color: '#E6A23C' }
        }
      ]
    }
    chartInstance.setOption(option)
  }

  if (pieInstance) {
    pieInstance.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '成功比例图',
          type: 'pie',
          radius: '70%',
          data: [
            { value: stats.value.jobLogSuccessCount, name: '成功' },
            { value: stats.value.jobLogFailCount, name: '失败' },
            { value: stats.value.jobLogRunningCount, name: '进行中' }
          ],
          label: { formatter: '{b}: {d}%' },
          color: ['#67C23A', '#F56C6C', '#E6A23C']
        }
      ]
    })
  }
}

const loadChartData = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) return
  
  const startDate = dayjs(dateRange.value[0]).startOf('second').format('YYYY-MM-DD HH:mm:ss')
  const endDate = dayjs(dateRange.value[1]).endOf('second').format('YYYY-MM-DD HH:mm:ss')

  try {
    const res = await getChartInfo(startDate, endDate)
    
    if (res.code === 200) {
      const data = res.content || {}
      stats.value.jobLogRunningCount = data.triggerCountRunningTotal || 0
      stats.value.jobLogSuccessCount = data.triggerCountSucTotal || 0
      stats.value.jobLogFailCount = data.triggerCountFailTotal || 0
      stats.value.jobLogCount = (stats.value.jobLogRunningCount + stats.value.jobLogSuccessCount + stats.value.jobLogFailCount)
      if (chartInstance) {
        const option = {
          xAxis: {
            data: data.triggerDayList || []
          },
          series: [
            { data: data.triggerDayCountSucList || [] },
            { data: data.triggerDayCountFailList || [] },
            { data: data.triggerDayCountRunningList || [] }
          ]
        }
        chartInstance.setOption(option)
      }
      if (pieInstance) {
        pieInstance.setOption({
          series: [
            {
              data: [
                { value: stats.value.jobLogSuccessCount, name: '成功' },
                { value: stats.value.jobLogFailCount, name: '失败' },
                { value: stats.value.jobLogRunningCount, name: '进行中' }
              ]
            }
          ]
        })
      }
    }
  } catch (error) {
    console.error('Load chart data error:', error)
  }
}

const handleDateChange = () => {
  loadChartData()
}

const shortcutRange = (days) => {
  dateRange.value = [
    dayjs().subtract(days, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ]
  loadChartData()
}

const loadTotals = async () => {
  try {
    stats.value.jobInfoCount = await getJobTotal()
    stats.value.executorCount = await getExecutorCount()
  } catch (e) {
    console.error('Load totals error:', e)
  }
}

onMounted(() => {
  initChart()
  loadChartData()
  loadTotals()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  if (pieInstance) {
    pieInstance.dispose()
  }
})
</script>

<style scoped lang="scss">
.dashboard {
  .stat-item {
    display: flex;
    align-items: center;
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      margin-right: 15px;
    }
    
    .stat-content {
      flex: 1;
      
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 5px;
      }
      
      .stat-label {
        font-size: 14px;
        color: #909399;
      }

      .stat-desc {
        font-size: 12px;
        color: #C0C4CC;
        margin-top: 4px;
      }
    }
  }
  
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .report-title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .report-sub-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .report-sub-title {
      font-size: 14px;
      font-weight: 500;
    }

    .report-legend {
      display: flex;
      column-gap: 16px;

      .legend-item {
        display: flex;
        align-items: center;
        font-size: 13px;
        color: #606266;

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 4px;
        }

        .success {
          background-color: #67C23A;
        }

        .fail {
          background-color: #F56C6C;
        }

        .running {
          background-color: #E6A23C;
        }
      }
    }
  }

  .popover-content {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }

  .shortcut-btns {
    display: flex;
    justify-content: flex-end;
    column-gap: 8px;
  }

  .charts {
    display: flex;
    column-gap: 20px;
    height: 420px;
  }
  .chart-item {
    flex: 1;
    min-height: 400px;
  }
}
</style>

