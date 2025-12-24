<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 简单暗色主题示例 */
body.dark-theme {
  background-color: #1f2d3d;
  color: #e5eaf3;
}
body.dark-theme .el-header,
body.dark-theme .el-main,
body.dark-theme .el-footer,
body.dark-theme .el-card {
  background-color: #273849 !important;
  color: #e5eaf3 !important;
}
body.dark-theme .el-menu {
  background-color: #1f2d3d !important;
}
</style>

