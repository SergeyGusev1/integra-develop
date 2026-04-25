import styles from './Marquee.module.css'

const items = [
  'Web Development',
  'Mobile Applications',
  'Artificial Intelligence',
  'Cloud Infrastructure',
  'CRM & ERP Systems',
  'API Integrations',
  'Telegram Bots',
  'DevOps',
]

export default function Marquee() {
  const doubled = [...items, ...items]

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        {doubled.map((item, i) => (
          <span key={i} className={styles.item}>
            {item}
            <span className={styles.dot} />
          </span>
        ))}
      </div>
    </div>
  )
}
