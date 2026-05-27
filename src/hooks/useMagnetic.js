import { useEffect, useRef } from 'react'
import anime from 'animejs'

export function useMagnetic() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * 0.28
      const dy = (e.clientY - cy) * 0.28
      anime({ targets: el, translateX: dx, translateY: dy, duration: 350, easing: 'easeOutExpo' })
    }

    const onLeave = () => {
      anime({ targets: el, translateX: 0, translateY: 0, duration: 700, easing: 'easeOutElastic(1, .5)' })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return ref
}
