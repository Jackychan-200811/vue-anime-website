<template>
  <div class="guoman-home-page" ref="containerRef">
    <div class="placeholder-content">
      <div class="center-text">
        国漫
        <div class="hint">▲ 向上滚动进入首页 ▲<br>▼ 向下滚动进入日漫 ▼<br>↓ 下拉顶部白条浏览动漫列表 ↓</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePageWheel } from '@/composables/usePageWheel'

const route = useRoute()
const containerRef = ref(null)

const currentRouteName = route.name?.toLowerCase() || 'guoman-home'
const { handleWheel } = usePageWheel(currentRouteName)

onMounted(() => {
  window.addEventListener('wheel', handleWheel, { passive: false })
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleWheel)
})
</script>

<style scoped>
.guoman-home-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #3d0f12 0%, #7a1f24 40%, #4a1018 100%);
}

.placeholder-content {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-text {
  text-align: center;
  color: white;
  font-size: 48px;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.hint {
  font-size: 16px;
  font-weight: normal;
  margin-top: 20px;
  opacity: 0.7;
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}
</style>
