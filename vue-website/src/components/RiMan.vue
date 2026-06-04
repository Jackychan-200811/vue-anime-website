<template>
  <div class="riman-page">
    <div class="nav-tabs">
      <router-link to="/">首页</router-link>
      <router-link to="/guoman">国漫总览</router-link>
      <router-link to="/riman" class="active">日漫总览</router-link>
    </div>
    <div class="section">
      <h3 class="section-title">日漫总览</h3>
      
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="fetchAnimeList" class="retry-btn">重试</button>
      </div>
      
      <div v-else class="tag-container">
        <!-- 把 router-link 提到最外层，包住整个卡片，点击整个卡片都能跳转 -->
        <router-link
          v-for="item in riManList"
          :key="item.id"
          :to="`/Detailed/${item.id}`"
          class="anime-card"
        >
          <div class="anime-cover">
            <!-- ✅ 添加 @error 事件处理图片加载失败 -->
            <img
              v-if="item.coverImage"
              :src="item.coverImage"
              :alt="item.title"
              @error="handleImageError"
            />
            <div v-else class="no-image-placeholder">
              <i class="fas fa-image"></i>
              <span>暂无封面</span>
            </div>
          </div>
          <div class="anime-name">{{ item.title }}</div>
          <div class="anime-score" v-if="item.score">
            <i class="fas fa-star"></i> {{ item.score }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const riManList = ref([])
const loading = ref(true)
const error = ref(null)

// ✅ 图片加载失败处理函数
const handleImageError = (event) => {
  console.warn('图片加载失败:', event.target.src)
  // 隐藏图片
  event.target.style.display = 'none'
  
  // 在父容器中添加占位符
  const parent = event.target.parentElement
  if (parent && !parent.querySelector('.no-image-placeholder')) {
    parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    parent.style.display = 'flex'
    parent.style.alignItems = 'center'
    parent.style.justifyContent = 'center'
    
    const placeholder = document.createElement('div')
    placeholder.className = 'no-image-placeholder'
    placeholder.style.textAlign = 'center'
    placeholder.style.color = 'white'
    placeholder.innerHTML = '<i class="fas fa-image" style="font-size: 24px; margin-bottom: 4px;"></i><div style="font-size: 12px;">暂无封面</div>'
    parent.appendChild(placeholder)
  }
}

const fetchAnimeList = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get('http://localhost:3000/api/animes', {
      timeout: 10000,
      params: { page: 1, limit: 100 }
    })
    
    if (response.data && response.data.data) {
      riManList.value = response.data.data
    } else if (Array.isArray(response.data)) {
      riManList.value = response.data
    } else {
      riManList.value = []
    }
    
    console.log('✅ 成功加载动漫列表:', riManList.value.length)
  } catch (err) {
    console.error('❌ 获取动漫列表失败:', err)
    error.value = '获取列表失败，请检查后端服务'
    // 备用默认数据
    riManList.value = [
      { id: 1, title: '平凡职业造就世界最强', score: 7.2 },
      { id: 2, title: '灼眼的夏娜', score: 9.5 },
      { id: 3, title: 'Beatless 没有心跳的少女', score: 8.3 },
      { id: 4, title: 'Love Me「枫与铃」', score: 9.8 },
      { id: 5, title: 'vivy 萤石眼之歌', score: 9.2 },
      { id: 6, title: '神椿市建设中。', score: 3.7 }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnimeList()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft Yahei", sans-serif;
}

.riman-page {
  background-color: #ffffff;
  padding: 25px;
}

.nav-tabs {
  display: flex;
  gap: 45px;
  margin-bottom: 35px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.nav-tabs a {
  color: #333;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
  padding: 8px 4px;
  transition: all 0.2s;
}

.nav-tabs a:hover,
.nav-tabs a.active {
  color: #1E90FF;
  border-bottom: 2px solid #1E90FF;
}

.section-title {
  font-size: 20px;
  margin-bottom: 15px;
  color: #222;
  border-left: 4px solid #1E90FF;
  padding-left: 10px;
}

.tag-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

/* router-link 会渲染成 a 标签，这里保持原有样式 */
.anime-card {
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none; /* 去掉 a 标签下划线 */
  color: inherit;
}

.anime-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  background: #1E90FF;
}

.anime-card:hover .anime-name {
  color: #fff;
}

.anime-card:hover .anime-score {
  color: #ffd700;
}

.anime-cover {
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.anime-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.anime-card:hover .anime-cover img {
  transform: scale(1.05);
}

/* 占位符样式 */
.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.no-image-placeholder i {
  font-size: 32px;
  margin-bottom: 8px;
}

.no-image-placeholder span {
  font-size: 12px;
}

.anime-name {
  padding: 12px 10px 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  min-height: 52px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  color: #333;
  transition: color 0.2s;
}

.anime-score {
  padding: 0 10px 12px;
  font-size: 12px;
  color: #ff9800;
  display: flex;
  align-items: center;
  gap: 4px;
}

.anime-score i {
  font-size: 10px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-top: 20px;
}

.loading-state i,
.error-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-state i {
  color: #1E90FF;
}

.error-state i {
  color: #ff6b6b;
}

.error-state p {
  color: #666;
  margin-bottom: 20px;
}

.retry-btn {
  background: #1E90FF;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #0066cc;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .riman-page {
    padding: 15px;
  }
  .nav-tabs {
    gap: 20px;
  }
  .tag-container {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
  .anime-name {
    font-size: 12px;
    padding: 8px 8px 4px;
    min-height: 44px;
  }
  .anime-score {
    font-size: 10px;
    padding: 0 8px 8px;
  }
  .no-image-placeholder i {
    font-size: 24px;
  }
  .no-image-placeholder span {
    font-size: 10px;
  }
}
</style>