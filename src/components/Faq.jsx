import { useState } from 'react'
import { useSite } from '../context/SiteContext'
import { useReveal } from '../hooks/useReveal'
import styles from './Faq.module.css'

export default function Faq() {
  const { content } = useSite()
  const { faq, sections } = content
  const s = sections.faq
  const sectionRef = useReveal()
  const [open, setOpen] = useState(0)

  if (!faq || faq.length === 0) return null

  return (
    <section id="faq" className={styles.section} ref={sectionRef}>
      <div className={`${styles.sectionHead} reveal`}>
        <div>
          <span className={styles.eyebrow}>{s.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{s.title}</h2>
        </div>
        <p className={styles.sectionDesc}>{s.desc}</p>
      </div>

      <div className={`${styles.list} reveal`}>
        {faq.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={i} className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
              <button
                className={styles.q}
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
              >
                <span className={styles.qNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.qText}>{item.q}</span>
                <span className={`${styles.qIcon} ${isOpen ? styles.qIconOpen : ''}`} aria-hidden="true" />
              </button>
              <div className={styles.aWrap} data-open={isOpen}>
                <div className={styles.aInner}>
                  <p className={styles.a}>{item.a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
