import { useEffect, useRef, useState } from 'react'
import { useSite } from '../context/SiteContext'
import { useReveal } from '../hooks/useReveal'
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
  const { content } = useSite()
  const { company, hero } = content
  const sectionRef = useReveal()

  const scrollTo = (e, href) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className={styles.hero} ref={sectionRef}>
      <div className={`${styles.heroMeta} reveal`}>
        <div className={styles.heroMetaItem}>№ 001 — <strong>Студия разработки</strong></div>
        <div className={styles.heroMetaItem}>{company.city} · Est. <strong>{company.year}</strong></div>
      </div>

      <h1 className={`${styles.heroTitle} reveal`}>
        {hero.titleLine1}<br />
        <em>{hero.titleLine2}</em><br />
        <span className={styles.light}>{hero.titleLine3}</span><br />
        {hero.titleLine4}
      </h1>

      <div className={styles.heroBottom}>
        <p className={`${styles.heroSub} reveal`}>{hero.subtitle}</p>
        <div className={`${styles.heroActions} reveal`}>
          <a href="#services" className={styles.btnGhost} onClick={e => scrollTo(e, '#services')}>Услуги</a>
          <a href="#contact" className={styles.btnPrimary} onClick={e => scrollTo(e, '#contact')}>
            Начать проект <span className={styles.arrow}>→</span>
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
