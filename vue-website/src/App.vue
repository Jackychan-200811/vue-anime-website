<template>
  <div id="app">
    <!-- 导航栏层 -->
    <div class="navbar-layer">
      <NavBar ref="navBarRef" />
    </div>
    
    <!-- 页面内容层 -->
    <div class="page-layer">
      <router-view v-slot="{ Component, route }">
        <transition
          name="page-slide"
          @enter="onEnter"
          @leave="onLeave"
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { usePageTransition } from '@/composables/usePageTransition'

const { onEnter, onLeave } = usePageTransition()

// 使用 ref 声明导航栏引用
const navBarRef = ref(null)

// 监听卡片点击事件
const handleAnimeSelected = (e) => {
  const { id, type } = e.detail
  if (navBarRef.value && navBarRef.value.setCurrentAnime) {
    navBarRef.value.setCurrentAnime(id, type)
  }
}

onMounted(() => {
  window.addEventListener('anime-selected', handleAnimeSelected)
})

onBeforeUnmount(() => {
  window.removeEventListener('anime-selected', handleAnimeSelected)
})
</script>

<style>
/* 你的原有样式保持不变 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.navbar-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  pointer-events: auto;
}

.page-layer {
  position: relative;
  width: 100%;
  min-height: 100vh;
  z-index: 1;
}

.page-layer > div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  will-change: transform, opacity, clip-path;
}

/* ===== 页面切换过渡动画 + 切线 ===== */
/* 前进：新页从右侧滑入，切线从右扫到左 */
.page-slide-enter-active[data-direction="forward"] {
  animation: slideInFromRight 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  z-index: 20;
}
.page-slide-enter-active[data-direction="forward"]::after {
  content: '';
  position: fixed; top: 0; height: 100vh; width: 6px; z-index: 998; pointer-events: none;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.3) 80%, transparent);
  box-shadow: 0 0 20px rgba(255,255,255,0.6), 0 0 60px rgba(0,180,216,0.4);
  animation: wipeFromRight 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
.page-slide-leave-active[data-direction="forward"] {
  animation: fadeOutToLeft 0.5s cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards;
  z-index: 10;
}

/* 后退：新页从左侧滑入，切线从左扫到右 */
.page-slide-enter-active[data-direction="backward"] {
  animation: fadeInFromLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  z-index: 20;
}
.page-slide-enter-active[data-direction="backward"]::after {
  content: '';
  position: fixed; top: 0; height: 100vh; width: 6px; z-index: 998; pointer-events: none;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.3) 80%, transparent);
  box-shadow: 0 0 20px rgba(255,255,255,0.6), 0 0 60px rgba(0,180,216,0.4);
  animation: wipeFromLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
.page-slide-leave-active[data-direction="backward"] {
  animation: slideOutToRight 0.65s cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards;
  z-index: 10;
}

@keyframes slideInFromRight {
  from { clip-path: inset(0 0 0 100%); opacity: 0.6; }
  to   { clip-path: inset(0 0 0 0%);   opacity: 1; }
}
@keyframes fadeOutToLeft {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0.4; transform: translateX(-8%); }
}
@keyframes fadeInFromLeft {
  from { clip-path: inset(0 100% 0 0); opacity: 0.6; }
  to   { clip-path: inset(0 0 0 0%);   opacity: 1; }
}
@keyframes slideOutToRight {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0.4; transform: translateX(8%); }
}
@keyframes wipeFromRight {
  from { left: 100%; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  to   { left: 0%;   opacity: 0; }
}
@keyframes wipeFromLeft {
  from { left: 0%;   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  to   { left: 100%; opacity: 0; }
}
</style>