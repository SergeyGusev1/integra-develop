import { useEffect, useRef, useState } from 'react'
import { useSite } from '../context/SiteContext'
import { useReveal } from '../hooks/useReveal'
import { useMagnetic } from '../hooks/useMagnetic'
import anime from 'animejs'
import styles from './Hero.module.css'

function useCountUp(target, duration = 1400, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      setValue(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return value
}

function StatItem({ num, suffix, label }) {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)
  const count = useCountUp(num, 1400, started)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); observer.unobserve(el) }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.stat} ref={ref}>
      <div className={styles.statNum}>{count}<em>{suffix}</em></div>
      <div className={styles.statLbl}>{label}</div>
    </div>
  )
}

export default function Hero() {
  const { content, t } = useSite()
  const { company, hero } = content
  const sectionRef = useReveal()
  const titleRef = useRef(null)
  const btn1Ref = useMagnetic()
  const btn2Ref = useMagnetic()

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const lines = el.querySelectorAll('.title-line')
    anime({
      targets: lines,
      opacity: [0, 1],
      translateY: [56, 0],
      delay: anime.stagger(130, { start: 200 }),
      duration: 1100,
      easing: 'cubicBezier(.16,1,.3,1)',
    })
  }, [])

  const scrollTo = (e, href) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className={styles.hero} ref={sectionRef}>
      <div className={`${styles.heroMeta} reveal`}>
        <div className={styles.heroMetaItem}>№ 001 — <strong>{t('hero.badge')}</strong></div>
        <div className={styles.heroMetaItem}>{company.city} · {t('hero.est')} <strong>{company.year}</strong></div>
      </div>

      <h1 className={styles.heroTitle} ref={titleRef}>
        <span className="title-line" style={{ display: 'block', opacity: 0 }}>{hero.titleLine1}</span>
        <em className="title-line" style={{ display: 'block', opacity: 0 }}>{hero.titleLine2}</em>
        <span className={`${styles.light} title-line`} style={{ display: 'block', opacity: 0 }}>{hero.titleLine3}</span>
        <span className="title-line" style={{ display: 'block', opacity: 0 }}>{hero.titleLine4}</span>
      </h1>

      <div className={styles.heroBottom}>
        <p className={`${styles.heroSub} reveal`}>{hero.subtitle}</p>
        <div className={`${styles.heroActions} reveal`}>
          <a href="#services" className={styles.btnGhost} ref={btn1Ref} onClick={e => scrollTo(e, '#services')}>{t('hero.btnServices')}</a>
          <a href="#contact" className={styles.btnPrimary} ref={btn2Ref} onClick={e => scrollTo(e, '#contact')}>
            {t('hero.btnStart')} <span className={styles.arrow}>→</span>
          </a>
        </div>
      </div>

      <div className={`${styles.heroStats} reveal`}>
        {hero.stats.map(s => (
          <StatItem key={s.label} {...s} />
        ))}
      </div>
    </section>
  )
}
