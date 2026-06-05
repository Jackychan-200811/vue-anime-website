// src/composables/useDragExpand.js
import { ref, onUnmounted } from 'vue'

export function useDragExpand(options = {}) {
  const {
    minHeight = 54,           // 最小高度（灵动岛原始高度）
    maxHeight = window.innerHeight - 100,  // 最大高度（距底部100px）
    threshold = 50,           // 自动展开/收起阈值
    onExpandStart = null,     // 开始展开回调
    onExpandEnd = null,       // 展开完成回调
    onCollapseStart = null,   // 开始收起回调
    onCollapseEnd = null      // 收起完成回调
  } = options

  const isExpanded = ref(false)
  const currentHeight = ref(minHeight)
  const isDragging = ref(false)
  const startY = ref(0)
  const startHeight = ref(minHeight)

  let rafId = null
  let transitionTimer = null

  // 限制高度范围
  const clampHeight = (h) => {
    return Math.min(maxHeight, Math.max(minHeight, h))
  }

  // 设置高度（带动画或不带动画）
  const setHeight = (height, withTransition = false) => {
    if (withTransition) {
      if (transitionTimer) clearTimeout(transitionTimer)
      const navbar = document.querySelector('.dynamic-island')
      if (navbar) {
        navbar.style.transition = 'height 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1), width 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)'
      }
      currentHeight.value = height
      transitionTimer = setTimeout(() => {
        if (navbar) navbar.style.transition = ''
        transitionTimer = null
      }, 350)
    } else {
      currentHeight.value = height
    }
  }

  // 展开
  const expand = () => {
    if (isExpanded.value) return
    isExpanded.value = true
    if (onExpandStart) onExpandStart()
    setHeight(maxHeight, true)
    if (onExpandEnd) setTimeout(onExpandEnd, 350)
  }

  // 收起
  const collapse = () => {
    if (!isExpanded.value) return
    isExpanded.value = false
    if (onCollapseStart) onCollapseStart()
    setHeight(minHeight, true)
    if (onCollapseEnd) setTimeout(onCollapseEnd, 350)
  }

  // 拖拽开始
  const onDragStart = (e) => {
    e.preventDefault()
    isDragging.value = true
    startY.value = e.clientY
    startHeight.value = currentHeight.value

    // 清除可能正在进行的过渡
    const navbar = document.querySelector('.dynamic-island')
    if (navbar) navbar.style.transition = 'none'

    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', onDragEnd)
    document.addEventListener('touchmove', onDragMove, { passive: false })
    document.addEventListener('touchend', onDragEnd)
  }

  // 拖拽中
  const onDragMove = (e) => {
    if (!isDragging.value) return
    e.preventDefault()

    const currentY = e.clientY
    const deltaY = startY.value - currentY  // 向下拖拽 deltaY 为负，向上为正
    let newHeight = startHeight.value + deltaY

    newHeight = clampHeight(newHeight)

    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      currentHeight.value = newHeight
      rafId = null
    })
  }

  // 拖拽结束
  const onDragEnd = (e) => {
    if (!isDragging.value) return
    isDragging.value = false

    // 根据当前高度决定展开还是收起
    const centerThreshold = (minHeight + maxHeight) / 2
    if (currentHeight.value > centerThreshold) {
      expand()
    } else {
      collapse()
    }

    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
    document.removeEventListener('touchmove', onDragMove)
    document.removeEventListener('touchend', onDragEnd)
  }

  // 清理
  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
    if (transitionTimer) clearTimeout(transitionTimer)
    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
    document.removeEventListener('touchmove', onDragMove)
    document.removeEventListener('touchend', onDragEnd)
  })

  return {
    isExpanded,
    currentHeight,
    isDragging,
    expand,
    collapse,
    onDragStart
  }
}