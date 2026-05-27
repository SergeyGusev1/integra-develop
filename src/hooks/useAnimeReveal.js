import { useEffect, useRef } from 'react'
import anime from 'animejs'

export function useAnimeReveal(selector) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const items = selector ? Array.from(el.querySelectorAll(selector)) : [el]
    if (!items.length) return

    items.forEach(item => {
      item.style.opacity = '0'
      item.style.transform = 'translateY(36px)'
    })

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        anime({
          targets: items,
          opacity: [0, 1],
          translateY: [36, 0],
          delay: anime.stagger(90),
          duration: 850,
          easing: 'cubicBezier(.2,.8,.2,1)',
        })
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.08 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [selector])

  return ref
}
