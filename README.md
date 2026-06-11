# 🎬 AnimePortal — 动漫门户网站

> 基于 Vue 3 + Express + MySQL 的全栈动漫信息展示平台，支持日漫与国漫浏览、搜索、详情查看。

---

## 📌 项目状态

![Vue](https://img.shields.io/badge/Vue-3.5-4fc08d)
![Vite](https://img.shields.io/badge/Vite-8.0-646cff)
![Express](https://img.shields.io/badge/Express-5.2-000000)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1)
![Node](https://img.shields.io/badge/Node-24-339933)

> 已完成前后端联调、数据库迁移、Git SSH 配置，当前版本稳定运行。

---

## ✨ 功能特性

| 模块 | 说明 |
|------|------|
| **灵动岛导航** | 玻璃拟态（Glassmorphism）导航栏，椭圆形激活指示器平滑滑动，支持搜索展开与拖拽详情 |
| **日漫/国漫浏览** | 卡片网格展示，分页加载，封面图片实时渲染 |
| **实时搜索** | 300ms 防抖，并发搜索日漫+国漫，关键词高亮，键盘上下键选择联想 |
| **动漫详情** | 封面、评分（五星渲染）、标签、简介、角色配音、STAFF、剧集列表、精选短评 |
| **拖拽展开** | 国漫/日漫首页底部小白条可拖拽，展开列表浮窗，点击卡片查看详情 |
| **页面切换动画** | 前进/后退不同方向滑动过渡，滚轮环形循环切换三页 |
| **随机背景** | 24 张高清背景图池，每次进入页面随机抽取且不连续重复 |
| **兜底设计** | API 不可用时自动使用本地默认数据，保证页面始终可渲染 |

---

## 🧱 技术栈

### 前端 (`vue-porject/vue-website`)

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5 | 组件化框架（Composition API） |
| Vue Router | 5.0 | 路由管理与过渡动画 |
| Axios | 1.15 | HTTP 请求 |
| Vite | 8.0 | 构建工具 |
| CSS | Scoped | 组件级样式隔离 |

### 后端 (`vue-porject/anime-backend`)

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | 5.2 | HTTP 服务框架 |
| mysql2 | 3.22 | MySQL 连接池 |
| cors | 2.8 | 跨域支持 |

### 数据库

| 技术 | 版本 | 说明 |
|------|------|------|
| MySQL | 8.0.45 | InnoDB 引擎 |
| 数据库名 | anime_db | 2 张表，共 120 条数据 |

---

## 📂 项目结构

```
porject/
├── vue-porject/                    # 主工程
│   ├── anime-backend/              # 后端服务
│   │   ├── server.js               # Express 主程序（API + 图片服务）
│   │   ├── import-db.js            # 数据库导入脚本
│   │   ├── package.json
│   │   └── public/
│   │       ├── RIMAN/              # 日漫封面图（70张）
│   │       ├── GUOMAN/             # 国漫封面图（50张）
│   │       └── BACK/               # 首页轮播图
│   ├── vue-website/                # 前端应用
│   │   ├── src/
│   │   │   ├── components/         # 组件
│   │   │   │   ├── NavBar.vue      # 灵动岛导航栏
│   │   │   │   ├── Home.vue        # 首页
│   │   │   │   ├── SearchModule.vue # 搜索模块
│   │   │   │   ├── DragDetailModule.vue # 拖拽详情模块
│   │   │   │   ├── AnimeListContent.vue # 动漫列表
│   │   │   │   ├── AnimeDetailContent.vue # 动漫详情
│   │   │   │   ├── RiManList.vue   # 日漫列表
│   │   │   │   ├── GuoManList.vue  # 国漫列表
│   │   │   │   └── detailed/Detailed.vue # 详情页（旧版）
│   │   │   ├── views/
│   │   │   │   ├── GuoManHome.vue  # 国漫首页「山河漫语」
│   │   │   │   └── RiManHome.vue   # 日漫首页「樱色异闻」
│   │   │   ├── composables/        # 组合式函数
│   │   │   │   ├── usePageWheel.js # 滚轮页面切换
│   │   │   │   ├── usePageTransition.js # 页面过渡动画
│   │   │   │   ├── useDragExpand.js # 拖拽展开逻辑
│   │   │   │   └── useRandomBg.js  # 随机背景图
│   │   │   ├── router/index.js     # 路由配置
│   │   │   ├── App.vue             # 根组件
│   │   │   ├── main.js             # 入口
│   │   │   └── style.css           # 全局样式
│   │   ├── public/back/            # 背景图片（24张）
│   │   ├── vite.config.js
│   │   └── package.json
│   ├── anime_db1.sql               # 数据库 SQL 导出文件
│   └── FRONTEND_DOC.md             # 前端开发文档
├── mysql_data/                     # MySQL 数据目录（Git 忽略）
├── dongman/                        # SQLite 缓存（Git 忽略）
├── 操作文档.docx                   # 运维操作手册
├── PPT提示词.md                    # PPT 生成提示词
└── README.md                       # 本文件
```

---

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone git@github.com:Jackychan-200811/vue-anime-website.git
cd vue-anime-website
```

> ⚠️ 需使用 SSH 协议（HTTPS 被阻断），详见 [Git 配置说明](#git-配置)。

### 2. 启动 MySQL

确保 MySQL 8.0 已安装，数据目录指向 `mysql_data/`：

```bash
# 方式一：Windows 服务
net start MySQL80

# 方式二：命令行指定数据目录
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --datadir="C:\Users\123\Desktop\porject\mysql_data"
```

首次使用需导入数据：

```bash
cd vue-porject/anime-backend
node import-db.js
```

### 3. 启动后端

```bash
cd vue-porject/anime-backend
npm install    # 首次
npm start      # 启动在 http://localhost:3000
```

### 4. 启动前端

```bash
cd vue-porject/vue-website
npm install    # 首次
npm run dev    # 启动 Vite 开发服务器
```

---

## 📡 API 接口

基地址：`http://localhost:3000`

### 日漫 (`animes` 表，70条)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/animes` | 列表（支持 `?page=&limit=` 分页） |
| GET | `/api/animes/:id` | 详情 |
| GET | `/api/animes/search/:keyword` | 搜索 |
| GET | `/api/animes/tag/:tag` | 按标签筛选 |
| GET | `/api/animes/popular` | 热门排行（`?limit=N`） |
| POST | `/api/animes` | 创建 |
| PUT | `/api/animes/:id` | 更新 |
| DELETE | `/api/animes/:id` | 删除 |

### 国漫 (`animes_guoman` 表，50条)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/guoman` | 列表 |
| GET | `/api/guoman/:id` | 详情 |
| GET | `/api/guoman/search/:keyword` | 搜索 |
| POST | `/api/guoman` | 创建 |
| PUT | `/api/guoman/:id` | 更新 |
| DELETE | `/api/guoman/:id` | 删除 |

### 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/check-images` | 检查图片文件状态 |
| GET | `/api/debug/routes` | 查看所有路由 |
| GET | `/images/riman/:filename` | 日漫封面图 |
| GET | `/images/guoman/:filename` | 国漫封面图 |

---

## 🗄️ 数据库

### 连接信息

| 参数 | 值 |
|------|-----|
| 主机 | localhost |
| 端口 | 3306 |
| 用户 | root |
| 密码 | 123456 |
| 数据库 | anime_db |
| 数据目录 | `C:\Users\123\Desktop\porject\mysql_data` |

### 验证数据库

```bash
cd vue-porject/anime-backend
node -e "const m=require('mysql2/promise');(async()=>{const c=await m.createConnection({host:'localhost',user:'root',password:'123456',port:3306});const[r]=await c.query('SELECT @@datadir AS d');console.log('数据目录:',r[0].d);await c.end()})()"
```

---

## 🎨 亮点设计

### 灵动岛导航 (NavBar)
- 玻璃拟态半透明背景 + `backdrop-filter` 模糊
- 椭圆形激活指示器：根据文字宽度动态计算，`0.28s` 弹性滑动
- 悬停效果：文字变青蓝 `#00b4d8`，指示器放大 `1.14x` 并浮起（弹性曲线 `cubic-bezier(0.34, 1.56, 0.64, 1)`）
- 搜索框点击展开，实时联想下拉

### 页面切换
- 滚轮上下滚动在「首页 → 国漫 → 日漫」三页间环形循环
- 前进：新页从右滑入；后退：旧页向右滑出
- 过渡动画 600ms，`cubic-bezier(0.25, 0.46, 0.45, 0.94)`

### 五星评分渲染
- 10 分制转 5 星制，支持半星
- 动态生成 Font Awesome 星星 HTML

---

## 🔧 Git 配置

本项目使用 SSH 协议连接 GitHub（因 HTTPS 443 端口被网络阻断）。

```
Host github.com
    HostName ssh.github.com
    Port 443
    User git
    IdentityFile ~/.ssh/id_ed25519_github
```

常用命令：

```bash
git pull --tags origin main    # 拉取最新
git push origin main           # 推送
git status                     # 查看状态
```

---

## 👥 贡献者

| GitHub | 角色 |
|--------|------|
| [Jackychan-200811](https://github.com/Jackychan-200811) | 全栈开发 & 项目规划 |
| [rin-7777777](https://github.com/rin-7777777) | 前端开发 & 数据清洗 |
| [quzhiye90-prog](https://github.com/quzhiye90-prog) | 前端技术支持 |

---

## 📄 开源协议

本项目暂未明确开源协议。如需使用或二次开发，请联系仓库所有者。

---

## 🔗 相关链接

- GitHub 仓库：https://github.com/Jackychan-200811/vue-anime-website
- 操作文档：`./操作文档.docx`
- PPT 提示词：`./PPT提示词.md`
