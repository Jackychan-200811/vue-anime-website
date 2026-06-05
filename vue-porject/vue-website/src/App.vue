<template>
  <div id="app">
    <div class="navbar-layer">
      <NavBar ref="navBarRef" />
    </div>
    <div class="page-layer">
      <router-view v-slot="{ Component, route }">
        <transition @enter="onEnter" @leave="onLeave" :css="false">
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

const navBarRef = ref(null)
const { onEnter, onLeave } = usePageTransition()

const handleAnimeSelected = (e) => {
  const { id, type } = e.detail
  if (navBarRef.value?.setCurrentAnime) {
    navBarRef.value.setCurrentAnime(id, type)
  }
}

onMounted(() => window.addEventListener('anime-selected', handleAnimeSelected))
onBeforeUnmount(() => window.removeEventListener('anime-selected', handleAnimeSelected))
</script>

<style>
* { margin:0; padding:0; box-sizing:border-box }
html, body { width:100%; height:100%; overflow:hidden }
#app { width:100%; height:100%; position:relative; overflow:hidden }
.navbar-layer { position:fixed; top:0; left:0; width:100%; z-index:1000; pointer-events:auto }
.page-layer { width:100%; height:100%; position:relative; overflow:hidden }

/* 页面元素：绝对定位 */
.page-layer > div {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 1;
}
</style>
