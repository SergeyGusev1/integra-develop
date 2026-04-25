import { useSite } from '../context/SiteContext'
import { useReveal } from '../hooks/useReveal'
import styles from './Process.module.css'

export default function Process() {
  const { content } = useSite()
  const { process, sections } = content
  const s = sections.process
  const sectionRef = useReveal()

  return (
    <section id="process" className={styles.section} ref={sectionRef}>
      <div className={`${styles.sectionHead} reveal`}>
        <div>
          <span className={styles.eyebrow}>{s.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{s.title}</h2>
        </div>
        <p className={styles.sectionDesc}>{s.desc}</p>
      </div>

      <div className={`${styles.grid} reveal`}>
        {process.map((step, i) => (
          <div key={i} className={styles.step}>
            <div className={styles.stepNum}>{step.num}</div>
            <h3 className={styles.stepName}>{step.name}</h3>
            <p className={styles.stepDesc}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
