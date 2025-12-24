<template>
  <div class="help">
    <el-card class="help-card">
      <h2 class="title">XXL-JOB 调度中心</h2>
      <p class="subtitle">分布式任务调度平台</p>

      <el-divider />

      <div class="section">
        <h3>项目地址</h3>
        <p>
          <el-link href="https://github.com/xuxueli/xxl-job" target="_blank" type="primary">
            Github：xuxueli/xxl-job
          </el-link>
        </p>
      </div>

      <div class="section">
        <h3>官方文档</h3>
        <p>
          <el-link href="https://www.xuxueli.com/xxl-job/" target="_blank" type="primary">
            XXL-JOB 官方文档（中文）
          </el-link>
        </p>
      </div>

      <div class="section">
        <h3>使用说明</h3>
        <ul class="usage-list">
          <li>左侧菜单可进入任务管理、执行日志、执行器管理、用户管理等功能模块。</li>
          <li>任务管理中可以进行任务新增、编辑、删除、启停、手动触发等操作。</li>
          <li>执行日志中可以查看任务执行明细，支持日志详情查看和终止运行中的任务。</li>
          <li>执行器管理用于维护调度中心下的执行器应用及其机器节点。</li>
          <li>用户管理用于维护调度中心的登录账号及权限。</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.help {
  display: flex;
  justify-content: center;
}

.help-card {
  max-width: 900px;
  width: 100%;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
}

.subtitle {
  color: #909399;
  margin-bottom: 10px;
}

.section {
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    margin-bottom: 8px;
  }
}

.usage-list {
  padding-left: 18px;
  li {
    margin-bottom: 4px;
  }
}
</style>


