import { useRouter } from 'vue-router'
import { usePageTransition } from './usePageTransition'

const PAGE_ORDER = ['home', 'guoman-home', 'riman-home']
const ROUTE_PATH_MAP = { 'home': '/', 'guoman-home': '/guoman-home', 'riman-home': '/riman-home' }

export function usePageWheel(currentRouteName) {
  const router = useRouter()
  const { isAnimating } = usePageTransition()

  let isProcessing = false
  const currentIndex = PAGE_ORDER.indexOf(currentRouteName)

  const handleWheel = (e) => {
    if (e.target.closest('.dynamic-island')) return
    if (isAnimating.value) { e.preventDefault(); return }
    if (isProcessing) return

    const isScrollingUp = e.deltaY < 0
    const isScrollingDown = e.deltaY > 0
    const last = PAGE_ORDER.length - 1
    let targetPage = null

    // 环形循环：首页↑→日漫，日漫↓→首页
    if (isScrollingUp) {
      targetPage = currentIndex > 0 ? PAGE_ORDER[currentIndex - 1] : PAGE_ORDER[last]
    } else if (isScrollingDown) {
      targetPage = currentIndex < last ? PAGE_ORDER[currentIndex + 1] : PAGE_ORDER[0]
    }

    if (targetPage) {
      isProcessing = true
      e.preventDefault()
      router.push(ROUTE_PATH_MAP[targetPage])
      setTimeout(() => { isProcessing = false }, 900)
    }
  }

  return { handleWheel, currentIndex, totalPages: PAGE_ORDER.length }
}
