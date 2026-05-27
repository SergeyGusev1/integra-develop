import { useSite } from '../context/SiteContext'
import { useReveal } from '../hooks/useReveal'
import { useAnimeReveal } from '../hooks/useAnimeReveal'
import styles from './Services.module.css'

export default function Services() {
  const { content } = useSite()
  const { services, sections } = content
  const s = sections.services
  const sectionRef = useReveal()
  const cardsRef = useAnimeReveal('.anime-card')

  return (
    <section id="services" className={styles.section} ref={sectionRef}>
      <div className={`${styles.sectionHead} reveal`}>
        <div>
          <span className={styles.eyebrow}>{s.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{s.title}</h2>
        </div>
        <p className={styles.sectionDesc}>{s.desc}</p>
      </div>

      <div className={styles.grid} ref={cardsRef}>
        {services.map(svc => (
          <article key={svc.num} className={`${styles.card} anime-card`} data-fx="card">
            <div className={styles.cardNum}>{svc.num}</div>
            <h3 className={styles.cardName}>{svc.name}</h3>
            <p className={styles.cardDesc}>{svc.desc}</p>
            <div className={styles.cardTag}>{svc.tag}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
