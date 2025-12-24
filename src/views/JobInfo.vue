<template>
  <div class="job-info">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务管理</span>
          <div>
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="warning" @click="handleEdit" :disabled="!selectedRow">编辑</el-button>
            <el-button type="danger" @click="handleDelete" :disabled="!selectedRow">删除</el-button>
            <el-button type="success" @click="handleStart" :disabled="!selectedRow">启动</el-button>
            <el-button type="warning" @click="handleStop" :disabled="!selectedRow">停止</el-button>
            <el-button type="primary" @click="handleTrigger" :disabled="!selectedRow">执行一次</el-button>
            <el-button type="info" @click="handleGlueIde" :disabled="!selectedRow || selectedRow.glueType === 'BEAN'">GLUE IDE</el-button>
            <el-button type="default" @click="handleCopy" :disabled="!selectedRow">复制</el-button>
            <el-button type="default" @click="handleRegistryInfo" :disabled="!selectedRow">注册节点</el-button>
            <el-button type="default" @click="handleNextTime" :disabled="!selectedRow">下次执行时间</el-button>
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
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.triggerStatus"
            placeholder="请选择"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" :value="-1" />
            <el-option label="停止" :value="0" />
            <el-option label="运行中" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="queryForm.jobDesc" placeholder="请输入" style="width: 200px" />
        </el-form-item>
        <el-form-item label="JobHandler" v-show="showMore">
          <el-input v-model="queryForm.executorHandler" placeholder="请输入" style="width: 200px" />
        </el-form-item>
        <el-form-item label="负责人" v-show="showMore">
          <el-input v-model="queryForm.author" placeholder="请输入" style="width: 200px" />
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
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        highlight-current-row
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="jobDesc" label="任务描述" min-width="200" />
        <el-table-column prop="executorHandler" label="JobHandler" min-width="180" />
        <el-table-column prop="scheduleType" label="调度类型" width="110" />
        <el-table-column prop="scheduleConf" label="调度配置" min-width="200" />
        <el-table-column prop="triggerStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.triggerStatus === 1 ? 'success' : 'info'">
              {{ row.triggerStatus === 1 ? '运行中' : '停止' }}
            </el-tag>
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

    <!-- 新增/编辑对话框 -->
    <JobFormDialog
      v-model="dialogVisible"
      :form-data="formData"
      :job-group-list="jobGroupList"
      @success="handleDialogSuccess"
    />

    <!-- 注册节点对话框 -->
    <el-dialog v-model="registryDialogVisible" title="注册节点" width="500px">
      <el-table :data="registryList" size="small">
        <el-table-column type="index" width="60" label="#" />
        <el-table-column prop="address" label="地址" />
      </el-table>
      <template #footer>
        <el-button @click="registryDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 下次执行时间对话框 -->
    <el-dialog v-model="nextTimeDialogVisible" title="下次执行时间" width="520px">
      <el-table :data="nextTimes" size="small">
        <el-table-column type="index" width="60" label="#" />
        <el-table-column prop="time" label="时间" />
      </el-table>
      <template #footer>
        <el-button @click="nextTimeDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getJobList, deleteJob, startJob, stopJob, triggerJob, getNextTriggerTime } from '@/api/job'
import { getAllJobGroups, getJobGroupById } from '@/api/jobgroup'
import JobFormDialog from './components/JobFormDialog.vue'

const loading = ref(false)
const dialogVisible = ref(false)
const selectedRow = ref(null)
const selectedRows = ref([])
const showMore = ref(false)
const jobGroupList = ref([])
const registryDialogVisible = ref(false)
const nextTimeDialogVisible = ref(false)
const registryList = ref([])
const nextTimes = ref([])

const queryForm = reactive({
  jobGroup: '',
  triggerStatus: '',
  jobDesc: '',
  executorHandler: '',
  author: ''
})

const pagination = reactive({
  page: 1,
  pagesize: 10,
  total: 0
})

const tableData = ref([])
const formData = ref({})

const loadJobGroups = async () => {
  try {
    const res = await getAllJobGroups()
    if (res.code === 200) {
      jobGroupList.value = res.content?.data || []
    }
  } catch (error) {
    console.error('Load job groups error:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getJobList({
      ...queryForm,
      jobGroup: queryForm.jobGroup || -1,
      triggerStatus: queryForm.triggerStatus || -1,
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
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  Object.assign(queryForm, {
    jobGroup: -1,
    triggerStatus: -1,
    jobDesc: '',
    executorHandler: '',
    author: ''
  })
  handleQuery()
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  selectedRow.value = selection.length === 1 ? selection[0] : null
}

const handleRowClick = (row) => {
  selectedRow.value = row
}

const handleAdd = () => {
  formData.value = {}
  dialogVisible.value = true
}

const handleEdit = () => {
  if (!selectedRow.value) return
  formData.value = { ...selectedRow.value }
  dialogVisible.value = true
}

const handleDelete = async () => {
  if (!selectedRow.value) return
  
  try {
    await ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
      type: 'warning'
    })
    
    const res = await deleteJob([selectedRow.value.id])
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleStart = async () => {
  if (!selectedRow.value) return
  
  try {
    const res = await startJob(selectedRow.value.id)
    if (res.code === 200) {
      ElMessage.success('启动成功')
      loadData()
    }
  } catch (error) {
    ElMessage.error(error.message || '启动失败')
  }
}

const handleStop = async () => {
  if (!selectedRow.value) return
  
  try {
    const res = await stopJob(selectedRow.value.id)
    if (res.code === 200) {
      ElMessage.success('停止成功')
      loadData()
    }
  } catch (error) {
    ElMessage.error(error.message || '停止失败')
  }
}

const handleTrigger = async () => {
  if (!selectedRow.value) return
  
  try {
    const res = await triggerJob(selectedRow.value.id, '')
    if (res.code === 200) {
      ElMessage.success('执行成功')
    }
  } catch (error) {
    ElMessage.error(error.message || '执行失败')
  }
}

const handleGlueIde = () => {
  if (!selectedRow.value) return
  if (selectedRow.value.glueType === 'BEAN') {
    ElMessage.warning('BEAN 任务无 GLUE IDE')
    return
  }
  const base = import.meta.env.VITE_API_BASE_URL || '/xxl-job-admin'
  window.open(`${base}/jobcode?jobId=${selectedRow.value.id}`, '_blank')
}

const handleCopy = () => {
  if (!selectedRow.value) return
  formData.value = { ...selectedRow.value, id: null, jobDesc: `${selectedRow.value.jobDesc}-copy` }
  dialogVisible.value = true
}

const handleRegistryInfo = async () => {
  if (!selectedRow.value) return
  try {
    const groupId = selectedRow.value.jobGroup
    const res = await getJobGroupById(groupId)
    const data = res?.content
    const addresses = []
    if (data?.registryList && Array.isArray(data.registryList)) {
      data.registryList.forEach(a => addresses.push({ address: a }))
    } else if (data?.addressList) {
      data.addressList.split(',').map(s => s.trim()).filter(Boolean).forEach(a => addresses.push({ address: a }))
    }
    registryList.value = addresses
    registryDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载注册节点失败')
  }
}

const handleNextTime = async () => {
  if (!selectedRow.value) return
  try {
    const res = await getNextTriggerTime(selectedRow.value.scheduleType, selectedRow.value.scheduleConf)
    const list = res?.content || []
    nextTimes.value = list.map(t => ({ time: t }))
    nextTimeDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取下次执行时间失败')
  }
}

const handleSizeChange = () => {
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

const handleDialogSuccess = () => {
  loadData()
}

onMounted(() => {
  loadJobGroups()
  loadData()
})
</script>

<style scoped lang="scss">
.job-info {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

