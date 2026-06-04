// src/composables/usePageWheel.js
import { useRouter } from 'vue-router'

// 定义页面顺序（3个页面）
const PAGE_ORDER = ['home', 'guoman-home', 'riman-home']

// 路由名称到实际路径的映射
const ROUTE_PATH_MAP = {
  'home': '/',
  'guoman-home': '/guoman-home',
  'riman-home': '/riman-home'
}

// 模块级动画锁，防止动画期间连续触发
let isAnimating = false

export function usePageWheel(currentRouteName) {
  const router = useRouter()
  
  // 防抖标志
  let isProcessing = false
  
  // 获取当前页面索引
  const currentIndex = PAGE_ORDER.indexOf(currentRouteName)
  
  const handleWheel = (e) => {
    // 灵动岛展开时，内部滚动不触发页面切换
    if (e.target.closest('.dynamic-island')) return

    // 如果正在动画中，阻止所有滚轮操作
    if (isAnimating) {
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
      isAnimating = true
      e.preventDefault()
      
      const targetPath = ROUTE_PATH_MAP[targetPage]
      
      router.push(targetPath)
      
      // 动画时长 + 缓冲后解锁
      setTimeout(() => {
        isProcessing = false
        isAnimating = false
      }, 700)
    }
  }
  
  return {
    handleWheel,
    currentIndex,
    totalPages: PAGE_ORDER.length,
    isAnimating: () => isAnimating
  }
}