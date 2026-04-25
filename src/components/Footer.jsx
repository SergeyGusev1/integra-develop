import { useSite } from '../context/SiteContext'
import styles from './Footer.module.css'

const navLinks = [
  { href: '#home', label: 'Главная' },
  { href: '#services', label: 'Услуги' },
  { href: '#about', label: 'О студии' },
  { href: '#process', label: 'Процесс' },
  { href: '#contact', label: 'Контакты' },
]

const serviceLinks = [
  'Веб-разработка', 'Мобильные приложения', 'AI & автоматизация', 'Backend & API', 'DevOps',
]

export default function Footer() {
  const { content } = useSite()
  const { company } = content

  const scrollTo = (e, href) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <a href="#home" className={styles.logo} onClick={e => scrollTo(e, '#home')}>
            Integra<span className={styles.mark}>DEV</span>
          </a>
          <p>{company.footerDesc}</p>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Навигация</div>
          <ul>
            {navLinks.map(({ href, label }) => (
              <li key={href}><a href={href} onClick={e => scrollTo(e, href)}>{label}</a></li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Услуги</div>
          <ul>
            {serviceLinks.map(label => (
              <li key={label}><a href="#services" onClick={e => scrollTo(e, '#services')}>{label}</a></li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Контакты</div>
          <ul>
            <li><a href={`mailto:${company.email}`}>{company.email}</a></li>
            <li><a href={company.telegramUrl}>{company.telegram}</a></li>
            <li><a href={`tel:${company.phone.replace(/\D/g, '')}`}>{company.phone}</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.copy}>© {new Date().getFullYear()} Integra Develop. Все права защищены.</div>
        <div className={styles.legal}>
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Публичная оферта</a>
        </div>
      </div>
    </footer>
  )
}
