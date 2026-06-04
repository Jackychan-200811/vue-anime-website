<template>
  <div class="header-wrapper">
    <div class="fullscreen-bg"></div>

    <header class="island-header-wrapper" :class="{ 'is-island-active': isExpanded || isDragExpanded, 'is-drag-active': isDragExpanded }">
      <nav class="dynamic-island" :class="{ 'is-island-expanded': isExpanded || isDragExpanded, 'is-drag-expanded': isDragExpanded }">
        
        <!-- logo 和导航链接 - 只在拖拽未展开且搜索结果未展开时显示 -->
        <div v-if="!isDragExpanded && !isExpanded" class="logo-zone">
          <span class="logo-text">ANIME</span>
        </div>
        
        <div v-if="!isDragExpanded && !isExpanded" class="nav-links-center">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/guoman-home" class="nav-item">国漫</router-link>
          <router-link to="/riman-home" class="nav-item">日漫</router-link>
        </div>

        <!-- 搜索组件 - 始终显示（拖拽模式下也会显示，但会被拖拽内容覆盖） -->
        <!-- 搜索结果展开时，搜索组件内部会显示结果面板和关闭按钮 -->
        <SearchModule 
          ref="searchModuleRef"
          :disabled="isDragExpanded"
          @expand="onSearchExpand"
          @collapse="onSearchCollapse"
        />

        <!-- 拖拽详情组件（包含小白条）— 仅国漫/日漫首页 -->
        <DragDetailModule
          v-if="showDragModule"
          ref="dragModuleRef"
          v-model:animeType="currentAnimeType"
          v-model:animeId="currentAnimeId"
          :disabled="isSearchActive"
          @expand="onDragExpand"
          @collapse="onDragCollapse"
        />
      </nav>
    </header>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import SearchModule from './SearchModule.vue'
import DragDetailModule from './DragDetailModule.vue'

const route = useRoute()

const searchModuleRef = ref(null)
const dragModuleRef = ref(null)

const isExpanded = ref(false)        // 搜索结果展开状态
const isDragExpanded = ref(false)    // 拖拽详情展开状态
const isSearchActive = ref(false)    // 搜索是否激活（用于禁用拖拽）

const currentAnimeType = ref('riman')
const currentAnimeId = ref(1)

// 小白条仅在国漫/日漫首页显示，主页隐藏
const showDragModule = computed(() => {
  return route.path === '/guoman-home' || route.path === '/riman-home'
})

const updateAnimeByRoute = () => {
  const path = route.path
  if (path === '/guoman-home') {
    currentAnimeType.value = 'guoman'
  } else if (path === '/riman-home') {
    currentAnimeType.value = 'riman'
  }
}

const onSearchExpand = () => {
  isSearchActive.value = true
  isExpanded.value = true
  // 如果拖拽已展开，强制收起
  if (dragModuleRef.value?.isDragExpanded) {
    dragModuleRef.value.collapseDrag()
  }
}

const onSearchCollapse = () => {
  isSearchActive.value = false
  isExpanded.value = false
}

const onDragExpand = () => {
  isDragExpanded.value = true
  // 如果搜索结果已展开，强制关闭
  if (searchModuleRef.value?.isSearchActive()) {
    searchModuleRef.value.closeSearch()
  }
}

const onDragCollapse = () => {
  isDragExpanded.value = false
}

watch(() => route.path, () => {
  updateAnimeByRoute()
  if (isDragExpanded.value) {
    dragModuleRef.value?.collapseDrag()
  }
  if (isExpanded.value) {
    searchModuleRef.value?.closeSearch()
  }
}, { immediate: true })
</script>

<style scoped>
/* ========== NavBar 专属样式 ========== */
.fullscreen-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/2.webp');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  z-index: -1;
}

.header-wrapper {
  width: 100%;
  min-width: 1200px;
  max-width: 1920px;
  margin: 0 auto;
  position: relative;
}

.island-header-wrapper {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: calc(100% - 240px);
  max-width: 1680px;
  min-width: 1020px;
  transition: width .4s cubic-bezier(.16,1,.3,1);
}

.island-header-wrapper.is-island-active {
  z-index: 999;
}

/* 拖拽展开时：等距拉伸，两侧和底边等宽 */
.island-header-wrapper.is-drag-active {
  width: calc(100% - 120px);  /* 60px 每侧 */
  transition: width .45s cubic-bezier(.16,1,.3,1);
}

.dynamic-island {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  width: 100%;
  padding: 0 28px;
  border-radius: 27px;
  background: rgba(255,255,255,.15);
  backdrop-filter: blur(6px) contrast(130%) saturate(140%);
  -webkit-backdrop-filter: blur(6px) contrast(130%) saturate(140%);
  box-shadow: inset 0 1px 2px rgba(255,255,255,.6), inset 0 -1px 2px rgba(0,0,0,.02), 0 8px 32px rgba(15,23,42,.08), 0 2px 6px rgba(15,23,42,.04);
  transition: height .55s cubic-bezier(.16,1,.3,1), border-radius .45s cubic-bezier(.16,1,.3,1), box-shadow .4s;
  overflow: visible;
}

.dynamic-island.is-island-expanded {
  height: 520px;
  border-radius: 32px;
  background: rgba(255,255,255,.3);
  backdrop-filter: blur(16px) contrast(120%) saturate(130%);
  -webkit-backdrop-filter: blur(16px) contrast(120%) saturate(130%);
  flex-direction: column;
  align-items: stretch;
  padding: 24px;
  overflow: hidden;
}

.dynamic-island.is-drag-expanded {
  height: calc(100vh - 84px);  /* top(24px) + bottom(60px) = 84px，底边与两侧(60px)等宽 */
  background: rgba(255,255,255,.22);
  backdrop-filter: blur(24px) contrast(110%) saturate(120%);
  -webkit-backdrop-filter: blur(24px) contrast(110%) saturate(120%);
  transition: height 0.3s ease;
}

.logo-zone {
  flex-shrink: 0;
  z-index: 10;
}

.logo-text {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: 1.5px;
}

.nav-links-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: clamp(14px, 2vw, 28px);
  z-index: 5;
}

.nav-item {
  color: #334155;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all .25s;
  white-space: nowrap;
}

.nav-item:hover {
  color: #00b4d8;
  transform: translateY(-1px);
}
</style>