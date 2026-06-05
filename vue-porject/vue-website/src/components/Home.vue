<template>
  <div class="home-page" ref="containerRef">
    <div class="bg-layer" :style="{ backgroundImage: 'url(' + bgImage + ')' }"></div>
    <div class="placeholder-content">
      <div class="center-text">
        零度漫游
        <div class="hint">▲ 向上滚动进入日漫 ▲<br>▼ 向下滚动进入国漫 ▼</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePageWheel } from '@/composables/usePageWheel'
import { useRandomBg } from '@/composables/useRandomBg'

const route = useRoute()
const containerRef = ref(null)

// 共享背景图片池，每次进入页面随机抽取且不会连续重复
const bgImage = useRandomBg()

const currentRouteName = route.name?.toLowerCase() || 'home'
const { handleWheel } = usePageWheel(currentRouteName)

onMounted(() => {
  window.addEventListener('wheel', handleWheel, { passive: false })
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleWheel)
})
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #d0e0f0 0%, #b8d0e8 50%, #c8ddf0 100%);
}

.bg-layer {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0.4; /* ★ 透明度在这里改：0=完全透明 1=完全不透明 */
  z-index: 0;
  pointer-events: none;
}

.placeholder-content {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-text {
  text-align: center;
  color: white;
  font-size: 70px;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.hint {
  font-size: 12px;
  font-weight: normal;
  margin-top: 5px;
  opacity: 0.7;
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}
</style>