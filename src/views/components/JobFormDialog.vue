<template>
  <el-dialog
    v-model="dialogVisible"
    :title="formData.id ? '编辑任务' : '新增任务'"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="执行器" prop="jobGroup">
        <el-select v-model="form.jobGroup" placeholder="请选择" style="width: 100%">
          <el-option
            v-for="group in jobGroupList"
            :key="group.id"
            :label="group.title"
            :value="group.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="任务描述" prop="jobDesc">
        <el-input v-model="form.jobDesc" placeholder="请输入任务描述" />
      </el-form-item>
      <el-form-item label="调度类型" prop="scheduleType">
        <el-select v-model="form.scheduleType" placeholder="请选择" style="width: 100%" @change="handleScheduleTypeChange">
          <el-option label="CRON" value="CRON" />
          <el-option label="固定频率" value="FIX_RATE" />
          <el-option label="固定延迟" value="FIX_DELAY" />
          <el-option label="无" value="NONE" />
        </el-select>
      </el-form-item>
      <el-form-item label="调度配置" prop="scheduleConf" v-if="form.scheduleType === 'CRON'">
        <el-input v-model="form.scheduleConf" placeholder="请输入 Cron 表达式" />
      </el-form-item>
      <el-form-item label="调度配置(秒)" prop="scheduleConf" v-else-if="form.scheduleType === 'FIX_RATE' || form.scheduleType === 'FIX_DELAY'">
        <el-input v-model="form.scheduleConf" placeholder="请输入间隔秒数" oninput="this.value=this.value.replace(/[^\\d]/g,'')" />
      </el-form-item>
      <el-form-item label="路由策略" prop="executorRouteStrategy">
        <el-select v-model="form.executorRouteStrategy" placeholder="请选择" style="width: 100%">
          <el-option label="第一个" value="FIRST" />
          <el-option label="最后一个" value="LAST" />
          <el-option label="轮询" value="ROUND" />
          <el-option label="随机" value="RANDOM" />
          <el-option label="一致性HASH" value="CONSISTENT_HASH" />
          <el-option label="最不经常使用" value="LEAST_FREQUENTLY_USED" />
          <el-option label="最近最久未使用" value="LEAST_RECENTLY_USED" />
          <el-option label="故障转移" value="FAILOVER" />
          <el-option label="忙碌转移" value="BUSYOVER" />
          <el-option label="分片广播" value="SHARDING_BROADCAST" />
        </el-select>
      </el-form-item>
      <el-form-item label="运行模式" prop="glueType">
        <el-select v-model="form.glueType" placeholder="请选择" style="width: 100%">
          <el-option label="BEAN" value="BEAN" />
          <el-option label="GLUE(Java)" value="GLUE_java" />
          <el-option label="GLUE(Shell)" value="GLUE_shell" />
          <el-option label="GLUE(Python)" value="GLUE_python" />
          <el-option label="GLUE(PHP)" value="GLUE_php" />
          <el-option label="GLUE(NodeJS)" value="GLUE_nodejs" />
          <el-option label="GLUE(PowerShell)" value="GLUE_powershell" />
        </el-select>
      </el-form-item>
      <el-form-item label="JobHandler" prop="executorHandler" v-if="form.glueType === 'BEAN'">
        <el-input v-model="form.executorHandler" placeholder="请输入JobHandler" />
      </el-form-item>
      <el-form-item label="任务参数" prop="executorParam">
        <el-input v-model="form.executorParam" type="textarea" :rows="3" placeholder="请输入任务参数" />
      </el-form-item>
      <el-form-item label="阻塞处理策略" prop="executorBlockStrategy">
        <el-select v-model="form.executorBlockStrategy" placeholder="请选择" style="width: 100%">
          <el-option label="单机串行" value="SERIAL_EXECUTION" />
          <el-option label="丢弃后续调度" value="DISCARD_LATER" />
          <el-option label="覆盖之前调度" value="COVER_EARLY" />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人" prop="author">
        <el-input v-model="form.author" placeholder="请输入负责人" />
      </el-form-item>
      <el-form-item label="报警邮件">
        <el-input v-model="form.alarmEmail" placeholder="请输入报警邮件，多个用逗号分隔" />
      </el-form-item>
      <el-form-item label="超时时间(秒)" prop="executorTimeout">
        <el-input v-model="form.executorTimeout" placeholder="默认0不限时" oninput="this.value=this.value.replace(/[^\\d]/g,'')" />
      </el-form-item>
      <el-form-item label="失败重试次数" prop="executorFailRetryCount">
        <el-input v-model="form.executorFailRetryCount" placeholder="默认0" oninput="this.value=this.value.replace(/[^\\d]/g,'')" />
      </el-form-item>
      <el-form-item label="子任务ID" prop="childJobId">
        <el-input v-model="form.childJobId" placeholder="多个用逗号分隔" />
      </el-form-item>
      <el-form-item label="调度过期策略" prop="misfireStrategy">
        <el-select v-model="form.misfireStrategy" placeholder="请选择" style="width: 100%">
          <el-option label="忽略" value="DO_NOTHING" />
          <el-option label="立即执行一次" value="FIRE_ONCE_NOW" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addJob, updateJob } from '@/api/job'

const props = defineProps({
  modelValue: Boolean,
  formData: {
    type: Object,
    default: () => ({})
  },
  jobGroupList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const dialogVisible = ref(false)
const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  id: null,
  jobGroup: null,
  jobDesc: '',
  executorRouteStrategy: 'FIRST',
  scheduleType: 'CRON',
  scheduleConf: '',
  glueType: 'BEAN',
  executorHandler: '',
  executorParam: '',
  executorBlockStrategy: 'SERIAL_EXECUTION',
  author: '',
  alarmEmail: '',
  executorTimeout: 0,
  executorFailRetryCount: 0,
  childJobId: '',
  misfireStrategy: 'DO_NOTHING'
})

const rules = {
  jobGroup: [{ required: true, message: '请选择执行器', trigger: 'change' }],
  jobDesc: [{ required: true, message: '请输入任务描述', trigger: 'blur' }],
  executorRouteStrategy: [{ required: true, message: '请选择路由策略', trigger: 'change' }],
  scheduleType: [{ required: true, message: '请选择调度类型', trigger: 'change' }],
  scheduleConf: [{ required: true, message: '请输入调度配置', trigger: 'blur' }],
  glueType: [{ required: true, message: '请选择运行模式', trigger: 'change' }],
  executorHandler: [{ required: true, message: '请输入JobHandler', trigger: 'blur' }],
  executorBlockStrategy: [{ required: true, message: '请选择阻塞处理策略', trigger: 'change' }],
  author: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && props.formData.id) {
    Object.assign(form, props.formData)
  } else if (val) {
    resetForm()
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const resetForm = () => {
  Object.assign(form, {
    id: null,
    jobGroup: null,
    jobDesc: '',
    executorRouteStrategy: 'FIRST',
    scheduleType: 'CRON',
    scheduleConf: '',
    glueType: 'BEAN',
    executorHandler: '',
    executorParam: '',
    executorBlockStrategy: 'SERIAL_EXECUTION',
    author: '',
    alarmEmail: '',
    executorTimeout: 0,
    executorFailRetryCount: 0,
    childJobId: '',
    misfireStrategy: 'DO_NOTHING'
  })
  formRef.value?.resetFields()
}

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const payload = { ...form }
        let res
        if (payload.id) {
          res = await updateJob(payload)
        } else {
          res = await addJob(payload)
        }
        
        if (res.code === 200) {
          ElMessage.success(form.id ? '更新成功' : '添加成功')
          emit('success')
          handleClose()
        }
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleScheduleTypeChange = (val) => {
  if (val === 'NONE') {
    form.scheduleConf = ''
  }
}
</script>

