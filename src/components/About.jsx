import { useSite } from '../context/SiteContext'
import { useReveal } from '../hooks/useReveal'
import styles from './About.module.css'

export default function About() {
  const { content } = useSite()
  const { about, sections, company } = content
  const s = sections.about
  const sectionRef = useReveal()

  return (
    <section id="about" className={styles.section} ref={sectionRef}>
      <div className={`${styles.visual} reveal`}>
        <div className={styles.mono}>
          Integra<br />
          <em>Develop.</em>
        </div>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <strong>{company.year}</strong>
            Основано
          </div>
          <div className={styles.metaItem}>
            <strong>{company.teamSize}</strong>
            Инженеров
          </div>
          <div className={styles.metaItem}>
            <strong>{company.projectsCount}</strong>
            Проектов
          </div>
        </div>
      </div>

      <div className={`${styles.text} reveal`}>
        <span className={styles.eyebrow}>{s.eyebrow}</span>
        <h2 className={styles.title}>{s.title}</h2>
        <p className={styles.lead}>{about.lead}</p>

        <div className={styles.values}>
          {about.values.map(v => (
            <div key={v.num} className={styles.value}>
              <div className={styles.valueNum}>{v.num}</div>
              <div>
                <h4 className={styles.valueTitle}>{v.title}</h4>
                <p className={styles.valueText}>{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
