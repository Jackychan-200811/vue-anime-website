// src/composables/usePageTransition.js
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const isAnimating = ref(false)
window._pageDirection = 'forward'

export function usePageTransition() {
  const router = useRouter()
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

    window._pageDirection = isBackward ? 'backward' : 'forward'
    el.setAttribute('data-direction', window._pageDirection)

    const onFinish = () => {
      el.removeEventListener('animationend', onFinish)
      done()
      setTimeout(() => { isAnimating.value = false }, 200)
    }
    el.addEventListener('animationend', onFinish, { once: true })
    setTimeout(onFinish, 900)
    window._prevRouteIndex = toIndex
  }

  const onLeave = (el, done) => {
    const onFinish = () => {
      el.removeEventListener('animationend', onFinish)
      done()
    }
    el.addEventListener('animationend', onFinish, { once: true })
    setTimeout(onFinish, 900)
  }

  return { onEnter, onLeave, isAnimating }
}
