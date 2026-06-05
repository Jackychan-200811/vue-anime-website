<template>
    <div class="drag-detail-module">
      <!-- 小白条 -->
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
        <!-- 导航按钮组：列表视图=圆形关闭，详情视图=胶囊形[返回+关闭] -->
        <div class="drag-nav-controls" :class="{ 'is-detail': isViewingDetail }">
          <button v-if="isViewingDetail" class="nav-back-btn" @click="backToList">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="nav-close-btn" @click="collapseDrag">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- 列表层 -->
        <div v-show="!isViewingDetail" class="drag-content-layer">
          <AnimeListContent 
            :key="animeType"
            :animeType="animeType"
            @select="onSelectAnime"
          />
        </div>

        <!-- 详情层 -->
        <div v-if="isViewingDetail" class="drag-content-layer">
          <AnimeDetailContent 
            :animeType="selectedAnimeType"
            :animeId="selectedAnimeId"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import AnimeListContent from './AnimeListContent.vue'
  import AnimeDetailContent from './AnimeDetailContent.vue'
  
  const props = defineProps({
    animeType: {
      type: String,
      default: 'riman'
    },
    animeId: {
      type: [Number, String],
      default: 1
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['expand', 'collapse', 'update:animeType', 'update:animeId'])
  
  // 拖拽状态
  const isDragExpanded = ref(false)
  const isDragging = ref(false)
  const currentHeight = ref(54)
  
  // 详情视图状态
  const isViewingDetail = ref(false)
  const selectedAnimeType = ref('riman')
  const selectedAnimeId = ref(1)
  
  let startY = 0
  let startHeight = 54
  const MIN_HEIGHT = 54
  const MAX_HEIGHT = window.innerHeight - 84
  
  // ============ 拖拽逻辑 ============
  const onDragStart = (e) => {
    if (isDragExpanded.value || props.disabled) return
    isDragging.value = true
    startY = e.clientY || (e.touches && e.touches[0].clientY)
    startHeight = currentHeight.value
    e.preventDefault()
    
    const navbar = document.querySelector('.dynamic-island')
    if (navbar) {
      navbar.style.transition = 'none'
    }
  }
  
  const onDragMove = (e) => {
    if (!isDragging.value) return
    const currentY = e.clientY || (e.touches && e.touches[0].clientY)
    const deltaY = startY - currentY
    let newHeight = startHeight - deltaY
    
    if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT
    if (newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT
    
    currentHeight.value = newHeight
    
    const navbar = document.querySelector('.dynamic-island')
    if (navbar) {
      navbar.style.height = `${newHeight}px`
    }
    e.preventDefault()
  }
  
  const onDragEnd = () => {
    if (!isDragging.value) return
    isDragging.value = false
    
    const navbar = document.querySelector('.dynamic-island')
    if (navbar) {
      navbar.style.transition = ''
      navbar.style.height = ''
    }
    
    if (currentHeight.value > MIN_HEIGHT + 100) {
      expandDrag()
    } else {
      collapseDrag()
    }
    currentHeight.value = MIN_HEIGHT
  }
  
  const expandDrag = () => {
    if (props.disabled) return
    isDragExpanded.value = true
    isViewingDetail.value = false  // 每次展开都回到列表视图
    emit('expand')
  }
  
  const collapseDrag = () => {
    isDragExpanded.value = false
    isViewingDetail.value = false  // 收起时重置视图
    emit('collapse')
    
    const navbar = document.querySelector('.dynamic-island')
    if (navbar) {
      navbar.style.height = ''
    }
  }
  
  // ============ 列表↔详情切换 ============
  const onSelectAnime = (item) => {
    selectedAnimeType.value = props.animeType
    selectedAnimeId.value = item.id
    isViewingDetail.value = true
  }
  
  // 从外部（搜索等）直接跳转到指定动漫的详情视图
  const showDetail = (type, id) => {
    selectedAnimeType.value = type
    selectedAnimeId.value = id
    if (!isDragExpanded.value) {
      expandDrag()
    }
    // expandDrag 会将 isViewingDetail 重置为 false，需要再次设为 true
    isViewingDetail.value = true
  }
  
  const backToList = () => {
    // 根据详情页的动漫类型，切换到对应的列表
    if (selectedAnimeType.value !== props.animeType) {
      emit('update:animeType', selectedAnimeType.value)
    }
    isViewingDetail.value = false
  }
  
  // ============ 暴露方法 ============
  const setAnime = (type, id) => {
    emit('update:animeType', type)
    emit('update:animeId', id)
  }
  
  defineExpose({
    expandDrag,
    collapseDrag,
    setAnime,
    showDetail,
    isDragExpanded
  })
  
  // 监听 disabled，如果禁用则自动收起
  watch(() => props.disabled, (val) => {
    if (val && isDragExpanded.value) {
      collapseDrag()
    }
  })
  
  // 监听路由变化，重新加载列表
  watch(() => props.animeType, () => {
    isViewingDetail.value = false  // 类型变化时回到列表
  })
  
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
  /* 小白条样式 */
  .drag-handle {
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    z-index: 101;
    transition: opacity 0.2s;
  }
  
  .drag-handle:active {
    cursor: grabbing;
  }
  
  .drag-handle.is-dragging {
    cursor: grabbing;
  }
  
  .drag-handle.is-expanded {
    bottom: -16px;
    opacity: 0.5;
  }
  
  .handle-bar {
    width: 100px;
    height: 5px;
    background: rgba(255,255,255,0.6);
    border-radius: 3px;
    backdrop-filter: blur(4px);
    transition: all 0.2s;
  }
  
  .drag-handle.is-dragging .handle-bar {
    background: rgba(0,180,216,0.8);
    width: 120px;
  }
  
  .drag-handle:hover .handle-bar {
    background: rgba(0,180,216,0.6);
    width: 110px;
  }
  
  .drag-expand-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    padding: 44px 24px 48px;
    background: transparent;
  }
  
  .drag-content-layer {
    width: 100%;
    height: 100%;
  }
  
  /* 导航按钮组 */
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
  .nav-back-btn:hover { background: rgba(255,255,255,.15); }
  .nav-close-btn { width: 32px; height: 32px; }
  .nav-close-btn:hover { background: rgba(255,255,255,.15); }

  
  .drag-close-btn:hover {
    background: rgba(0,0,0,0.4);
    color: #fff;
  }
  
  /* 返回列表按钮 */
  .back-to-list-btn {
    position: absolute;
    top: 10px;
    left: 12px;
    padding: 8px 16px;
    border-radius: 20px;
    background: rgba(0,0,0,0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    cursor: pointer;
    font-size: 13px;
    z-index: 200;
    transition: all .2s;
  }
  
  .back-to-list-btn:hover {
    background: rgba(0,180,216,0.4);
    border-color: rgba(0,180,216,0.4);
  }
  </style>
