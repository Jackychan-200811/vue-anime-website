<template>
  <div>
    <!-- 顶部导航栏（与 Detailed.vue 保持一致，只保留项目中已有的路由） -->
    <div class="navbar">
      <div class="nav-inner">
        <div class="logo">
          <i class="fas fa-tv"></i> AnimePortal
        </div>
        <div class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/guoman">国漫</router-link>
          <router-link to="/riman" class="">日漫</router-link>
        </div>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="搜索动漫、声优..." readonly />
        </div>
      </div>
    </div>

    <div class="search-main">
      <!-- 居中搜索区域 -->
      <div class="search-section">
        <div class="search-wrapper">
          <div class="search-input-container">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              id="searchInput"
              v-model="keyword"
              placeholder="搜索动漫名称..."
              autocomplete="off"
              @input="onInput"
              @keydown="handleKeydown"
              @focus="onFocus"
              ref="searchInput"
            />
            <button class="clear-btn" @click="clearSearch" aria-label="清除" v-show="keyword"></button>

          </div>
          <!-- 联想栏 -->
          <div class="suggest-box" v-show="showSuggest && suggestList.length > 0">
            <div
              v-for="(item, idx) in suggestList"
              :key="item.id + '-' + idx"
              class="suggest-item"
              :class="{ active: idx === currentSuggestIndex }"
              @click="selectSuggestion(item)"
              @mouseenter="currentSuggestIndex = idx"
            >
              <span v-html="highlightKeyword(item.title, keyword)"></span>
              <span class="suggest-type">[{{ item.type === 'riman' ? '日漫' : '国漫' }}]</span>
            </div>
          </div>
          <div class="suggest-box" v-show="showSuggest && keyword && suggestList.length === 0 && !loadingSuggest">
            <div class="suggest-empty">😢 未找到相关动漫</div>
          </div>
        </div>
      </div>

      <!-- 搜索结果展示区 -->
      <div class="results-section">
        <div class="results-title">✨ 搜索结果</div>
        <div v-if="loadingResult" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>加载中...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <button @click="performSearch" class="retry-btn">重试</button>
        </div>
        <div v-else-if="searchResults.length === 0 && keyword.trim() !== ''" class="empty-results">
          <i class="fas fa-search"></i>
          <p>没有找到相关动漫，试试其他关键词吧~</p>
        </div>
        <div v-else-if="searchResults.length === 0 && keyword.trim() === ''" class="empty-results">
          <i class="fas fa-arrow-up"></i>
          <p>输入关键词试试吧~</p>
        </div>
        <div v-else class="results-grid">
          <div
            v-for="item in searchResults"
            :key="item.id + '-' + item.type"
            class="result-card"
            @click="goToDetail(item)"
          >
            <div class="result-cover">
              <div
                class="cover-img-place"
                :style="{ backgroundImage: `url(${item.coverImage || fallbackCover})` }"
              ></div>
            </div>
            <div class="result-info">
              <div class="result-title" v-html="highlightKeyword(item.title, keyword)"></div>
              <div class="result-score">
                <span class="score-value">{{ formatScore(item.score) }}</span>
                <span class="score-stars" :ref="el => setStarsRef(el, item.score)"></span>
                <span class="score-count">{{ formatRatingCount(item.ratingCount) }}人评价</span>
              </div>
              <div class="result-meta">
                <span><i class="far fa-calendar-alt"></i> {{ item.type === 'riman' ? '日漫' : '国漫' }}</span>
                <span><i class="fas fa-tag"></i> 动漫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>动漫门户网站 · 搜索体验 | 数据来源于数据库</p>
      <p style="margin-top: 8px;">© AnimePortal 项目 | 键盘 ↑↓ 选择联想项，Enter 搜索/跳转详情</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// ==================== 响应式数据 ====================
const keyword = ref('')
const suggestList = ref([])
const searchResults = ref([])
const loadingSuggest = ref(false)
const loadingResult = ref(false)
const error = ref(null)
const showSuggest = ref(false)
const currentSuggestIndex = ref(-1)

let debounceTimer = null

// 封面上占位图
const fallbackCover = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 120'%3E%3Crect width='90' height='120' fill='%2334495e'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='%23e0e4e8' text-anchor='middle' dy='.3em'%3E封面%3C/text%3E%3C/svg%3E"

// ==================== 辅助函数 ====================
// 安全格式化分数（确保 score 是数字）
const formatScore = (score) => {
  if (score === null || score === undefined) return '暂无'
  const numScore = parseFloat(score)
  if (isNaN(numScore)) return '暂无'
  return numScore.toFixed(1)
}

// 高亮关键词
const highlightKeyword = (text, keywordStr) => {
  if (!keywordStr || !text) return text
  const escaped = keywordStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, match => `<span class="highlight">${match}</span>`)
}

// 渲染星星（10分制转5星）
const renderStars = (score, container) => {
  if (!container) return
  let numScore = parseFloat(score)
  if (isNaN(numScore)) return
  container.innerHTML = ''
  let starValue = numScore / 2
  let fullStars = Math.floor(starValue)
  let hasHalfStar = (starValue - fullStars) >= 0.5
  let emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  fullStars = Math.min(fullStars, 5)
  if (fullStars === 5) {
    hasHalfStar = false
    emptyStars = 0
  }
  let html = ''
  for (let i = 0; i < fullStars; i++) html += '<i class="fas fa-star"></i>'
  if (hasHalfStar) html += '<i class="fas fa-star-half-alt"></i>'
  for (let i = 0; i < emptyStars; i++) html += '<i class="far fa-star"></i>'
  container.innerHTML = html
}

const setStarsRef = (el, score) => {
  if (el && score !== undefined) {
    renderStars(score, el)
  }
}

// 格式化评分人数
const formatRatingCount = (count) => {
  if (!count) return '0'
  const num = parseInt(count)
  if (isNaN(num)) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

// ==================== API 调用 ====================
const searchAll = async (kw) => {
  if (!kw.trim()) return []
  try {
    const baseURL = 'http://localhost:3000'
    // 后端已配置 CORS，确保服务运行在 3000 端口
    const [rimanRes, guomanRes] = await Promise.all([
      axios.get(`${baseURL}/api/animes/search/${encodeURIComponent(kw)}`).catch(() => ({ data: [] })),
      axios.get(`${baseURL}/api/guoman/search/${encodeURIComponent(kw)}`).catch(() => ({ data: [] }))
    ])

    const rimanList = (rimanRes.data || []).map(item => ({ ...item, type: 'riman' }))
    const guomanList = (guomanRes.data || []).map(item => ({ ...item, type: 'guoman' }))

    return [...rimanList, ...guomanList]
  } catch (err) {
    console.error('搜索请求失败:', err)
    throw new Error('网络请求失败，请确保后端服务已启动 (http://localhost:3000)')
  }
}

// 执行搜索
const performSearch = async () => {
  const kw = keyword.value.trim()
  if (!kw) {
    searchResults.value = []
    error.value = null
    return
  }

  loadingResult.value = true
  error.value = null
  try {
    const results = await searchAll(kw)
    searchResults.value = results
  } catch (err) {
    error.value = err.message || '搜索失败，请检查网络或后端服务'
    searchResults.value = []
  } finally {
    loadingResult.value = false
    showSuggest.value = false
  }
}

// 获取联想数据
const fetchSuggestions = async (kw) => {
  if (!kw.trim()) {
    suggestList.value = []
    showSuggest.value = false
    return
  }
  loadingSuggest.value = true
  try {
    const results = await searchAll(kw)
    suggestList.value = results.slice(0, 10)
    showSuggest.value = true
  } catch (err) {
    suggestList.value = []
    showSuggest.value = false
  } finally {
    loadingSuggest.value = false
  }
}

// 输入防抖
const onInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!keyword.value.trim()) {
    searchResults.value = []
    suggestList.value = []
    showSuggest.value = false
    currentSuggestIndex.value = -1
    return
  }
  debounceTimer = setTimeout(() => {
    fetchSuggestions(keyword.value)
  }, 300)
}

// 选中联想项 → 直接跳转详情页
const selectSuggestion = (item) => {
  showSuggest.value = false
  currentSuggestIndex.value = -1
  router.push(`/detail/${item.type}/${item.id}`)
}

// 清除搜索
const clearSearch = () => {
  keyword.value = ''
  searchResults.value = []
  suggestList.value = []
  showSuggest.value = false
  currentSuggestIndex.value = -1
  error.value = null
  if (debounceTimer) clearTimeout(debounceTimer)
}

// 键盘导航
const handleKeydown = (e) => {
  if (!showSuggest.value || suggestList.value.length === 0) {
    if (e.key === 'Enter') {
      e.preventDefault()
      performSearch()
    }
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    currentSuggestIndex.value = (currentSuggestIndex.value + 1) % suggestList.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    currentSuggestIndex.value = (currentSuggestIndex.value - 1 + suggestList.value.length) % suggestList.value.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (currentSuggestIndex.value >= 0) {
      selectSuggestion(suggestList.value[currentSuggestIndex.value])
    } else {
      performSearch()
    }
  }
}

// 点击搜索框显示联想
const onFocus = () => {
  if (keyword.value.trim() && suggestList.value.length > 0) {
    showSuggest.value = true
  }
}

// 点击外部关闭联想栏
const handleClickOutside = (e) => {
  const wrapper = document.querySelector('.search-wrapper')
  if (wrapper && !wrapper.contains(e.target)) {
    showSuggest.value = false
  }
}

// 跳转详情页
const goToDetail = (item) => {
  router.push(`/detail/${item.type}/${item.id}`)
}

// ==================== 生命周期 ====================
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>
<style scoped>
/* ==================== 复用 Detailed.vue 导航栏样式 ==================== */
.navbar {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00bcd4;
  letter-spacing: 1px;
}
.logo i {
  margin-right: 6px;
}
.nav-links {
  display: flex;
  gap: 24px;
  font-weight: 500;
}
.nav-links a {
  text-decoration: none;
  color: #2c3e4e;
  transition: color 0.2s;
}
.nav-links a:hover,
.nav-links a.active {
  color: #00bcd4;
}
.search-box {
  background-color: #f4f5f7;
  border-radius: 20px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-box i {
  color: #99a2aa;
}
.search-box input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.9rem;
  width: 160px;
  pointer-events: none;
}

/* ==================== 搜索页特有样式 ==================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #1e2a3a;
  line-height: 1.5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-main {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 20px 40px;
  width: 100%;
}

.search-section {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  position: relative;
}
.search-wrapper {
  width: 100%;
  max-width: 680px;
  position: relative;
}
.search-input-container {
  width: 100%;
  background-color: #fff;
  border-radius: 48px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  padding: 8px 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}
.search-input-container:focus-within {
  border-color: #00bcd4;
  box-shadow: 0 8px 24px rgba(0, 188, 212, 0.12);
}
.search-icon {
  color: #99a2aa;
  font-size: 1.2rem;
  margin-right: 12px;
}
#searchInput {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  padding: 12px 0;
  background: transparent;
  font-weight: 500;
  color: #1e2a3a;
}
.clear-btn {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  font-size: 1rem;
  padding: 0 8px;
}
.clear-btn:hover {
  color: #00bcd4;
}

/* 联想栏 */
.suggest-box {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 24px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  max-height: 320px;
  overflow-y: auto;
  z-index: 20;
  border: 1px solid #edf2f7;
}
.suggest-item {
  padding: 12px 20px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.15s;
  border-bottom: 1px solid #f0f2f5;
  color: #2d3e50;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.suggest-item:last-child {
  border-bottom: none;
}
.suggest-item:hover,
.suggest-item.active {
  background-color: #f0f9fe;
}
.suggest-highlight {
  color: #e53e3e;
  font-weight: 600;
}
.suggest-type {
  font-size: 0.7rem;
  color: #8c9aa8;
  margin-left: 12px;
}
.suggest-empty {
  padding: 16px 20px;
  text-align: center;
  color: #8c9aa8;
  font-size: 0.85rem;
}

/* 搜索结果 */
.results-section {
  margin-top: 20px;
}
.results-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #5a6f84;
  margin-bottom: 18px;
  padding-left: 8px;
}
.results-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.result-card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 20px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #edf2f7;
}
.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: #cbdae9;
}
.result-cover {
  flex-shrink: 0;
  width: 90px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(145deg, #2c3e4e, #1f2c38);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.cover-img-place {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}
.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.result-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #0b1c26;
}
.result-title :deep(.highlight) {
  color: #e53e3e;
  font-weight: 800;
}
.result-score {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.score-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ff9900;
  background: #fff6e5;
  padding: 2px 12px;
  border-radius: 40px;
}
.score-stars {
  color: #ffb83b;
  font-size: 0.8rem;
  letter-spacing: 2px;
}
.score-count {
  color: #7a8b9f;
  font-size: 0.75rem;
}
.result-meta {
  margin-top: 8px;
  display: flex;
  gap: 16px;
  font-size: 0.7rem;
  color: #8c9aa8;
}

/* 加载/错误/空状态 */
.loading-state,
.error-state,
.empty-results {
  text-align: center;
  padding: 48px 20px;
  background: white;
  border-radius: 32px;
  color: #9aaebf;
}
.loading-state i,
.error-state i,
.empty-results i {
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: 12px;
  display: block;
}
.error-state i {
  color: #ff6b6b;
}
.retry-btn {
  margin-top: 16px;
  background: #00bcd4;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 40px;
  cursor: pointer;
}
.retry-btn:hover {
  background: #0097a7;
}

/* 底部 */
.footer {
  text-align: center;
  margin-top: 60px;
  padding: 24px;
  color: #7d8e9f;
  font-size: 0.8rem;
  border-top: 1px solid #e9edf2;
  background: #f5f7fa;
}

/* 响应式 */
@media (max-width: 768px) {
  .search-main {
    padding-top: 40px;
  }
  .result-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .result-cover {
    width: 100%;
    max-width: 140px;
    height: auto;
    aspect-ratio: 90 / 120;
  }
  .nav-inner {
    flex-direction: column;
    gap: 12px;
  }
  .search-box {
    width: 100%;
  }
  .search-box input {
    width: 100%;
  }
}

/* ==================== 固定底部样式 ==================== */
/* 确保 html 和 body 以及 Vue 根容器占满视口高度 */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  display: flex;
  flex-direction: column;
}

#app {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 如果模板最外层有包裹容器，也可以保证弹性撑开 */
.search-main {
  flex: 1; /* 已存在，确保中间区域撑满剩余空间 */
}
</style>