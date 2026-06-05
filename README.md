# 🎬 Vue 动漫网站 (vue-anime-website)

> 一款基于 Vue.js 的动漫信息展示平台，聚焦国日漫资源，适配移动端全面屏（灵动岛 + 小白条），已对接后端数据服务。

## 📌 项目状态

![GitHub last commit](https://img.shields.io/badge/last%20commit-2026--06--06-brightgreen)
![Vue](https://img.shields.io/badge/Vue-2.x%20%7C%203.x-4fc08d)
![HTML](https://img.shields.io/badge/HTML-61.9%-orange)
![Vue](https://img.shields.io/badge/Vue-26.0%-green)
![JavaScript](https://img.shields.io/badge/JavaScript-9.1%-yellow)

> 当前版本处于积极开发中，已完成前后端联调、高清图源替换及移动端 UI 适配。
 
## ✨ 功能特性

| 模块         | 功能说明                                                                       |
| ------------ | -------------------------------------------------------------------------------|
| 动漫浏览     | 首页卡片/列表展示，支持分类筛选（国漫、日漫等）                                  |
| 国漫专题     | `国漫25` 目录下专门展示国产动漫内容（数据库内容为方便缩进与理解文件名后缀都为html |
| 高清图库     | 已启用高清背景图与封面，提升视觉体验（`背景图预处理` 提交）                      |
| 移动端优化   | 针对 iOS 灵动岛和底部小白条调整间距，避免遮挡内容                                |
| 后端数据对接 | 通过 `后端连接目录适配` 完成 API 连接，支持动态数据拉取                          |
| 多版本迭代   | 保留历史版本 (`旧`, `试`) 便于让使用者感受某些成员写的史                         |

## 🧱 技术栈

- **前端框架**：Vue (2.x / 3.x) – 实际版本请查看 `package.json`
- **路由管理**：Vue Router (推测)
- **状态管理**：Vuex 或 Pinia (如需要)
- **HTTP 请求**：Axios (推测，用于对接后端)
- **样式处理**：原生 CSS + 预处理器 (Less/Sass 视项目情况)
- **构建工具**：Vue CLI 或 Vite (根据 `vue-porject` 目录判断)
- **版本控制**：Git

## 📂 项目目录结构
vue-anime-website/
├── dongman/ # 动漫核心业务模块（组件、视图、路由）
├── vue-porject/ # Vue 工程源码（入口、App、公共组件）
├── 国漫25/ # 国漫专题数据、页面或静态资源（数据库内容）
├── 数据/ # 本地 mock 数据或 JSON 配置
├── 背景图预处理/ # 图片处理脚本 / 高清图替换工具
├── 旧/ # 旧版本史山代码完整备份
├── 试/ # 实验性功能或原型
├── 参考资料/ # 设计稿、文档、第三方笔记
├── 操作文档.docx # 详细的部署/运维手册（重要）
├── 模板注释.html # 带注释的 HTML 模板示例
├── .gitignore # Git 忽略规则
├── package.json # 依赖与脚本（请核对）
└── README.md # 项目说明（本文件）

text

> 💡 提示：若 `vue-porject` 为实际前端根目录，请将上述路径中的根目录调整为 `vue-porject/`。

## 🚀 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/Jackychan-200811/vue-anime-website.git
cd vue-anime-website
2. 安装依赖
如果项目根目录有 package.json，直接执行：

bash
npm install
# 或 yarn install
若 package.json 位于 vue-porject 目录下，请先进入该目录。

3. 配置后端接口
根据 .gitignore 和提交记录，可能存在环境变量文件（如 .env）。

具体接口地址请参考 后端连接目录适配 相关代码或 操作文档.docx。

4. 启动开发服务器
bash
npm run serve
默认访问：http://localhost:8080

5. 生产构建
bash
npm run build
构建产物默认在 dist 目录。

📡 后端对接说明
项目已完成与后端的连接适配，支持动态拉取动漫列表、详情、图源等数据。

若需更换 API 地址，请修改 axios 的基础 URL 配置（通常在 src/utils/request.js 或类似位置）。

本地模拟数据可放在 数据/ 目录下，用于离线开发。

🧪 测试与调试
移动端调试：推荐使用 Chrome DevTools 的设备模拟模式，或真机调试（注意灵动岛和小白条效果）。

图源测试：切换不同清晰度图片，检查加载性能。

后端联调：确保后端服务已启动，并正确配置 CORS。

📝 最近更新记录 (基于 Git Log)
日期	更新内容
2026-06-06	修改小白条与灵动岛的间距
2026-06-06	更换高清图源（背景图预处理）
2026-06-05	补全项目文件并更新后端文件
2026-06-05	改进了后端连接目录适配
👥 贡献者
Jackychan-200811 (六花花の邪王真眼) - 项目创建者（全栈开发与企划策划）

rin-7777777 (澪) - 前端适配与 UI 调整 （数据清洗 前端开发与适配）

quzhiye90-prog (大西?小西!) - 后端连接与数据支持（xxjyu小组的技术支持）


🤝 贡献指南
欢迎提交 Issue 或 Pull Request。请遵循以下规范：

新功能或修复请基于最新 main 分支创建新分支。

提交信息请使用 <type>(<scope>): <subject> 格式（如 fix(mobile): adjust island margin）。

确保代码符合 ESLint 配置（如有）。

若涉及后端接口变更，请同步更新 操作文档.docx。

⚠️ 注意事项
本仓库暂未提供在线演示地址，请本地运行测试。

操作文档.docx 包含详细部署步骤和常见问题，务必查阅。

移动端适配中，灵动岛和小白条的间距值预设为 constant(safe-area-inset-top) 和 env(safe-area-inset-bottom)，若需微调请修改全局 CSS 变量。

高清图源可能存在版权问题，仅用于个人学习或演示，请勿商用。

📄 开源协议
本项目暂未明确开源协议。如需使用或二次开发，请联系仓库所有者获取授权。

🔗 相关链接
GitHub 仓库：https://github.com/Jackychan-200811/vue-anime-website

操作文档：./操作文档.docx

问题反馈：请在仓库 Issues 区提交
