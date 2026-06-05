<template>
  <div class="riman-home-page" ref="containerRef">
    <div class="placeholder-content">
      <div class="center-text">
        日漫
        <div class="hint">▲ 向上滚动进入国漫 ▲<br>▼ 向下滚动返回首页 ▼<br>↓ 下拉顶部白条浏览动漫列表 ↓</div>
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

const currentRouteName = route.name?.toLowerCase() || 'riman-home'
const { handleWheel } = usePageWheel(currentRouteName)

onMounted(() => {
  window.addEventListener('wheel', handleWheel, { passive: false })
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleWheel)
})
</script>

<style scoped>
.riman-home-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #2d1b2e 0%, #5c3d5e 40%, #3d1e3a 100%);
  position: relative;
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
