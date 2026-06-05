**项目概述**

- **前端位置**：[vue-porject/vue-website](vue-porject/vue-website)

**快速运行（本地开发）**
- 安装依赖：
```
cd vue-porject/vue-website
npm install
```
- 启动开发服务器：
```
npm run dev
```

**主要依赖**
- `vue` (Vue 3)、`vue-router`、`axios`、`vite`、`@vitejs/plugin-vue`

**重要文件映射**
- 配置与入口
  - [vue-porject/vue-website/package.json](vue-porject/vue-website/package.json#L1-L40)
  - [vue-porject/vue-website/vite.config.js](vue-porject/vue-website/vite.config.js#L1-L20)
  - [vue-porject/vue-website/index.html](vue-porject/vue-website/index.html)

- 源码
  - [vue-porject/vue-website/src/main.js](vue-porject/vue-website/src/main.js#L1-L40)
  - [vue-porject/vue-website/src/App.vue](vue-porject/vue-website/src/App.vue#L1-L80)
  - [vue-porject/vue-website/src/style.css](vue-porject/vue-website/src/style.css#L1-L200)
  - 路由： [vue-porject/vue-website/src/router/index.js](vue-porject/vue-website/src/router/index.js#L1-L80)
  - 组件目录： [vue-porject/vue-website/src/components](vue-porject/vue-website/src/components)
    - `Home.vue`：[vue-porject/vue-website/src/components/Home.vue](vue-porject/vue-website/src/components/Home.vue#L1-L120)
    - `GuoMan.vue`：[vue-porject/vue-website/src/components/GuoMan.vue](vue-porject/vue-website/src/components/GuoMan.vue#L1-L120)
    - `RiMan.vue`：[vue-porject/vue-website/src/components/RiMan.vue](vue-porject/vue-website/src/components/RiMan.vue#L1-L120)
    - `Search.vue`：[vue-porject/vue-website/src/components/Search.vue](vue-porject/vue-website/src/components/Search.vue#L1-L120)
    - 详情页： [vue-porject/vue-website/src/components/detailed/Detailed.vue](vue-porject/vue-website/src/components/detailed/Detailed.vue#L1-L120)

**路由摘要**
- / → `Home`
- /guoman → `GuoMan`
- /riman → `RiMan`
- /search → `Search`
- /Detailed/:id → `Detailed`（支持 query.type 来区分 `riman` 或 `guoman`）

**后端 API（前端使用情况）**
- 基地址（代码中硬编码）：`http://localhost:3000`
- 常用端点：
  - `GET /api/animes` —— 列表（日漫）
  - `GET /api/animes/:id` —— 详情（日漫）
  - `GET /api/animes/search/:kw` —— 搜索（日漫）
  - `GET /api/guoman` —— 列表（国漫）
  - `GET /api/guoman/:id` —— 详情（国漫）
  - `GET /api/guoman/search/:kw` —— 搜索（国漫）

注：多数组件（`GuoMan.vue`、`RiMan.vue`、`Search.vue`、`Detailed.vue`）直接以 `axios` 请求这些接口。

**组件职责简述**
- `Home.vue`：首页布局、轮播和模块预览（静态示例数据）。
- `GuoMan.vue`：请求 `/api/guoman` 并渲染国漫卡片列表，支持错误与加载回退。
- `RiMan.vue`：请求 `/api/animes` 并渲染日漫卡片列表。
- `Search.vue`：通过并发调用后端搜索接口合并结果，提供联想与键盘导航。
- `Detailed.vue`：根据 `:id` 与 `query.type` 请求对应详情接口并渲染完整页面（含 cast/staff/reviews）。

**代码约定与已实现的通用逻辑**
- 数据请求：统一使用 `axios`，包含超时与错误捕获。
- 图片失败：多个组件在 `img` 上使用 `@error` 处理并插入占位表现。
- 默认数据：当后端不可用时，组件会加载内置回退数据以保证页面可渲染。

**可复现的改进建议（适合自动化/AI 修改）**
1) 将硬编码 API 基址抽出为环境变量：
   - 在 `vue-porject/vue-website` 下创建 `.env` 或 `.env.local`，加入：
```
VITE_API_BASE=http://localhost:3000
```
   - 把所有 `axios.get('http://localhost:3000/...')` 修改为 `axios.get(`${import.meta.env.VITE_API_BASE}/api/...`)`。

示例替换（Search.vue 中的一处）：
```js
const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
axios.get(`${baseURL}/api/animes/search/${encodeURIComponent(kw)}`)
```

2) 将重复的请求逻辑提取到 `src/api/index.js`（或 `src/utils/api.js`）：集中 `axios` 实例、拦截器与基址管理。

3) 路由与组件：新增页面时
  - 在 `src/components` 新建组件 `.vue`，
  - 在 `src/router/index.js` 导入并添加到 `routes` 数组。

4) 样式：全局样式放在 `src/style.css`，组件内部使用 `scoped` 样式，建议遵循现有命名和响应式断点。

**快速变更示例（AI 可直接替换）**
- 把硬编码 base 替换为 env：替换所有 `http://localhost:3000` 为 `import.meta.env.VITE_API_BASE || 'http://localhost:3000'`。
- 新增 API 模块：创建 `src/api/index.js`：
```js
import axios from 'axios'
const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
const api = axios.create({ baseURL: base, timeout: 10000 })
export default api
```
然后把组件中的 `axios.get(...)` 改为 `api.get(...)`。

**注意事项与兼容提醒**
- `package.json` 中声明了 `vue-router` 版本为 `^5.0.4`（注意：Vue 3 常用 router 为 v4；检查安装版本以免 API 不匹配）。
- 详情页 `Detailed.vue` 中使用了 `<link>` 方式引入 Font Awesome CDN，在构建环境中建议把图标依赖改为 npm 包并在入口处统一加载。

**建议的下一步（可由 AI 自动执行）**
- 自动替换硬编码 API 地址为 env 变量。
- 提取 `axios` 实例并在所有组件中替换为新实例。
- 运行 `npm install` 并 `npm run dev` 验证页面启动与后端联通性。

---
文件生成者：GitHub Copilot（自动化说明）
