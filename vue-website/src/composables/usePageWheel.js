// src/composables/usePageWheel.js
import { useRouter } from 'vue-router'
import { usePageTransition } from './usePageTransition'

// 定义页面顺序（3个页面）
const PAGE_ORDER = ['home', 'guoman-home', 'riman-home']

// 路由名称到实际路径的映射
const ROUTE_PATH_MAP = {
  'home': '/',
  'guoman-home': '/guoman-home',
  'riman-home': '/riman-home'
}

export function usePageWheel(currentRouteName) {
  const router = useRouter()
  const { isAnimating } = usePageTransition()
  
  // 防抖标志
  let isProcessing = false
  
  // 获取当前页面索引
  const currentIndex = PAGE_ORDER.indexOf(currentRouteName)
  
  const handleWheel = (e) => {
    // 灵动岛展开时，内部滚动不触发页面切换
    if (e.target.closest('.dynamic-island')) return

    // 如果正在动画中，阻止所有滚轮操作
    if (isAnimating.value) {
      e.preventDefault()
      return
    }
    
    // 如果正在处理中，忽略
    if (isProcessing) return
    
    const isScrollingUp = e.deltaY < 0
    const isScrollingDown = e.deltaY > 0
    
    let targetPage = null
    
    // 向上滚动：上一个页面
    if (isScrollingUp && currentIndex > 0) {
      targetPage = PAGE_ORDER[currentIndex - 1]
    }
    // 向下滚动：下一个页面
    else if (isScrollingDown && currentIndex < PAGE_ORDER.length - 1) {
      targetPage = PAGE_ORDER[currentIndex + 1]
    }
    
    if (targetPage) {
      isProcessing = true
      e.preventDefault()
      
      const targetPath = ROUTE_PATH_MAP[targetPage]
      
      // 直接使用 router.push，动画由 usePageTransition 的 onEnter/onLeave 处理
      router.push(targetPath)
      
      // 延迟解锁，避免连续触发
      setTimeout(() => {
        isProcessing = false
      }, 500)
    }
  }
  
  return {
    handleWheel,
    currentIndex,
    totalPages: PAGE_ORDER.length,
    isAnimating
  }
}