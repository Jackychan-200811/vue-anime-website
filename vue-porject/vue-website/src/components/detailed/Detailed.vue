<template>
  <div>
    <!-- 添加 Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    
    <!-- ==================== 顶部导航栏 ==================== -->
    <div class="navbar">
      <div class="nav-inner">
        <div class="logo">
          <i class="fas fa-tv"></i> AnimePortal
        </div>
        <div class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/news">资讯</router-link>
          <router-link to="/novel">小说</router-link>
          <router-link to="/comic">漫画</router-link>
          <router-link to="/guoman">国漫</router-link>
          <router-link to="/riman" class="active">日漫</router-link>
        </div>
        <div class="search-box">
          <a href="html2.html">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="搜索动漫、声优...">
          </a>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>加载中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="fetchAnimeData" class="btn btn-primary">重试</button>
      </div>
      
      <!-- 详情主体卡片 -->
      <div v-else class="detail-card">
        <!-- 作品头部信息：封面 + 简介数据 -->
        <div class="info-header">
          <div class="cover">
            <div class="cover-img">
              <!-- ✅ 添加 @error 事件处理图片加载失败 -->
              <img 
                v-if="animeData.coverImage" 
                :src="animeData.coverImage" 
                alt="封面"
                @error="handleImageError"
              >
              <div v-else class="no-cover-placeholder">
                <i class="fas fa-image"></i>
                <p>暂无封面</p>
              </div>
            </div>
          </div>
          <div class="info-details">
            <h1 class="anime-title">
              {{ animeData.title }}
              <div class="anime-title-jp">{{ animeData.futitleJp }}</div>
              <div class="anime-title-jp">{{ animeData.titleJp }}</div>
              <div class="anime-title-en">{{ animeData.titleEn }}</div>
            </h1>
            <div class="tags">
              <span class="tag" v-for="(tag, idx) in animeData.tags" :key="idx">{{ tag }}</span>
            </div>
            <div class="score-area">
              <span class="score-number">{{ animeData.score }}</span>
              <span class="score-stars" ref="starContainer"></span>
              <span class="score-people">{{ animeData.reviewCount }}人评</span>
              <span style="margin-left: 8px; font-size: 0.8rem;">
                <a :href="animeData.reviewLink"><i class="far fa-comment-dots"></i> 我要点评</a>
              </span>
            </div>
            <div class="stats-row">
              <div class="stat-item"><i class="fas fa-play-circle"></i> <span class="stat-number">{{ animeData.playCount }}</span> 播放</div>
              <div class="stat-item"><i class="fas fa-users"></i> <span class="stat-number">{{ animeData.followCount }}</span> 系列追番</div>
              <div class="stat-item"><i class="fas fa-comment"></i> <span class="stat-number">{{ animeData.danmakuCount }}</span> 弹幕</div>
            </div>
            <div class="info-meta">
              <span><i class="far fa-calendar-alt"></i> {{ animeData.startDate }}开播</span>
              <span><i class="fas fa-check-circle"></i> {{ animeData.status }}</span>
              <span><i class="fas fa-language"></i> {{ animeData.language }}</span>
            </div>
            <div class="button-group">
              <button class="btn btn-primary"><a :href="animeData.playLink"><i class="fas fa-play"></i> 播放全集</a></button>
              <button class="btn btn-outline"><i class="fas fa-plus-circle"></i> 追番</button>
              <button class="btn btn-outline"><i class="fas fa-share-alt"></i> 分享</button>
            </div>
          </div>
        </div>

        <!-- 简介区域 -->
        <div class="section">
          <div class="section-title">简介</div>
          <div class="synopsis-text">
            {{ animeData.synopsis }}
          </div>
        </div>

        <!-- 角色配音 / CAST 区块 -->
        <div class="section">
          <div class="section-title">角色配音</div>
          <div class="cast-grid">
            <div class="cast-card" v-for="(cast, idx) in animeData.castList" :key="idx">
              <div class="cast-avatar">{{ cast.avatarText }}</div>
              <div class="cast-info">
                <h4>{{ cast.character }}</h4>
                <p>{{ cast.voiceActor }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- STAFF 制作人员 区块 -->
        <div class="section">
          <div class="section-title">STAFF</div>
          <div class="staff-grid">
            <div class="staff-item" v-for="(staff, idx) in animeData.staffList" :key="idx">
              <span class="staff-role">{{ staff.role }}</span>
              <span class="staff-name">{{ staff.name }}</span>
            </div>
          </div>
        </div>

        <!-- 剧集列表 -->
        <div class="section">
          <div class="section-header">
            <div class="section-title">剧集</div>
            <a :href="animeData.episodeMoreLink" class="section-more-link">详情-></a>
          </div>
          <div class="episode-list">
            <div class="episode-card" v-for="(ep, idx) in animeData.episodes" :key="idx">
              <i class="fas fa-play-circle"></i> {{ ep }}
            </div>
          </div>
        </div>

        <!-- 用户短评示例 -->
        <div class="section">
          <div class="section-header">
            <div class="section-title">
              精选短评 
              <span style="font-size: 0.8rem; margin-left: 12px; color: #00bcd4;">共{{ animeData.reviews?.length || 0 }}条短评</span>
            </div>
            <a href="#" class="section-more-link">更多-></a>
          </div>
          <div class="reviews-preview">
            <div class="review-item" v-for="(review, idx) in animeData.reviews" :key="idx">
              <div class="review-header">
                <div class="reviewer-avatar">{{ review.avatarText }}</div>
                <span class="reviewer-name">{{ review.reviewerName }}</span>
                <div class="review-score">
                  <span class="review-score-number">{{ review.score }}</span>
                  <span class="review-score-stars" :ref="el => setReviewStarRef(el, idx)"></span>
                </div>
              </div>
              <div class="review-content">{{ review.content }}</div>
            </div>
          </div>
        </div>
        
        <!-- 底部信息 -->
        <div class="footer">
          <p>动漫门户网站 · 详情页模板 | 仅用于设计演示</p>
          <p style="margin-top: 8px;">© AnimePortal 练习项目 | 建议使用宽屏浏览以获得最佳体验</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

// 修复后的星星渲染函数
function renderStars(score, container) {
  if (!container) return;
  
  // 清空容器
  container.innerHTML = '';
  
  // 将10分制转换为5星制
  let starValue = score / 2;
  let fullStars = Math.floor(starValue);
  let hasHalfStar = (starValue - fullStars) >= 0.5;
  let emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  // 确保数值有效
  fullStars = Math.min(fullStars, 5);
  if (fullStars === 5) {
    hasHalfStar = false;
    emptyStars = 0;
  }
  
  // 生成星星HTML
  let starsHtml = '';
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<i class="fas fa-star"></i>';
  }
  if (hasHalfStar) {
    starsHtml += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<i class="far fa-star"></i>';
  }
  
  container.innerHTML = starsHtml;
}

export default {
  name: 'AnimeDetail',
  data() {
    return {
      loading: true,
      error: null,
      animeData: {},
      currentId: null,
      animeType: 'riman' // 新增：动漫类型 'riman' 或 'guoman'
    };
  },
  
  mounted() {
    // 初始化获取数据
    const animeId = parseInt(this.$route.params.id) || 1;
    // 从 query 参数获取类型，默认为 riman
    const type = this.$route.query.type || 'riman';
    this.animeType = type;
    this.animeType = type;
    this.fetchAnimeData(animeId, type);
  },
  
  // 监听路由参数变化
  watch: {
    '$route.params.id': {
      handler(newId) {
        if (newId && parseInt(newId) !== this.currentId) {
          const type = this.$route.query.type || 'riman';
          this.animeType = type;
          this.fetchAnimeData(parseInt(newId), type);
        }
      },
      immediate: true
    },
    '$route.query.type': {
      handler(newType) {
        if (newType && newType !== this.animeType) {
          this.animeType = newType;
          const animeId = parseInt(this.$route.params.id) || 1;
          this.fetchAnimeData(animeId, newType);
        }
      }
    }
  },
  
  methods: {
    async fetchAnimeData(id, type = 'riman') {
      this.loading = true;
      this.error = null;
      this.currentId = id;
      this.animeType = type;
      
      // 根据类型选择 API 端点
      const apiUrl = type === 'guoman' 
        ? `http://localhost:3000/api/guoman/${id}`
        : `http://localhost:3000/api/animes/${id}`;
      
      console.log(`📡 请求数据: 类型=${type}, ID=${id}, URL=${apiUrl}`);
      
      try {
        const response = await axios.get(apiUrl, {
          timeout: 10000
        });
        
        const data = response.data;
        
        // 处理 JSON 字段
        if (data.tags && typeof data.tags === 'string') {
          try {
            data.tags = JSON.parse(data.tags);
          } catch(e) {
            data.tags = [];
          }
        }
        if (data.castList && typeof data.castList === 'string') {
          try {
            data.castList = JSON.parse(data.castList);
          } catch(e) {
            data.castList = [];
          }
        }
        if (data.staffList && typeof data.staffList === 'string') {
          try {
            data.staffList = JSON.parse(data.staffList);
          } catch(e) {
            data.staffList = [];
          }
        }
        if (data.episodes && typeof data.episodes === 'string') {
          try {
            data.episodes = JSON.parse(data.episodes);
          } catch(e) {
            data.episodes = [];
          }
        }
        if (data.reviews && typeof data.reviews === 'string') {
          try {
            data.reviews = JSON.parse(data.reviews);
          } catch(e) {
            data.reviews = [];
          }
        }
        
        // 确保数组字段有默认值
        if (!data.tags) data.tags = [];
        if (!data.castList) data.castList = [];
        if (!data.staffList) data.staffList = [];
        if (!data.episodes) data.episodes = [];
        if (!data.reviews) data.reviews = [];
        
        this.animeData = data;
        
        await this.$nextTick();
        this.renderAllStars();
        
      } catch (err) {
        console.error('❌ 获取失败:', err);
        
        if (err.response?.status === 404) {
          this.error = `未找到${type === 'guoman' ? '国漫' : '日漫'}ID=${id}的数据`;
        } else if (err.response?.status === 500) {
          this.error = '服务器内部错误，请稍后重试';
        } else if (err.code === 'ECONNABORTED') {
          this.error = '请求超时，请检查网络连接';
        } else if (err.request) {
          this.error = '无法连接到后端服务器，请确保后端服务已启动 (http://localhost:3000)';
        } else {
          this.error = `请求错误: ${err.message}`;
        }
        
        this.loadDefaultData();
        
      } finally {
        this.loading = false;
      }
    },
    
    renderAllStars() {
      const starContainer = this.$refs.starContainer;
      if (starContainer && this.animeData.score) {
        renderStars(this.animeData.score, starContainer);
      }
      
      // 渲染短评的星星
      if (this.animeData.reviews && this.animeData.reviews.length > 0) {
        this.animeData.reviews.forEach((review, idx) => {
          const starElements = this.$refs[`reviewStar_${idx}`];
          if (starElements && starElements[0] && review.score) {
            renderStars(review.score, starElements[0]);
          }
        });
      }
    },
    
    setReviewStarRef(el, idx) {
      if (el && this.animeData.reviews && this.animeData.reviews[idx]) {
        renderStars(this.animeData.reviews[idx].score, el);
      }
    },
    
    // ✅ 图片加载失败处理
    handleImageError(event) {
      console.warn('图片加载失败:', event.target.src);
      // 隐藏图片
      event.target.style.display = 'none';
      
      // 在父容器中添加占位符
      const parent = event.target.parentElement;
      if (parent && !parent.querySelector('.no-cover-placeholder')) {
        parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        parent.style.display = 'flex';
        parent.style.alignItems = 'center';
        parent.style.justifyContent = 'center';
        
        const placeholder = document.createElement('div');
        placeholder.className = 'no-cover-placeholder';
        placeholder.style.textAlign = 'center';
        placeholder.style.color = 'white';
        placeholder.innerHTML = '<i class="fas fa-image" style="font-size: 32px; margin-bottom: 8px;"></i><p style="margin: 0;">暂无封面</p>';
        parent.appendChild(placeholder);
      }
    },
    
    loadDefaultData() {
      console.log('📦 使用本地默认数据 (ID:', this.currentId, ', 类型:', this.animeType, ')');
      // 根据类型设置不同的默认数据
      if (this.animeType === 'guoman') {
        this.animeData = {
          id: this.currentId,
          title: '示例国漫',
          futitleJp: '',
          titleJp: '',
          titleEn: '',
          tags: ['热血', '冒险'],
          score: 8.5,
          reviewCount: 1234,
          playCount: '100万',
          followCount: '50万',
          danmakuCount: '10万',
          startDate: '2024',
          status: '连载中',
          language: '国语',
          synopsis: '这是一部精彩的国漫作品...',
          castList: [],
          staffList: [],
          episodes: ['第1集', '第2集', '第3集'],
          reviews: []
        };
      } else {
        this.animeData = {
          id: this.currentId,
          title: '示例日漫',
          futitleJp: '',
          titleJp: '',
          titleEn: '',
          tags: ['热血', '冒险'],
          score: 8.5,
          reviewCount: 1234,
          playCount: '100万',
          followCount: '50万',
          danmakuCount: '10万',
          startDate: '2024',
          status: '连载中',
          language: '日语',
          synopsis: '这是一部精彩的日漫作品...',
          castList: [],
          staffList: [],
          episodes: ['第1集', '第2集', '第3集'],
          reviews: []
        };
      }
    }
  }
};
</script>

<style scoped>
/* ==================== 动漫详情页样式表 ==================== */
/* 全局重置与基础风格 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background-color: #f5f7fa;
    font-family: -apple-system, BlinkMacFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #1e2a3a;
    line-height: 1.5;
}

/* 主容器 */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 16px 40px;
}

/* 加载状态 */
.loading-state,
.error-state {
    text-align: center;
    padding: 80px 20px;
    background: white;
    border-radius: 24px;
}
.loading-state i,
.error-state i {
    font-size: 48px;
    margin-bottom: 16px;
}
.loading-state i {
    color: #00bcd4;
}
.error-state i {
    color: #ff6b6b;
}
.error-state p {
    color: #666;
    margin-bottom: 20px;
}

/* ==================== 顶部导航栏 ==================== */
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
}
.search-box a {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: inherit;
}

/* ==================== 主要内容卡片 ==================== */
.detail-card {
    background-color: #ffffff;
    border-radius: 24px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 32px;
}

/* 头部信息区 */
.info-header {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
    padding: 28px 32px 20px 32px;
    border-bottom: 1px solid #edf2f7;
}
.cover {
    flex-shrink: 0;
    height: 350px;
    width: 220px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    background: linear-gradient(145deg, #00bcd4, #00bcd4);
}
.cover-img {
    width: 100%;
    aspect-ratio: 220 / 310;
    display: block;
    position: relative;
}
.cover-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.no-cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}
.no-cover-placeholder i {
    font-size: 48px;
    margin-bottom: 12px;
}
.no-cover-placeholder p {
    margin: 0;
    font-size: 14px;
}
.info-details {
    flex: 1;
    min-width: 240px;
}
.anime-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 12px;
    line-height: 1.3;
    color: #0b1c26;
}
.anime-title-jp {
    font-size: 1.2rem;
    font-weight: 500;
    color: #6c7a89;
    margin-top: 6px;
    letter-spacing: 1px;
}
.anime-title-en {
    font-size: 0.9rem;
    font-weight: normal;
    color: #5f7f9e;
    margin-top: 4px;
}
.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}
.tag {
    background: #f0f2f5;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    color: #4a627a;
}
.score-area {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 18px;
    border-bottom: 1px dashed #e9edf2;
    padding-bottom: 12px;
}
.score-number {
    font-size: 2.2rem;
    font-weight: 800;
    color: #ff9900;
}
.score-stars {
    color: #ffb83b;
    letter-spacing: 2px;
    font-size: 1rem;
}
.score-people {
    color: #6b7c93;
    font-size: 0.85rem;
}
.stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
    margin: 16px 0 18px;
    background: #f8fafc;
    padding: 12px 16px;
    border-radius: 20px;
}
.stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}
.stat-item i {
    width: 24px;
    color: #00bcd4;
    font-size: 1.1rem;
}
.stat-number {
    font-weight: 700;
    color: #1e2f3e;
}
.info-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin: 12px 0 16px;
    font-size: 0.9rem;
    color: #3e5a6f;
}
.info-meta span {
    background: #f2f4f8;
    padding: 4px 10px;
    border-radius: 30px;
}
.button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 20px;
}
.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 40px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: none;
}
.btn-primary {
    background: #00bcd4;
    color: white;
    box-shadow: 0 2px 6px rgba(0, 188, 212, 0.3);
}
.btn-primary:hover {
    background: #0097a7;
    transform: translateY(-2px);
}
.btn-primary a {
    color: white;
    text-decoration: none;
}
.btn-outline {
    border: 1px solid #cbd5e1;
    background: white;
    color: #2c3e4e;
}
.btn-outline:hover {
    border-color: #00bcd4;
    color: #00bcd4;
    background: #e0f7fa;
}

/* ==================== 内容区块通用样式 ==================== */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.section-header .section-title {
    margin-bottom: 0;
}
.section-more-link {
    font-size: 0.85rem;
    color: #00bcd4;
    text-decoration: none;
    transition: opacity 0.2s;
}
.section-more-link:hover {
    text-decoration: none;
    opacity: 0.8;
    color: #00bcd4;
}
a,
a:link,
a:visited,
a:hover,
a:active {
    text-decoration: none;
    color: inherit;
}
.section {
    padding: 24px 32px;
    border-bottom: 1px solid #eff3f8;
}
.section:last-child {
    border-bottom: none;
}
.section-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 20px;
    position: relative;
    display: inline-block;
    padding-left: 12px;
    border-left: 5px solid #00bcd4;
}
.synopsis-text {
    font-size: 1rem;
    line-height: 1.65;
    color: #2c3f4f;
    background: #fafcff;
    padding: 12px 16px;
    border-radius: 20px;
    margin-top: 8px;
}

/* 角色网格 */
.cast-grid, .staff-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 12px;
}
.cast-card {
    background: #f9fbfd;
    border-radius: 20px;
    padding: 12px 16px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #eef2f8;
}
.cast-avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #7ec8ff, #09F);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 1.1rem;
    flex-shrink: 0;
}
.cast-info h4 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 4px;
}
.cast-info p {
    font-size: 0.8rem;
    color: #6b7f93;
}
.staff-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
.staff-item {
    background: #ffffff;
    padding: 8px 12px;
    border-radius: 16px;
    border: 1px solid #eef2f8;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}
.staff-role {
    font-weight: 700;
    color: #2c3e4e;
}
.staff-name {
    color: #00bcd4;
    font-weight: 500;
}

/* 短评示例 */
.reviews-preview {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 16px;
}
.review-item {
    background: #f8fafd;
    padding: 16px 20px;
    border-radius: 24px;
    border-left: 4px solid #00bcd4;
}
.review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}
.reviewer-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7ec8ff, #09F);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    flex-shrink: 0;
}
.reviewer-name {
    font-weight: 600;
}
.review-score {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    margin-left: auto;
}
.review-score-number {
    font-size: 1rem;
    font-weight: 60;
    color: #ff9900;
}
.review-score-stars {
    color: #ffb83b;
    font-size: 0.8rem;
    letter-spacing: 1px;
}
.review-content {
    color: #2f4858;
    line-height: 1.5;
}

/* 剧集列表 */
.episode-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 15px;
}
.episode-card {
    background: #f2f5f9;
    border-radius: 28px;
    padding: 10px 24px;
    font-weight: 50;
    transition: 0.2s;
    border: 1px solid #e2e8f0;
}
.episode-card:hover {
    background: #00bcd4;
    color: white;
    border-color: #00bcd4;
}

/* 底部版权 */
.footer {
    text-align: center;
    margin-top: 40px;
    padding: 24px;
    color: #7d8e9f;
    font-size: 0.8rem;
    border-top: 1px solid #e9edf2;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
    .info-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 24px 20px;
    }
    .cover {
        width: 160px;
    }
    .stats-row {
        justify-content: center;
    }
    .button-group {
        justify-content: center;
    }
    .section {
        padding: 20px 20px;
    }
    .section-title {
        font-size: 1.3rem;
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
</style>