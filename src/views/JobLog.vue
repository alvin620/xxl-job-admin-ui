<template>
  <div class="job-log">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <span>执行日志</span>
          </div>
          <div class="card-header-right">
            <el-button
              type="danger"
              @click="batchKill"
              :disabled="!multipleSelection.length"
            >
              终止任务
            </el-button>
            <el-button @click="openClearDialog">日志清理</el-button>
            <el-button
              type="primary"
              plain
              @click="openSelectedDetail"
              :disabled="multipleSelection.length !== 1"
            >
              执行日志
            </el-button>
          </div>
        </div>
      </template>

      <!-- 查询表单 -->
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="执行器">
          <el-select
            v-model="queryForm.jobGroup"
            placeholder="请选择"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="group in jobGroupList"
              :key="group.id"
              :label="group.title"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务">
          <el-select
            v-model="queryForm.jobId"
            placeholder="请选择"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="job in jobList"
              :key="job.id"
              :label="job.jobDesc"
              :value="job.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.logStatus"
            placeholder="请选择"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" :value="-1" />
            <el-option label="成功" :value="200" />
            <el-option label="失败" :value="500" />
            <el-option label="运行中" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" v-show="showMore">
          <el-date-picker
            v-model="queryForm.filterTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button text type="primary" @click="showMore = !showMore">
            {{ showMore ? '收起筛选' : '更多筛选' }}
            <el-icon style="margin-left: 4px;">
              <component :is="showMore ? ArrowUp : ArrowDown" />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        highlight-current-row
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="调度日志ID" width="110" />
        <el-table-column label="任务" min-width="160">
          <template #default="{ row }">
            {{ jobNameMap[row.jobId] || row.jobDesc || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="调度时间" width="160">
          <template #default="{ row }">
            {{ formatShortTime(row.triggerTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="triggerCode" label="调度状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.triggerCode === 200" type="success">成功</el-tag>
            <el-tag v-else-if="row.triggerCode === 500" type="danger">失败</el-tag>
            <el-tag v-else type="warning">进行中</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="调度备注" min-width="120">
          <template #default="{ row }">
            <el-link
              v-if="row.triggerMsg"
              type="primary"
              :underline="false"
              @click.stop="openTriggerMsg(row)"
            >
              查看
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="执行时间" width="160">
          <template #default="{ row }">
            {{ formatShortTime(row.handleTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="handleCode" label="执行状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.handleCode === 200" type="success">成功</el-tag>
            <el-tag v-else-if="row.handleCode === 500" type="danger">失败</el-tag>
            <el-tag v-else type="warning">运行中</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行备注" min-width="120">
          <template #default="{ row }">
            <el-link
              v-if="row.handleMsg"
              type="primary"
              :underline="false"
              @click.stop="openHandleMsg(row)"
            >
              查看
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pagesize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="执行日志详情" width="80%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID">{{ detailData.jobId }}</el-descriptions-item>
        <el-descriptions-item label="调度时间">{{ detailData.triggerTime }}</el-descriptions-item>
        <el-descriptions-item label="执行时间">{{ detailData.handleTime }}</el-descriptions-item>
        <el-descriptions-item label="调度结果">
          <el-tag v-if="detailData.triggerCode === 200" type="success">成功</el-tag>
          <el-tag v-else-if="detailData.triggerCode === 500" type="danger">失败</el-tag>
          <el-tag v-else type="warning">进行中</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行结果">
          <el-tag v-if="detailData.handleCode === 200" type="success">成功</el-tag>
          <el-tag v-else-if="detailData.handleCode === 500" type="danger">失败</el-tag>
          <el-tag v-else type="warning">运行中</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="调度机器">{{ detailData.triggerAddress || '-' }}</el-descriptions-item>
        <el-descriptions-item label="执行机器">{{ detailData.executorAddress || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <div class="log-section">
        <h4>调度日志</h4>
        <el-input
          v-model="detailData.triggerMsg"
          type="textarea"
          :rows="6"
          readonly
          style="margin-top: 10px;"
        />
      </div>
      <el-divider />
      <div class="log-section">
        <h4>执行日志</h4>
        <el-input
          v-model="detailData.logContent"
          type="textarea"
          :rows="10"
          readonly
          style="margin-top: 10px;"
        />
      </div>
      <el-divider />
      <div class="log-section">
        <h4>执行备注</h4>
        <el-input
          v-model="detailData.handleMsg"
          type="textarea"
          :rows="6"
          readonly
          style="margin-top: 10px;"
        />
      </div>
    </el-dialog>

    <!-- 清理日志对话框 -->
    <el-dialog v-model="clearDialogVisible" title="清理日志" width="400px">
      <el-form :model="clearForm" label-width="120px">
        <el-form-item label="执行器">
          <el-select v-model="clearForm.jobGroup" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="group in jobGroupList"
              :key="group.id"
              :label="group.title"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务">
          <el-select v-model="clearForm.jobId" placeholder="请选择" style="width: 100%" clearable>
            <el-option
              v-for="job in jobList"
              :key="job.id"
              :label="job.jobDesc"
              :value="job.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="清理范围">
          <el-select v-model="clearForm.type" placeholder="请选择" style="width: 100%">
            <el-option label="清理一个月以前日志数据" :value="1" />
            <el-option label="清理三个月以前日志数据" :value="2" />
            <el-option label="清理六个月以前日志数据" :value="3" />
            <el-option label="清理一年以前日志数据" :value="4" />
            <el-option label="清理所有日志数据" :value="5" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="clearDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleClear">确定清理</el-button>
      </template>
    </el-dialog>

    <!-- 调度备注详情 -->
    <el-dialog v-model="triggerMsgDialogVisible" title="调度备注" width="600px">
      <el-input
        v-model="triggerMsgContent"
        type="textarea"
        :rows="10"
        readonly
      />
    </el-dialog>

    <!-- 执行备注详情 -->
    <el-dialog v-model="handleMsgDialogVisible" title="执行备注" width="600px">
      <el-input
        v-model="handleMsgContent"
        type="textarea"
        :rows="10"
        readonly
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getJobLogList, getJobLogDetail, killJob, clearLog } from '@/api/joblog'
import { getAllJobGroups } from '@/api/jobgroup'
import { getJobList } from '@/api/job'

const loading = ref(false)
const detailDialogVisible = ref(false)
const clearDialogVisible = ref(false)
const triggerMsgDialogVisible = ref(false)
const handleMsgDialogVisible = ref(false)
const jobGroupList = ref([])
const jobList = ref([])
const jobNameMap = ref({})
const multipleSelection = ref([])
const showMore = ref(false)
let skipAutoSelect = false
const triggerMsgContent = ref('')
const handleMsgContent = ref('')

const formatMsg = (msg) => {
  if (!msg) return ''
  return msg.replace(/<br\s*\/?>/gi, '\n')
}

const formatShortTime = (time) => {
  if (!time) return ''
  return dayjs(time).format('DD/MM HH:mm:ss')
}

const queryForm = reactive({
  jobGroup: '',
  jobId: '',
  logStatus: '',
  filterTime: []
})

const pagination = reactive({
  page: 1,
  pagesize: 10,
  total: 0
})

const tableData = ref([])
const detailData = ref({})
const clearForm = reactive({
  jobGroup: -1,
  jobId: -1,
  type: 1
})

const loadJobGroups = async () => {
  try {
    const res = await getAllJobGroups()
    if (res.code === 200) {
      jobGroupList.value = res.content?.data || []
      // 默认选中第一个执行器（除非重置后跳过自动选择）
      if (!skipAutoSelect && jobGroupList.value.length > 0) {
        queryForm.jobGroup = jobGroupList.value[0].id
        clearForm.jobGroup = jobGroupList.value[0].id
        return true
      }
    }
  } catch (error) {
    console.error('Load job groups error:', error)
  }
  return false
}

const loadJobs = async () => {
  if (!queryForm.jobGroup || queryForm.jobGroup === -1) {
    jobList.value = []
    return false
  }
  
  try {
    const res = await getJobList({
      jobGroup: queryForm.jobGroup,
      triggerStatus: -1,
      jobDesc: '',
      executorHandler: '',
      author: '',
      page: 1,
      pagesize: 1000
    })
    if (res.code === 200) {
      jobList.value = res.content?.data || []
      jobNameMap.value = {}
      jobList.value.forEach(job => {
        jobNameMap.value[job.id] = job.jobDesc
      })
      // 默认选中第一个任务（除非重置后跳过自动选择）
      if (!skipAutoSelect && jobList.value.length > 0) {
        queryForm.jobId = jobList.value[0].id
        clearForm.jobId = jobList.value[0].id
        return true
      }
    }
  } catch (error) {
    console.error('Load jobs error:', error)
  }
  return false
}

const loadData = async () => {
  if (!queryForm.jobGroup || !queryForm.jobId) {
    return
  }
  loading.value = true
  try {
    const filterTime = queryForm.filterTime && queryForm.filterTime.length === 2
      ? `${queryForm.filterTime[0]} - ${queryForm.filterTime[1]}`
      : ''
    
    const res = await getJobLogList({
      ...queryForm,
      jobGroup: queryForm.jobGroup || -1,
      jobId: queryForm.jobId || -1,
      logStatus: queryForm.logStatus || -1,
      filterTime,
      page: pagination.page,
      pagesize: pagination.pagesize
    })
    if (res.code === 200) {
      tableData.value = res.content?.data || []
      pagination.total = res.content?.total || 0
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  if (!queryForm.jobGroup || !queryForm.jobId) {
    ElMessage.warning('请先选择执行器和任务')
    return
  }
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  skipAutoSelect = true
  Object.assign(queryForm, {
    jobGroup: '',
    jobId: '',
    logStatus: '',
    filterTime: []
  })
  jobList.value = []
  pagination.page = 1
  pagination.total = 0
}

const handleRowClick = (row) => {
  // 行点击可视需要扩展，这里保持选择行为由勾选框控制
}

const handleViewDetail = async (row) => {
  try {
    const res = await getJobLogDetail(row.id)
    if (res.code === 200) {
      detailData.value = {
        ...row,
        logContent: res.content || '',
        triggerMsg: formatMsg(row.triggerMsg || ''),
        handleMsg: formatMsg(row.handleMsg || ''),
        triggerAddress: row.triggerAddress || ''
      }
      detailDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('加载日志详情失败')
  }
}

const openTriggerMsg = (row) => {
  triggerMsgContent.value = formatMsg(row.triggerMsg || '')
  triggerMsgDialogVisible.value = true
}

const openHandleMsg = (row) => {
  handleMsgContent.value = formatMsg(row.handleMsg || '')
  handleMsgDialogVisible.value = true
}

const handleSelectionChange = (rows) => {
  multipleSelection.value = rows || []
}

const batchKill = async () => {
  if (!multipleSelection.value.length) {
    ElMessage.warning('请先选择要终止的日志')
    return
  }
  try {
    await Promise.all(
      multipleSelection.value.map(row => killJob(row.id))
    )
    ElMessage.success('终止任务请求已发送')
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '终止任务失败')
  }
}

const openSelectedDetail = () => {
  if (multipleSelection.value.length !== 1) {
    ElMessage.warning('请选择一条日志查看')
    return
  }
  handleViewDetail(multipleSelection.value[0])
}

const handleKill = async (row) => {
  try {
    const res = await killJob(row.id)
    if (res.code === 200) {
      ElMessage.success('终止成功')
      loadData()
    }
  } catch (error) {
    ElMessage.error(error.message || '终止失败')
  }
}

const openClearDialog = () => {
  clearForm.jobGroup = queryForm.jobGroup
  clearForm.jobId = queryForm.jobId
  clearDialogVisible.value = true
}

const handleClear = async () => {
  try {
    const res = await clearLog(clearForm.jobGroup, clearForm.jobId, clearForm.type)
    if (res.code === 200) {
      ElMessage.success('清理成功')
      clearDialogVisible.value = false
      loadData()
    }
  } catch (error) {
    ElMessage.error(error.message || '清理失败')
  }
}

const handleSizeChange = () => {
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

watch(() => queryForm.jobGroup, () => {
  queryForm.jobId = -1
  loadJobs()
})

onMounted(async () => {
  const hasGroup = await loadJobGroups()
  if (hasGroup) {
    const hasJob = await loadJobs()
    if (hasJob) {
      await loadData()
    }
  }
})
</script>

<style scoped lang="scss">
.job-log {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-header-right {
      display: flex;
      column-gap: 10px;
    }
  }

  .query-form {
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    column-gap: 12px;
    row-gap: 12px;
    align-items: flex-end;
  }
}
</style>

