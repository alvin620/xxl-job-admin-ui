# Node.js 版本升级指南

## 问题说明

当前 Node.js 版本过低（v14.18.0），Vite 5.x 需要 Node.js 16+ 版本。

## 解决方案

### 方案一：使用 nvm 升级 Node.js（推荐）

如果您安装了 nvm（Node Version Manager）：

```bash
# 安装 Node.js 18 LTS 版本
nvm install 18

# 切换到 Node.js 18
nvm use 18

# 验证版本
node --version

# 重新安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 方案二：使用 nvm 并设置项目默认版本

项目已包含 `.nvmrc` 文件，如果您使用 nvm：

```bash
# 在项目目录下，nvm 会自动读取 .nvmrc 文件
nvm use

# 如果没有安装 Node.js 18，会自动安装
nvm install
```

### 方案三：从官网下载安装

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载并安装 Node.js 18.x LTS 版本
3. 验证安装：
   ```bash
   node --version
   ```
4. 重新安装依赖并启动：
   ```bash
   npm install
   npm run dev
   ```

### 方案四：如果必须使用 Node.js 14（不推荐）

如果暂时无法升级 Node.js，可以降级 Vite 版本：

```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 修改 package.json 中的 vite 版本
# 将 "vite": "^5.1.4" 改为 "vite": "^4.5.0"
# 将 "@vitejs/plugin-vue": "^5.0.4" 改为 "@vitejs/plugin-vue": "^4.5.0"

# 重新安装
npm install
npm run dev
```

**注意**：降级 Vite 可能会导致某些功能不可用，建议尽快升级 Node.js。

## 验证

升级完成后，运行以下命令验证：

```bash
node --version  # 应该显示 v18.x.x 或更高
npm --version   # 应该显示 8.x.x 或更高
npm run dev     # 应该能正常启动开发服务器
```

