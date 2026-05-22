import { useSite } from '../context/SiteContext'
import styles from './Footer.module.css'

export default function Footer() {
  const { content, t } = useSite()
  const { company, services } = content

  const navLinks = [
    { href: '#home', label: t('nav.home') },
    { href: '#services', label: t('nav.services') },
    { href: '#about', label: t('nav.about') },
    { href: '#process', label: t('nav.process') },
    { href: '#faq', label: t('nav.faq') },
    { href: '#contact', label: t('nav.contacts') },
  ]

  const serviceLinks = services.slice(0, 5).map(s => s.name)

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
          <div className={styles.colTitle}>{t('footer.navTitle')}</div>
          <ul>
            {navLinks.map(({ href, label }) => (
              <li key={href}><a href={href} onClick={e => scrollTo(e, href)}>{label}</a></li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>{t('footer.servicesTitle')}</div>
          <ul>
            {serviceLinks.map(label => (
              <li key={label}><a href="#services" onClick={e => scrollTo(e, '#services')}>{label}</a></li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>{t('footer.contactsTitle')}</div>
          <ul>
            <li><a href={`mailto:${company.email}`}>{company.email}</a></li>
            <li><a href={company.telegramUrl}>{company.telegram}</a></li>
            <li><a href={`tel:${company.phone.replace(/\D/g, '')}`}>{company.phone}</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.copy}>© {new Date().getFullYear()} Integra Develop. {t('footer.rights')}</div>
        <div className={styles.legal}>
          <a href="#">{t('footer.privacy')}</a>
          <a href="#">{t('footer.offer')}</a>
        </div>
      </div>
    </footer>
  )
}
