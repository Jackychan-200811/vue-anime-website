<template>
  <div class="detail-scroll">
    <!-- 加载状态 -->
    <div v-if="loading" class="detail-loading">
      <div class="spinner"></div>
      <p>正在加载动漫详情...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="detail-error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchDetail">重新加载</button>
    </div>

    <!-- 详情内容 -->
    <div v-else-if="animeData" class="detail-card">
      <!-- 头部：封面 + 信息 -->
      <div class="info-header">
        <div class="cover">
          <img
            v-if="animeData.coverImage"
            :src="animeData.coverImage"
            :alt="animeData.title"
            class="cover-img"
            @error="handleImageError"
          />
          <div v-else class="cover-placeholder">
            <span>{{ animeData.title?.charAt(0) || '?' }}</span>
          </div>
        </div>

        <div class="info-details">
          <!-- 标题 -->
          <h1 class="anime-title">{{ animeData.title }}</h1>
          <div v-if="animeData.titleJp" class="anime-title-jp">{{ animeData.titleJp }}</div>
          <div v-if="animeData.titleEn" class="anime-title-en">{{ animeData.titleEn }}</div>

          <!-- 标签 -->
          <div class="tags" v-if="animeData.tags && animeData.tags.length">
            <span v-for="tag in animeData.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <!-- 评分 -->
          <div class="score-area" v-if="animeData.score">
            <span class="score-number">{{ formatScore(animeData.score) }}</span>
            <span class="score-stars" ref="starContainer"></span>
            <span class="score-people" v-if="animeData.reviewCount">{{ formatCount(animeData.reviewCount) }}人评</span>
            <span class="score-review-link"><i class="far fa-comment-dots"></i> 我要点评</span>
          </div>

          <!-- 数据统计 -->
          <div class="stats-row">
            <span class="stat-item" v-if="animeData.playCount">
              <i class="fas fa-play-circle"></i>
              <span class="stat-number">{{ animeData.playCount }}</span> 播放
            </span>
            <span class="stat-item" v-if="animeData.followCount">
              <i class="fas fa-users"></i>
              <span class="stat-number">{{ animeData.followCount }}</span> 追番
            </span>
            <span class="stat-item" v-if="animeData.reviewCount">
              <i class="fas fa-comment"></i>
              <span class="stat-number">{{ formatCount(animeData.reviewCount) }}</span> 评论
            </span>
          </div>

          <!-- 元信息 -->
          <div class="info-meta">
            <span v-if="animeData.startDate"><i class="far fa-calendar-alt"></i> {{ animeData.startDate }}开播</span>
            <span v-if="animeData.status"><i class="fas fa-check-circle"></i> {{ animeData.status }}</span>
            <span v-if="animeData.language"><i class="fas fa-language"></i> {{ animeData.language }}</span>
            <span v-if="animeData.episodes && animeData.episodes.length">
              <i class="fas fa-list-alt"></i> 全{{ animeData.episodes.length }}话
            </span>
          </div>

          <!-- 按钮组 -->
          <div class="button-group">
            <a v-if="animeData.playLink" :href="animeData.playLink" target="_blank" class="btn btn-primary"><i class="fas fa-play"></i> 播放</a>
            <button v-else class="btn btn-primary"><i class="fas fa-play"></i> 播放</button>
            <button class="btn btn-outline"><i class="fas fa-plus-circle"></i> 追番</button>
            <button class="btn btn-outline"><i class="fas fa-share-alt"></i> 分享</button>
          </div>
        </div>
      </div>

      <!-- 简介 -->
      <div class="section" v-if="animeData.synopsis">
        <div class="section-title">简介</div>
        <div class="synopsis-text">{{ animeData.synopsis }}</div>
      </div>

      <!-- 角色配音 -->
      <div class="section" v-if="castList.length">
        <div class="section-title">角色配音</div>
        <div class="cast-grid">
          <div v-for="(item, idx) in castList" :key="idx" class="cast-card">
            <div class="cast-avatar">{{ (item.character || item.role || '?').charAt(0) }}</div>
            <div class="cast-info">
              <h4>{{ item.character || item.role || item }}</h4>
              <p>{{ item.actor || item.voiceActor || '' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- STAFF -->
      <div class="section" v-if="staffList.length">
        <div class="section-title">STAFF</div>
        <div class="staff-grid">
          <div v-for="(item, idx) in staffList" :key="idx" class="staff-item">
            <span class="staff-role">{{ item.role || item.position || item }}</span>
            <span class="staff-name" v-if="item.name">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 剧集 -->
      <div class="section" v-if="animeData.episodes && animeData.episodes.length">
        <div class="section-header">
          <div class="section-title">剧集</div>
          <span v-if="animeData.episodeMoreLink" class="section-more-link"><a :href="animeData.episodeMoreLink" target="_blank">详情 →</a></span>
          <span v-else class="section-more-link">详情 →</span>
        </div>
        <div class="episode-list">
          <div v-for="(ep, idx) in animeData.episodes" :key="idx" class="episode-card">
            <i class="fas fa-play-circle"></i>
            {{ typeof ep === 'string' ? ep : (ep.title || `第${idx+1}话`) }}
          </div>
        </div>
      </div>

      <!-- 评论 -->
      <div class="section" v-if="reviews.length">
        <div class="section-header">
          <div class="section-title">
            精选短评
            <span class="review-count-tip" v-if="animeData.reviewCount">共{{ animeData.reviewCount }}条短评</span>
          </div>
          <span v-if="animeData.reviewLink" class="section-more-link"><a :href="animeData.reviewLink" target="_blank">更多 →</a></span>
          <span v-else class="section-more-link">更多 →</span>
        </div>
        <div class="reviews-preview">
          <div v-for="(r, idx) in reviews" :key="idx" class="review-item">
            <div class="review-header">
              <div class="reviewer-avatar">{{ r.avatarText || r.reviewerName?.charAt(0) || '?' }}</div>
              <span class="reviewer-name">{{ r.reviewerName || r.user || '匿名' }}</span>
              <div class="review-score" v-if="r.score">
                <span class="review-score-number">{{ formatScore(r.score) }}</span>
                <span class="review-score-stars" :ref="el => renderReviewStars(el, r.score)"></span>
              </div>
            </div>
            <div class="review-content">{{ r.content || r.text || r }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import axios from 'axios'

const props = defineProps({
  animeType: { type: String, default: 'riman' },
  animeId: { type: [Number, String], default: null }
})

const loading = ref(true)
const error = ref(null)
const animeData = ref(null)
const starContainer = ref(null)
const actualAnimeId = ref(null)

const castList = ref([])
const staffList = ref([])
const reviews = ref([])

const formatScore = (s) => {
  if (s === null || s === undefined) return '-'
  const n = parseFloat(s)
  return isNaN(n) ? '-' : n.toFixed(1)
}
const formatCount = (c) => {
  const n = parseInt(c)
  if (isNaN(n)) return '0'
  return n >= 10000 ? (n / 10000).toFixed(1) + '万' : n.toString()
}

// 解析字段（可能是 JSON 字符串或原始数组）
const parseField = (field) => {
  if (!field) return []
  if (Array.isArray(field)) return field
  if (typeof field === 'string') {
    try { const parsed = JSON.parse(field); return Array.isArray(parsed) ? parsed : [] } catch(e) { return [] }
  }
  return []
}

// 解析角色列表（支持多种格式）
const parseCastList = (raw) => {
  const list = parseField(raw)
  if (!list.length) return []
  // 如果元素是字符串 "角色名: 声优名"
  if (typeof list[0] === 'string') {
    return list.map(s => {
      const parts = s.split(/[:：]/)
      return { character: (parts[0] || '').trim(), actor: (parts[1] || '').trim() }
    }).filter(c => c.character)
  }
  return list
}

// 解析 STAFF 列表
const parseStaffList = (raw) => {
  const list = parseField(raw)
  if (!list.length) return []
  if (typeof list[0] === 'string') {
    return list.map(s => {
      const parts = s.split(/[:：]/)
      return { role: (parts[0] || '').trim(), name: (parts[1] || '').trim() }
    }).filter(s => s.role)
  }
  return list
}

// 渲染星星（5星制，10分满分）
const renderStars = (container, score) => {
  if (!container || !score) return
  const num = parseFloat(score) / 2
  let full = Math.min(Math.floor(num), 5)
  let half = (num - full) >= 0.5 && full < 5
  let empty = Math.max(0, 5 - full - (half ? 1 : 0))

  let html = ''
  for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>'
  if (half) html += '<i class="fas fa-star-half-alt"></i>'
  for (let i = 0; i < empty; i++) html += '<i class="far fa-star"></i>'
  container.innerHTML = html
}

const renderReviewStars = (el, score) => {
  if (el && score) renderStars(el, score)
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const fetchFirstValidId = async () => {
  try {
    const url = props.animeType === 'guoman'
      ? 'http://localhost:3000/api/guoman'
      : 'http://localhost:3000/api/animes'
    const res = await axios.get(url, { timeout: 10000 })
    const list = res.data?.data || res.data || []
    if (list.length > 0) { actualAnimeId.value = list[0].id; return true }
    return false
  } catch (e) {
    console.error('获取列表失败:', e)
    return false
  }
}

const fetchDetail = async () => {
  if (!props.animeId && !actualAnimeId.value) {
    const ok = await fetchFirstValidId()
    if (!ok) { loading.value = false; error.value = '无法获取动漫列表'; return }
  }
  const id = props.animeId || actualAnimeId.value
  if (!id) return

  loading.value = true
  error.value = null

  const url = props.animeType === 'guoman'
    ? `http://localhost:3000/api/guoman/${id}`
    : `http://localhost:3000/api/animes/${id}`

  try {
    const res = await axios.get(url, { timeout: 10000 })
    const data = res.data
    animeData.value = data

    castList.value = parseCastList(data.castList)
    staffList.value = parseStaffList(data.staffList)
    reviews.value = parseField(data.reviews)
  } catch (e) {
    console.error('获取详情失败:', e)
    animeData.value = {
      id, title: props.animeType === 'guoman' ? '国漫示例' : '日漫示例',
      titleJp: '', tags: ['热血', '冒险'], score: 8.5, reviewCount: 1234,
      playCount: '100万', followCount: '50万', startDate: '2024-01',
      status: '连载中', language: props.animeType === 'guoman' ? '国语' : '日语',
      synopsis: '这是一部精彩的动漫作品。',
      episodes: ['第1集 缘起', '第2集 相遇', '第3集 成长']
    }
    castList.value = []
    staffList.value = []
    reviews.value = []
  } finally {
    loading.value = false
  }
}

// 监听 animeData 变化，loading=false 后 DOM 就绪再渲染星星
watch(animeData, async (val) => {
  if (val?.score) {
    await nextTick()
    renderStars(starContainer.value, val.score)
  }
})

watch(() => props.animeType, () => {
  actualAnimeId.value = null
  fetchDetail()
}, { immediate: true })
</script>

<style scoped>
.detail-scroll {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
.detail-scroll::-webkit-scrollbar { width: 5px; }
.detail-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.04); border-radius: 3px; }
.detail-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 3px; }

/* 加载 / 错误 */
.detail-loading, .detail-error {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: rgba(0,0,0,.45); font-size: 14px; gap: 16px;
}
.spinner {
  width: 28px; height: 28px; border: 3px solid rgba(0,0,0,.08);
  border-top-color: #00bcd4; border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn {
  background: #00bcd4; color: #fff; border: none; padding: 8px 20px;
  border-radius: 20px; cursor: pointer; font-size: 13px;
}

/* 详情卡片 — 与灵动岛玻璃背景一致 */
.detail-card {
  background: transparent;
  border-radius: 0;
  overflow: hidden;
}

/* 头部 */
.info-header {
  display: flex; flex-wrap: wrap; gap: 24px;
  padding: 0; border-bottom: 1px solid rgba(255,255,255,.2);
}
.cover {
  flex-shrink: 0; width: 180px; border-radius: 16px; overflow: hidden;
}
.cover-img { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block; border-radius: 16px; }
.cover-placeholder {
  width: 100%; aspect-ratio: 3/4; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  font-size: 40px; font-weight: 700; color: rgba(255,255,255,.5);
}

.info-details { flex: 1; min-width: 200px; }
.anime-title { font-size: 1.4rem; font-weight: 700; color: #0b1c26; margin: 0 0 6px; line-height: 1.3; }
.anime-title-jp { font-size: .95rem; color: #555; margin-bottom: 4px; letter-spacing: .5px; }
.anime-title-en { font-size: .8rem; color: #777; margin-bottom: 8px; }

.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.tag {
  background: rgba(255,255,255,.55); padding: 3px 10px; border-radius: 14px;
  font-size: .7rem; color: #333;
}

.score-area { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px dashed rgba(0,0,0,.1); }
.score-number { font-size: 1.8rem; font-weight: 800; color: #ff9900; }
.score-stars { color: #ffb83b; font-size: .85rem; letter-spacing: 1px; }
.score-people { color: #666; font-size: .75rem; }
.score-review-link { color: #00bcd4; font-size: .75rem; cursor: pointer; margin-left: 4px; }
.score-review-link:hover { text-decoration: underline; }

.stats-row {
  display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px;
}
.stat-item {
  background: rgba(255,255,255,.5); padding: 5px 10px; border-radius: 14px;
  font-size: .78rem; display: flex; align-items: center; gap: 5px; color: #444;
}
.stat-item i { color: #00bcd4; font-size: .85rem; }
.stat-number { font-weight: 700; color: #1e2f3e; }

.info-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: .78rem; }
.info-meta span { background: rgba(255,255,255,.5); padding: 3px 8px; border-radius: 14px; display: flex; align-items: center; gap: 4px; color: #444; }

/* 按钮组 */
.button-group { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; border-radius: 24px; font-weight: 600; font-size: .85rem;
  cursor: pointer; border: none; background: none; transition: all .2s; text-decoration: none;
}
.btn-primary { background: #00bcd4; color: #fff; box-shadow: 0 2px 8px rgba(0,188,212,.3); }
.btn-primary:hover { background: #0097a7; transform: translateY(-1px); }
.btn-outline { border: 1px solid rgba(0,0,0,.15); background: rgba(255,255,255,.5); color: #333; }
.btn-outline:hover { border-color: #00bcd4; color: #00bcd4; background: rgba(0,180,216,.1); }

/* 区块 */
.section { padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,.06); }
.section:last-child { border-bottom: none; }
.section-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
}
.section-header .section-title { margin-bottom: 0; }
.section-title {
  font-size: 1rem; font-weight: 700; color: #1a2a3a;
  padding-left: 10px; border-left: 4px solid #00bcd4;
}
.section-more-link { font-size: .78rem; color: #555; cursor: pointer; }
.section-more-link a { color: inherit; text-decoration: none; }
.section-more-link:hover { color: #00bcd4; }
.review-count-tip { font-size: .72rem; color: #888; margin-left: 10px; font-weight: 400; }
.synopsis-text {
  font-size: .85rem; line-height: 1.7; color: #333;
  background: rgba(255,255,255,.45); padding: 12px 14px; border-radius: 12px;
}

/* 角色 */
.cast-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}
.cast-card {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,.5); border-radius: 14px; padding: 10px 14px;
  border: 1px solid rgba(0,0,0,.06);
}
.cast-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #7ec8ff, #09F);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #fff; font-size: .9rem;
}
.cast-info h4 { font-size: .85rem; font-weight: 700; margin: 0 0 3px; color: #1a2a3a; }
.cast-info p { font-size: .72rem; color: #666; margin: 0; }

/* STAFF */
.staff-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;
}
.staff-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 14px; background: rgba(255,255,255,.45); border-radius: 12px;
  border: 1px solid rgba(0,0,0,.06); font-size: .8rem;
}
.staff-role { font-weight: 700; color: #333; }
.staff-name { color: #00bcd4; font-weight: 500; }

/* 剧集 */
.episode-list { display: flex; flex-wrap: wrap; gap: 10px; }
.episode-card {
  background: rgba(255,255,255,.5); border-radius: 20px; padding: 8px 18px;
  font-size: .8rem; font-weight: 500; color: #333;
  border: 1px solid rgba(0,0,0,.08); display: flex; align-items: center; gap: 6px;
  transition: all .2s;
}
.episode-card:hover { background: #00bcd4; color: #fff; border-color: #00bcd4; }
.episode-card i { font-size: .75rem; }

/* 评论 */
.reviews-preview { display: flex; flex-direction: column; gap: 14px; }
.review-item {
  background: rgba(255,255,255,.4); padding: 14px 18px; border-radius: 16px;
  border-left: 4px solid #00bcd4;
}
.review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.reviewer-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #7ec8ff, #09F);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #fff; font-size: .8rem;
}
.reviewer-name { font-weight: 600; font-size: .85rem; color: #1a2a3a; }
.review-score { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.review-score-number { font-size: .9rem; font-weight: 700; color: #ff9900; }
.review-score-stars { color: #ffb83b; font-size: .7rem; }
.review-content { font-size: .82rem; color: #444; line-height: 1.6; }
</style>
