import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const isAnimating = ref(false)

export function usePageTransition() {
  const router = useRouter()

  const animOptions = {
    duration: 600,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fill: 'forwards'
  }

  const getIndex = (route) => route?.meta?.index ?? 0

  onMounted(() => {
    if (window._prevRouteIndex === undefined) {
      window._prevRouteIndex = getIndex(router.currentRoute.value)
    }
  })

  const onEnter = (el, done) => {
    isAnimating.value = true

    const toIndex = getIndex(router.currentRoute.value)
    const fromIndex = window._prevRouteIndex || 0
    const isBackward = toIndex < fromIndex

    if (isBackward) {
      // 后退：新页在下方淡入
      el.style.zIndex = 1
      el.animate([
        { opacity: '0.6' },
        { opacity: '1' }
      ], animOptions).onfinish = () => {
        done()
        setTimeout(() => { isAnimating.value = false }, 200)
      }
    } else {
      // 前进：新页从右侧滑入
      el.style.zIndex = 2
      el.animate([
        { transform: 'translateX(100%)' },
        { transform: 'translateX(0)' }
      ], animOptions).onfinish = () => {
        done()
        setTimeout(() => { isAnimating.value = false }, 200)
      }
    }

    window._prevRouteIndex = toIndex
  }

  const onLeave = (el, done) => {
    const toIndex = getIndex(router.currentRoute.value)
    const fromIndex = window._prevRouteIndex || 0
    const isBackward = toIndex < fromIndex

    if (isBackward) {
      // 后退：旧页向右滑出
      el.style.zIndex = 2
      el.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(100%)' }
      ], animOptions).onfinish = done
    } else {
      // 前进：旧页变暗
      el.style.zIndex = 1
      el.animate([
        { opacity: '1' },
        { opacity: '0.4' }
      ], animOptions).onfinish = done
    }
  }

  return { onEnter, onLeave, isAnimating }
}
