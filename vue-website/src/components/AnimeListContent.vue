<template>
  <div class="anime-list-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="list-loading">
      <div class="spinner"></div>
      <p>正在加载{{ animeType === 'guoman' ? '国漫' : '日漫' }}列表...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="list-error">
      <p>⚠️ {{ error }}</p>
      <button class="retry-btn" @click="fetchList">重新加载</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="list.length === 0" class="list-empty">
      <p>暂无{{ animeType === 'guoman' ? '国漫' : '日漫' }}数据</p>
    </div>

    <!-- 卡片网格 -->
    <div v-else class="card-grid" ref="gridRef">
      <div
        v-for="item in list"
        :key="item.id"
        class="anime-card"
        @click="selectAnime(item)"
      >
        <div class="card-cover">
          <img
            v-if="item.coverImage"
            :src="item.coverImage"
            :alt="item.title"
            class="card-cover-img"
            @error="handleImgError"
          />
          <div v-else class="card-cover-placeholder">
            <span>{{ item.title?.charAt(0) || '?' }}</span>
          </div>
        </div>
        <div class="card-info">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-meta">
            <span v-if="item.score" class="card-score">⭐ {{ formatScore(item.score) }}</span>
            <span class="card-type">{{ animeType === 'guoman' ? '国漫' : '日漫' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  animeType: {
    type: String,
    default: 'riman'
  }
})

const emit = defineEmits(['select'])

const loading = ref(true)
const error = ref(null)
const list = ref([])
const gridRef = ref(null)

const formatScore = (s) => {
  const n = parseFloat(s)
  return isNaN(n) ? '-' : n.toFixed(1)
}

const handleImgError = (e) => {
  e.target.style.display = 'none'
}

const fetchList = async () => {
  loading.value = true
  error.value = null

  const apiUrl = props.animeType === 'guoman'
    ? 'http://localhost:3000/api/guoman'
    : 'http://localhost:3000/api/animes'

  try {
    const response = await axios.get(apiUrl, { timeout: 15000 })
    const data = response.data?.data || response.data || []
    list.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('获取动漫列表失败:', err)
    error.value = '无法连接至后端服务，请确认 http://localhost:3000 已启动'
    list.value = []
  } finally {
    loading.value = false
  }
}

const selectAnime = (item) => {
  emit('select', item)
}

// 类型变化时重新加载
watch(() => props.animeType, () => {
  fetchList()
})

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.anime-list-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.anime-list-content::-webkit-scrollbar { width: 5px; }
.anime-list-content::-webkit-scrollbar-track { background: rgba(0,0,0,.04); border-radius: 3px; }
.anime-list-content::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 3px; }

/* 加载/错误/空 */
.list-loading, .list-error, .list-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: rgba(0,0,0,.45); font-size: 14px; gap: 16px;
}
.spinner {
  width: 32px; height: 32px; border: 3px solid rgba(0,0,0,.08);
  border-top-color: #00bcd4; border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn {
  background: #00bcd4; color: #fff; border: none;
  padding: 8px 20px; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all .2s;
}
.retry-btn:hover { background: #0097a7; }

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 4px;
}

.anime-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  transition: all .25s;
}

.anime-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,.12);
  border-color: rgba(0,180,216,.3);
}

.card-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
}

.card-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  color: rgba(255,255,255,.5);
}

.card-info {
  padding: 12px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-score {
  font-size: 12px;
  color: #ff9f43;
  font-weight: 600;
}

.card-type {
  font-size: 11px;
  color: #5a6f84;
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 10px;
}
</style>
