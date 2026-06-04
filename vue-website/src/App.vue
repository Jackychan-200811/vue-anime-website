<template>
  <div id="app">
    <div class="navbar-layer">
      <NavBar ref="navBarRef" />
    </div>
    <div class="page-layer">
      <router-view v-slot="{ Component, route }">
        <transition
          :enter-active-class="'page-slide-enter ' + dir"
          :leave-active-class="'page-slide-leave ' + dir"
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const navBarRef = ref(null)

const handleAnimeSelected = (e) => {
  const { id, type } = e.detail
  if (navBarRef.value?.setCurrentAnime) {
    navBarRef.value.setCurrentAnime(id, type)
  }
}

// 方向跟踪
const dir = ref('forward')

const getIdx = (p) => {
  if (p === '/') return 0
  if (p === '/guoman-home') return 1
  if (p === '/riman-home') return 2
  return -1
}

const removeGuard = router.beforeEach((to, from) => {
  const ti = getIdx(to.path), fi = getIdx(from.path)
  if (ti >= 0 && fi >= 0) dir.value = ti >= fi ? 'forward' : 'backward'
})

onMounted(() => window.addEventListener('anime-selected', handleAnimeSelected))
onBeforeUnmount(() => {
  window.removeEventListener('anime-selected', handleAnimeSelected)
  removeGuard()
})
</script>

<style>
* { margin:0; padding:0; box-sizing:border-box }
html, body { width:100%; height:100% }
#app { width:100%; height:100%; position:relative }
.navbar-layer { position:fixed; top:0; left:0; width:100%; z-index:1000; pointer-events:auto }
.page-layer { width:100%; height:100%; position:relative }

/* 页面元素：绝对定位，不改变尺寸 */
.page-layer > div {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}

/* ===== 前进 forward：新页从右滑入，旧页向左滑出，切线从右扫左 ===== */
.page-slide-enter.forward {
  animation: a-in-right 0.5s cubic-bezier(0.22,0.61,0.36,1) both;
  z-index: 2;
}
.page-slide-enter.forward::after {
  content: '';
  position: fixed; top:0; left:0; width:3px; height:100%; z-index:999; pointer-events:none;
  background: linear-gradient(to right, transparent, rgba(255,255,255,.7) 40%, #00c8dc 50%, rgba(255,255,255,.7) 60%, transparent);
  box-shadow: 0 0 20px rgba(255,255,255,.9), 0 0 60px rgba(0,200,220,.5);
  animation: a-wipe-l 0.5s cubic-bezier(0.22,0.61,0.36,1) both;
}
.page-slide-leave.forward {
  animation: a-out-left 0.5s cubic-bezier(0.55,0.06,0.68,0.19) both;
  z-index: 1;
}

/* ===== 后退 backward：新页从左滑入，旧页向右滑出，切线从左扫右 ===== */
.page-slide-enter.backward {
  animation: a-in-left 0.5s cubic-bezier(0.22,0.61,0.36,1) both;
  z-index: 2;
}
.page-slide-enter.backward::after {
  content: '';
  position: fixed; top:0; left:0; width:3px; height:100%; z-index:999; pointer-events:none;
  background: linear-gradient(to right, transparent, rgba(255,255,255,.7) 40%, #00c8dc 50%, rgba(255,255,255,.7) 60%, transparent);
  box-shadow: 0 0 20px rgba(255,255,255,.9), 0 0 60px rgba(0,200,220,.5);
  animation: a-wipe-r 0.5s cubic-bezier(0.22,0.61,0.36,1) both;
}
.page-slide-leave.backward {
  animation: a-out-right 0.5s cubic-bezier(0.55,0.06,0.68,0.19) both;
  z-index: 1;
}

/* ===== 关键帧 ===== */
@keyframes a-in-right  { from { transform: translateX(100%) } to { transform: translateX(0) } }
@keyframes a-out-left  { from { transform: translateX(0) }    to { transform: translateX(-100%) } }
@keyframes a-in-left   { from { transform: translateX(-100%) } to { transform: translateX(0) } }
@keyframes a-out-right { from { transform: translateX(0) }    to { transform: translateX(100%) } }
@keyframes a-wipe-l    { from { left:100%; opacity:0 } 12% { opacity:1 } 88% { opacity:1 } to { left:0%; opacity:0 } }
@keyframes a-wipe-r    { from { left:0%; opacity:0 }   12% { opacity:1 } 88% { opacity:1 } to { left:100%; opacity:0 } }
</style>
