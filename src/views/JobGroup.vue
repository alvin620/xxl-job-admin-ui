<template>
  <div class="job-group">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>执行器管理</span>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </template>

      <!-- 查询表单 -->
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="AppName">
          <el-input v-model="queryForm.appname" placeholder="请输入" style="width: 200px" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="queryForm.title" placeholder="请输入" style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tableData">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="appname" label="AppName" min-width="200" />
        <el-table-column prop="title" label="名称" min-width="150" />
        <el-table-column prop="addressType" label="注册方式" width="120">
          <template #default="{ row }">
            <el-tag :type="row.addressType === 0 ? 'success' : 'info'">
              {{ row.addressType === 0 ? '自动注册' : '手动录入' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="addressList" label="机器地址" min-width="300" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id ? '编辑执行器' : '新增执行器'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="AppName" prop="appname">
          <el-input v-model="form.appname" placeholder="请输入AppName" />
        </el-form-item>
        <el-form-item label="名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="注册方式" prop="addressType">
          <el-radio-group v-model="form.addressType">
            <el-radio :label="0">自动注册</el-radio>
            <el-radio :label="1">手动录入</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="form.addressType === 1"
          label="机器地址"
          prop="addressList"
        >
          <el-input
            v-model="form.addressList"
            type="textarea"
            :rows="3"
            placeholder="请输入机器地址，多个用逗号分隔"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getJobGroupList, addJobGroup, updateJobGroup, deleteJobGroup } from '@/api/jobgroup'

const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const queryForm = reactive({
  appname: '',
  title: ''
})

const pagination = reactive({
  page: 1,
  pagesize: 10,
  total: 0
})

const tableData = ref([])
const formData = ref({})

const form = reactive({
  id: null,
  appname: '',
  title: '',
  addressType: 0,
  addressList: ''
})

const rules = {
  appname: [{ required: true, message: '请输入AppName', trigger: 'blur' }],
  title: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  addressList: [
    {
      validator: (rule, value, callback) => {
        if (form.addressType === 1 && !value) {
          callback(new Error('请输入机器地址'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getJobGroupList({
      ...queryForm,
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
    appname: '',
    title: ''
  })
  handleQuery()
}

const handleAdd = () => {
  formData.value = {}
  Object.assign(form, {
    id: null,
    appname: '',
    title: '',
    addressType: 0,
    addressList: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  formData.value = { ...row }
  // 只拷贝需要的字段，避免把 updateTime、registryList 等传回后端
  Object.assign(form, {
    id: row.id,
    appname: row.appname,
    title: row.title,
    addressType: row.addressType ?? 0,
    addressList: row.addressList || ''
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该执行器吗？', '提示', {
      type: 'warning'
    })
    
    const res = await deleteJobGroup(row.id)
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

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        let res
        if (form.id) {
          res = await updateJobGroup(form)
        } else {
          res = await addJobGroup(form)
        }
        
        if (res.code === 200) {
          ElMessage.success(form.id ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadData()
        }
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleSizeChange = () => {
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.job-group {
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

