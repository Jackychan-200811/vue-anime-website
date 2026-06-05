<template>
    <div class="drag-detail-module">
      <!-- 小白条：始终在灵动岛外侧底部，折叠时下拖展开，展开时上拖缩回 -->
      <div 
        class="drag-handle"
        :class="{ 'is-dragging': isDragging, 'is-expanded': isDragExpanded }"
        @mousedown="onDragStart"
        @touchstart="onDragStart"
      >
        <div class="handle-bar"></div>
      </div>
  
      <!-- 拖拽展开后的内容区域 -->
      <div v-if="isDragExpanded" class="drag-expand-content">
        <div class="drag-nav-controls" :class="{ 'is-detail': isViewingDetail }">
          <button v-if="isViewingDetail" class="nav-back-btn" @click="backToList">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="nav-close-btn" @click="collapseDrag">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div v-show="!isViewingDetail" class="drag-content-layer">
          <AnimeListContent :key="animeType" :animeType="animeType" @select="onSelectAnime" />
        </div>

        <div v-if="isViewingDetail" class="drag-content-layer">
          <AnimeDetailContent :animeType="selectedAnimeType" :animeId="selectedAnimeId" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import AnimeListContent from './AnimeListContent.vue'
  import AnimeDetailContent from './AnimeDetailContent.vue'
  
  const props = defineProps({
    animeType: { type: String, default: 'riman' },
    animeId: { type: [Number, String], default: 1 },
    disabled: { type: Boolean, default: false }
  })
  
  const emit = defineEmits(['expand', 'collapse', 'update:animeType', 'update:animeId'])
  
  const isDragExpanded = ref(false)
  const isDragging = ref(false)
  const currentHeight = ref(54)
  
  const isViewingDetail = ref(false)
  const selectedAnimeType = ref('riman')
  const selectedAnimeId = ref(1)
  
  let startY = 0
  let startHeight = 54
  const MIN_HEIGHT = 54
  const MAX_HEIGHT = window.innerHeight - 84
  
  const getNav = () => document.querySelector('.dynamic-island')
  
  // ============ 拖拽：折叠时下拖展开 / 展开时上拖缩回 ============
  const onDragStart = (e) => {
    if (props.disabled) return
    
    isDragging.value = true
    startY = e.clientY || (e.touches && e.touches[0].clientY)
    // 根据当前状态决定起始高度
    startHeight = isDragExpanded.value ? MAX_HEIGHT : MIN_HEIGHT
    e.preventDefault()
    
    const nav = getNav()
    if (nav) nav.style.transition = 'none'
  }
  
  const onDragMove = (e) => {
    if (!isDragging.value) return
    const currentY = e.clientY || (e.touches && e.touches[0].clientY)
    // deltaY > 0 表示鼠标上移，< 0 表示下移
    const deltaY = startY - currentY
    let newHeight = startHeight - deltaY
    
    if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT
    if (newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT
    
    currentHeight.value = newHeight
    
    const nav = getNav()
    if (nav) nav.style.height = `${newHeight}px`
    e.preventDefault()
  }
  
  const onDragEnd = () => {
    if (!isDragging.value) return
    isDragging.value = false
    
    const nav = getNav()
    if (nav) { nav.style.transition = ''; nav.style.height = '' }
    
    const threshold = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) / 2
    
    if (currentHeight.value > threshold) {
      expandDrag()
    } else {
      collapseDrag()
    }
    
    currentHeight.value = MIN_HEIGHT
  }
  
  const expandDrag = () => {
    if (props.disabled) return
    isDragExpanded.value = true
    isViewingDetail.value = false
    emit('expand')
  }
  
  const collapseDrag = () => {
    isDragExpanded.value = false
    isViewingDetail.value = false
    emit('collapse')
    const nav = getNav()
    if (nav) nav.style.height = ''
  }
  
  // ============ 列表↔详情切换 ============
  const onSelectAnime = (item) => {
    selectedAnimeType.value = props.animeType
    selectedAnimeId.value = item.id
    isViewingDetail.value = true
  }
  
  const showDetail = (type, id) => {
    selectedAnimeType.value = type
    selectedAnimeId.value = id
    if (!isDragExpanded.value) expandDrag()
    isViewingDetail.value = true
  }
  
  const backToList = () => {
    if (selectedAnimeType.value !== props.animeType) {
      emit('update:animeType', selectedAnimeType.value)
    }
    isViewingDetail.value = false
  }
  
  const setAnime = (type, id) => {
    emit('update:animeType', type)
    emit('update:animeId', id)
  }
  
  defineExpose({ expandDrag, collapseDrag, setAnime, showDetail, isDragExpanded })
  
  watch(() => props.disabled, (val) => { if (val && isDragExpanded.value) collapseDrag() })
  watch(() => props.animeType, () => { isViewingDetail.value = false })
  
  onMounted(() => {
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)
    window.addEventListener('touchmove', onDragMove, { passive: false })
    window.addEventListener('touchend', onDragEnd)
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', onDragEnd)
    window.removeEventListener('touchmove', onDragMove)
    window.removeEventListener('touchend', onDragEnd)
  })
  </script>
  
  <style scoped>
  /* 小白条：始终在灵动岛外侧底部 */
  .drag-handle {
    position: absolute;
    bottom: -21px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    z-index: 101;
    transition: opacity 0.2s;
  }
  .drag-handle:active { cursor: grabbing }
  .drag-handle.is-dragging { cursor: grabbing }
  
  .drag-handle.is-expanded {
    bottom: -23px;
    opacity: 0.8;
  }
  
  .handle-bar {
    width: 160px;
    height: 6px;
    background: rgba(255,255,255,0.6);
    border-radius: 3px;
    backdrop-filter: blur(4px);
    transition: all 0.2s;
  }
  .drag-handle.is-dragging .handle-bar {
    background: rgba(0,180,216,0.8);
    width: 200px;
  }
  .drag-handle:hover .handle-bar {
    background: rgba(0,180,216,0.6);
    width: 180px;
  }
  
  .drag-expand-content {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    overflow: hidden;
    padding: 44px 24px 24px;
    background: transparent;
  }
  
  .drag-content-layer {
    width: 100%;
    height: 100%;
  }
  
  .drag-nav-controls {
    position: absolute; top: 10px; right: 12px; z-index: 200;
    display: flex; align-items: center;
  }
  .drag-nav-controls:not(.is-detail) {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(0,0,0,0.2); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.3);
  }
  .drag-nav-controls:not(.is-detail) .nav-close-btn {
    width: 100%; height: 100%; border-radius: 50%;
  }
  .drag-nav-controls.is-detail {
    height: 32px; border-radius: 16px;
    background: rgba(0,0,0,0.2); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.3); overflow: hidden;
  }
  .nav-back-btn, .nav-close-btn {
    display: flex; align-items: center; justify-content: center;
    border: none; cursor: pointer; color: #fff;
    background: transparent; transition: background .2s;
  }
  .nav-back-btn {
    width: 32px; height: 32px;
    border-right: 1px solid rgba(255,255,255,.15);
  }
  .nav-back-btn:hover { background: rgba(255,255,255,.15) }
  .nav-close-btn { width: 32px; height: 32px }
  .nav-close-btn:hover { background: rgba(255,255,255,.15) }
  </style>
