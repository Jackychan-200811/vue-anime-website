<template>
  <div class="home-page" ref="containerRef">
    <div class="placeholder-content">
      <div class="center-text">
        首页
        <div class="hint">▼ 向下滚动进入国漫 ▼</div>
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
  background-image: url('/2.webp');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
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