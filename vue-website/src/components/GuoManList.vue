<!-- src/components/GuoManList.vue -->
<template>
    <div class="guoman-list">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="fetchList" class="retry-btn">重试</button>
      </div>
      
      <div v-else class="tag-container">
        <div
          v-for="item in guoManList"
          :key="item.id"
          class="anime-card"
          @click="goToDetail(item)"
        >
          <div class="anime-cover">
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
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  
  const router = useRouter()
  const guoManList = ref([])
  const loading = ref(true)
  const error = ref(null)
  
  const handleImageError = (event) => {
    event.target.style.display = 'none'
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
  
  const fetchList = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get('http://localhost:3000/api/guoman', {
        timeout: 10000,
        params: { page: 1, limit: 100 }
      })
      
      if (response.data && response.data.data) {
        guoManList.value = response.data.data
      } else if (Array.isArray(response.data)) {
        guoManList.value = response.data
      } else {
        guoManList.value = []
      }
    } catch (err) {
      console.error('获取国漫列表失败:', err)
      error.value = '获取列表失败，请检查后端服务'
      guoManList.value = [
        { id: 1, title: '斗破苍穹', score: 8.5, coverImage: null },
        { id: 2, title: '斗罗大陆', score: 8.8, coverImage: null },
        { id: 3, title: '完美世界', score: 8.3, coverImage: null },
        { id: 4, title: '凡人修仙传', score: 9.2, coverImage: null },
        { id: 5, title: '一念永恒', score: 8.7, coverImage: null },
        { id: 6, title: '狐妖小红娘', score: 9.0, coverImage: null }
      ]
    } finally {
      loading.value = false
    }
  }
  
  const goToDetail = (item) => {
    router.push(`/detail/guoman/${item.id}`)
  }
  
  onMounted(() => {
    fetchList()
  })
  </script>
  
  <style scoped>
  .guoman-list {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 20px 24px;
    box-sizing: border-box;
  }
  
  .guoman-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .guoman-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  .guoman-list::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  .tag-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
  }
  
  .anime-card {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
  }
  
  .anime-card:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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
    color: #fff;
  }
  
  .anime-score {
    padding: 0 10px 12px;
    font-size: 12px;
    color: #ffd700;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .loading-state,
  .error-state {
    text-align: center;
    padding: 60px 20px;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .loading-state i,
  .error-state i {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .retry-btn {
    background: rgba(0, 180, 216, 0.2);
    color: #00b4d8;
    border: 1px solid rgba(0, 180, 216, 0.3);
    padding: 8px 24px;
    border-radius: 20px;
    cursor: pointer;
    margin-top: 16px;
    transition: all 0.2s;
  }
  
  .retry-btn:hover {
    background: #00b4d8;
    color: #fff;
  }
  
  @media (max-width: 768px) {
    .tag-container {
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
    }
    .guoman-list {
      padding: 16px;
    }
  }
  </style>