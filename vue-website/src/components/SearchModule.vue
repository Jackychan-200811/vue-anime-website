<template>
    <div class="search-module">
      <!-- 搜索舱 - 搜索结果未展开且未被拖拽禁用时显示 -->
      <div v-if="!isExpanded && !disabled" class="search-growth-pod" :class="{ 'is-search-open': isSearchOpen }" ref="searchWrapperRef">
        <div class="pod-top-bar">
          <input type="text" class="search-input-leftward" :class="{ 'is-input-active': isSearchOpen }"
            placeholder="搜索动漫、声优..." v-model="keyword" autocomplete="off" ref="searchInputRef"
            @input="onInput" @keydown="handleKeydown" @focus="onFocus" />
          <button class="clear-btn-inline" @click="clearSearch" v-show="keyword && isSearchOpen">×</button>
          <button class="search-fixed-right-btn" @click="handleSearchClick">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
        
        <!-- 关键词联想弹窗 -->
        <div 
          v-if="isSearchOpen && keyword.trim() && showSuggest" 
          class="pod-extend-basement"
        >
          <div class="suggest-scroll-zone" v-if="suggestList.length">
            <div v-for="(item, idx) in suggestList" :key="item.id" class="suggest-item" :class="{ active: idx === currentSuggestIndex }"
              @click.stop="selectSuggestion(item)" @mouseenter="currentSuggestIndex = idx">
              <span v-html="highlightKeyword(item.title, keyword)"></span>
              <span class="suggest-type">[{{ item.type === 'riman' ? '日漫' : '国漫' }}]</span>
            </div>
          </div>
          <div class="suggest-empty" v-else-if="!loadingSuggest">😢 未找到相关动漫</div>
        </div>
      </div>
  
      <!-- 搜索结果面板 - 只在展开时显示（占满灵动岛） -->
      <div v-if="isExpanded" class="island-result-panel">
        <div class="panel-header">
          <div class="panel-title">✨ 搜索结果: <mark class="search-mark">"{{ lastSearchedKeyword }}"</mark></div>
          <button class="panel-close-btn" @click="closeExpand">✕</button>
        </div>
        <div class="panel-scroll-content">
          <div v-if="loadingResult" class="loading-state"><div class="spinner"></div><p>正在检索数据库...</p></div>
          <div v-else-if="error" class="error-state"><p>⚠️ {{ error }}</p><button @click="performSearch" class="retry-btn">重新尝试</button></div>
          <div v-else-if="!searchResults.length" class="empty-results"><p>没有找到相关动漫，试试其他关键词吧~</p></div>
          <div v-else class="results-grid">
            <div v-for="item in searchResults" :key="item.id" class="result-card" @click="goToDetail(item)">
              <div class="result-cover"><div class="cover-img-place" :style="{ backgroundImage: `url(${item.coverImage || fallbackCover})` }"></div></div>
              <div class="result-info">
                <div class="result-title" v-html="highlightKeyword(item.title, lastSearchedKeyword)"></div>
                <div class="result-score">
                  <span class="score-value">{{ formatScore(item.score) }}</span>
                  <span class="score-stars" :ref="el => setStarsRef(el, item.score)"></span>
                  <span class="score-count">{{ formatRatingCount(item.ratingCount) }}人评价</span>
                </div>
                <div class="result-meta"><span>标签: {{ item.type === 'riman' ? '日漫' : '国漫' }}</span><span>类型: 动漫门户</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  
  const router = useRouter()
  
  // Props & Emits
  const props = defineProps({
    disabled: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['expand', 'collapse'])
  
  // 状态
  const isSearchOpen = ref(false)      // 搜索框是否展开
  const isExpanded = ref(false)        // 搜索结果面板是否展开（灵动岛展开）
  const keyword = ref('')
  const suggestList = ref([])
  const searchResults = ref([])
  const loadingSuggest = ref(false)
  const loadingResult = ref(false)
  const error = ref(null)
  const showSuggest = ref(false)
  const currentSuggestIndex = ref(-1)
  const lastSearchedKeyword = ref('')
  const searchWrapperRef = ref(null)
  const searchInputRef = ref(null)
  let debounceTimer = null
  const fallbackCover = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 120'%3E%3Crect width='90' height='120' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3E封面%3C/text%3E%3C/svg%3E"
  
  // 方法
  const handleSearchClick = () => {
    if (!isSearchOpen.value && !isExpanded.value) {
      // 只展开搜索框，不展开结果面板
      isSearchOpen.value = true
      nextTick(() => searchInputRef.value?.focus())
    }
  }
  
  const formatScore = s => s && !isNaN(parseFloat(s)) ? parseFloat(s).toFixed(1) : '暂无'
  const highlightKeyword = (text, kw) => !kw || !text ? text : text.replace(new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<span class="suggest-highlight">$1</span>')
  const formatRatingCount = c => { let n = parseInt(c); return isNaN(n) ? '0' : n >= 10000 ? (n/10000).toFixed(1)+'万' : n.toString() }
  
  const renderStars = (score, container) => {
    if (!container) return
    let num = parseFloat(score) / 2
    let full = Math.min(Math.floor(num), 5)
    let half = (num - full) >= 0.5 && full < 5
    let empty = 5 - full - (half ? 1 : 0)
    container.innerHTML = '<i class="fas fa-star"></i>'.repeat(full) + (half ? '<i class="fas fa-star-half-alt"></i>' : '') + '<i class="far fa-star"></i>'.repeat(empty)
  }
  
  const setStarsRef = (el, score) => {
    if (el && score) {
      renderStars(score, el)
    }
  }
  
  const searchAll = async kw => {
    if (!kw.trim()) return []
    try {
      const baseURL = 'http://localhost:3000'
      const [riman, guoman] = await Promise.all([
        axios.get(`${baseURL}/api/animes/search/${encodeURIComponent(kw)}`).catch(() => ({ data: [] })),
        axios.get(`${baseURL}/api/guoman/search/${encodeURIComponent(kw)}`).catch(() => ({ data: [] }))
      ])
      return [...(riman.data || []).map(i => ({ ...i, type: 'riman' })), ...(guoman.data || []).map(i => ({ ...i, type: 'guoman' }))]
    } catch (e) {
      throw new Error('无法连接至本地后端数据库，请确认3000端口正常开启')
    }
  }
  
  // 执行搜索并展开灵动岛
  const performSearch = async () => {
    const kw = keyword.value.trim()
    if (!kw) return
    showSuggest.value = false
    loadingResult.value = true
    error.value = null
    lastSearchedKeyword.value = kw
    
    try {
      searchResults.value = await searchAll(kw)
      // 关闭搜索框展开状态，打开结果面板
      isSearchOpen.value = false
      isExpanded.value = true
      emit('expand')
    } catch (e) {
      error.value = e.message
      searchResults.value = []
    } finally {
      loadingResult.value = false
    }
  }
  
  const fetchSuggestions = async kw => {
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
    } catch (e) {
      suggestList.value = []
      showSuggest.value = false
    } finally {
      loadingSuggest.value = false
    }
  }
  
  const onInput = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (!keyword.value.trim()) {
      suggestList.value = []
      showSuggest.value = false
      currentSuggestIndex.value = -1
      return
    }
    debounceTimer = setTimeout(() => fetchSuggestions(keyword.value), 300)
  }
  
  const selectSuggestion = (item) => {
    keyword.value = item.title
    currentSuggestIndex.value = -1
    showSuggest.value = false
    // 选中联想后直接执行搜索并展开
    performSearch()
  }
  
  const clearSearch = () => {
    keyword.value = ''
    suggestList.value = []
    showSuggest.value = false
    currentSuggestIndex.value = -1
  }
  
  const handleKeydown = e => {
    if (!showSuggest.value || !suggestList.value.length) {
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
  
  const onFocus = () => {
    if (keyword.value.trim() && suggestList.value.length && !isExpanded.value) {
      showSuggest.value = true
    }
  }
  
  const closeExpand = () => {
    isExpanded.value = false
    isSearchOpen.value = false
    clearSearch()
    emit('collapse')
  }
  
  const handleClickOutside = e => {
    if (searchWrapperRef.value && !searchWrapperRef.value.contains(e.target)) {
      showSuggest.value = false
      if (!keyword.value.trim() && !isExpanded.value) {
        isSearchOpen.value = false
      }
    }
  }
  
  const goToDetail = (item) => {
    router.push(`/detail/${item.type}/${item.id}`)
    closeExpand()
  }
  
  // 暴露方法
  const closeSearch = () => {
    closeExpand()
  }
  
  const isSearchActive = () => {
    return isSearchOpen.value || isExpanded.value
  }
  
  defineExpose({
    closeSearch,
    isSearchActive
  })
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })
  
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    if (debounceTimer) clearTimeout(debounceTimer)
  })
  </script>
  
  <style scoped>
  /* ========== 搜索模块样式 ========== */
  
  .search-growth-pod {
    position: absolute;
    top: calc(50% - 18px);
    right: 8px;
    width: 36px;
    height: 36px;
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    z-index: 120;
    overflow: visible;
    transition: width .35s cubic-bezier(.16,1,.3,1), background-color .25s, border-radius .3s, box-shadow .3s;
  }
  
  .search-growth-pod.is-search-open {
    width: 260px;
    background: rgba(255,255,255,.2);
    backdrop-filter: blur(20px) contrast(170%) saturate(160%);
    -webkit-backdrop-filter: blur(20px) contrast(170%) saturate(160%);
    box-shadow: inset 0 1px 2px rgba(255,255,255,.5), 0 8px 24px rgba(15,23,42,.15);
    border: 1px solid rgba(255,255,255,.3);
  }
  
  .pod-top-bar {
    position: relative;
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
  }
  
  .search-fixed-right-btn {
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,.25);
    color: #334155;
    cursor: pointer;
    z-index: 50;
    transition: all .25s;
  }
  
  .search-fixed-right-btn:hover {
    background: rgba(0,180,216,.2);
    border-color: rgba(0,180,216,.35);
    color: #00b4d8;
  }
  
  .search-input-leftward {
    position: absolute;
    left: 0;
    height: 36px;
    border-radius: 18px;
    border: none;
    background: rgba(255,255,255,.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 0;
    font-size: 13px;
    color: #0f172a;
    outline: none;
    width: 0;
    opacity: 0;
    pointer-events: none;
    z-index: 40;
    transition: width .35s cubic-bezier(.16,1,.3,1), opacity .2s, padding .2s, background .2s;
  }
  
  .search-input-leftward.is-input-active {
    width: calc(100% - 36px);
    opacity: 1;
    pointer-events: auto;
    padding-left: 14px;
    padding-right: 10px;
    background: rgba(255,255,255,.25);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  
  .search-input-leftward::placeholder {
    color: #94a3b8;
  }
  
  .search-input-leftward:focus {
    background: rgba(255,255,255,.35);
    box-shadow: inset 0 0 0 1px rgba(0,180,216,.2);
  }
  
  .clear-btn-inline {
    position: absolute;
    right: 42px;
    background: rgba(255,255,255,.25);
    border: 1px solid rgba(255,255,255,.25);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    z-index: 45;
    transition: all .2s;
  }
  
  .clear-btn-inline:hover {
    background: rgba(0,180,216,.25);
    color: #00b4d8;
  }
  
  /* 联想弹窗 */
  .pod-extend-basement {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: rgba(255,255,255,.3);
    backdrop-filter: blur(24px) contrast(190%) saturate(170%);
    -webkit-backdrop-filter: blur(24px) contrast(190%) saturate(170%);
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.35);
    box-shadow: 0 12px 28px rgba(15,23,42,.18);
    overflow: hidden;
    z-index: 9999;
    max-height: 280px;
    overflow-y: auto;
  }
  
  .suggest-scroll-zone {
    flex: 1;
    overflow-y: auto;
  }
  
  .suggest-scroll-zone::-webkit-scrollbar {
    width: 4px;
  }
  
  .suggest-scroll-zone::-webkit-scrollbar-track {
    background: rgba(255,255,255,.1);
    border-radius: 2px;
  }
  
  .suggest-scroll-zone::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,.1);
    border-radius: 2px;
  }
  
  .suggest-item {
    padding: 10px 14px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,.15);
    color: #334155;
    transition: background .15s;
    background: transparent;
  }
  
  .suggest-item:hover,
  .suggest-item.active {
    background: rgba(255,255,255,.35);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #00b4d8;
  }
  
  .suggest-type {
    font-size: 10px;
    color: #64748b;
    background: rgba(255,255,255,.2);
    padding: 2px 6px;
    border-radius: 10px;
  }
  
  .suggest-empty {
    padding: 20px;
    text-align: center;
    color: #64748b;
    font-size: 12px;
  }
  
  /* 搜索结果面板 - 展开时占满灵动岛 */
  /* 搜索结果面板 - 展开时占满灵动岛，复用 navbar 的玻璃效果 */
.island-result-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 24px;
  /* 移除 background 和 backdrop-filter，使用 navbar 的 */
  overflow: hidden;
  animation: panelFadeIn .35s cubic-bezier(.16,1,.3,1);
}

/* 其他样式保持不变... */
  
  @keyframes panelFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255,255,255,.3);
    margin-bottom: 16px;
    flex-shrink: 0;
  }
  
  .panel-title {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
  }
  
  .search-mark {
    background: rgba(0,180,216,.2);
    border: 1px solid rgba(0,180,216,.3);
    padding: 2px 6px;
    border-radius: 4px;
    color: #00b4d8;
  }
  
  .panel-close-btn {
    background: rgba(255,255,255,.2);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,.4);
    border-radius: 30px;
    width: 36px;
    height: 36px;
    font-size: 20px;
    color: #1e293b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .3s;
  }
  
  .panel-close-btn:hover {
    background: rgba(255,255,255,.4);
    color: #00b4d8;
  }
  
  .panel-scroll-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
  }
  
  .panel-scroll-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .panel-scroll-content::-webkit-scrollbar-track {
    background: rgba(255,255,255,.1);
    border-radius: 3px;
  }
  
  .panel-scroll-content::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,.1);
    border-radius: 3px;
  }
  
  .results-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .result-card {
    background: rgba(255,255,255,.2);
    backdrop-filter: blur(16px) contrast(170%) saturate(155%);
    -webkit-backdrop-filter: blur(16px) contrast(170%) saturate(155%);
    border-radius: 16px;
    display: flex;
    gap: 16px;
    padding: 12px;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,.2);
    transition: all .25s;
  }
  
  .result-card:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,.35);
    border-color: rgba(0,180,216,.3);
    box-shadow: 0 8px 20px rgba(0,0,0,.06);
  }
  
  .result-cover {
    width: 72px;
    height: 96px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: rgba(255,255,255,.1);
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
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
  }
  
  .result-score {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }
  
  .score-value {
    font-size: 12px;
    font-weight: 700;
    color: #ff9f43;
    background: rgba(255,159,67,.1);
    padding: 1px 6px;
    border-radius: 4px;
  }
  
  .score-stars {
    color: #ffb83b;
    font-size: 10px;
  }
  
  .score-count {
    color: #64748b;
    font-size: 11px;
  }
  
  .result-meta {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: #64748b;
  }
  
  .loading-state,
  .error-state,
  .empty-results {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
  }
  
  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(0,0,0,.05);
    border-top-color: #00b4d8;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .retry-btn {
    background: rgba(0,180,216,.1);
    color: #00b4d8;
    border: 1px solid rgba(0,180,216,.2);
    padding: 6px 16px;
    border-radius: 15px;
    margin-top: 10px;
    cursor: pointer;
    transition: all .2s;
  }
  
  .retry-btn:hover {
    background: #00b4d8;
    color: #fff;
  }
  
  /* 高亮关键词 */
  :deep(.suggest-highlight) {
    color: #e53e3e;
    font-weight: 600;
  }
  
  :deep(.highlight) {
    color: #e53e3e;
    font-weight: 700;
  }
  </style>