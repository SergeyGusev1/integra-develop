import { useState, useEffect } from 'react'
import { useSite } from '../context/SiteContext'
import styles from './Nav.module.css'

export default function Nav() {
  const { handleLogoClick, t, lang, setLang } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '#home', label: t('nav.home') },
    { href: '#services', label: t('nav.services') },
    { href: '#about', label: t('nav.about') },
    { href: '#process', label: t('nav.process') },
    { href: '#faq', label: t('nav.faq') },
    { href: '#contact', label: t('nav.contacts') },
  ]

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30)
      const sections = document.querySelectorAll('section[id]')
      let current = 'home'
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 200) current = s.id
      })
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#home" className={styles.logo} onClick={handleLogoClick}>
        Integra<span className={styles.mark}>DEV</span>
      </a>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              className={`${styles.link} ${active === href.slice(1) ? styles.linkActive : ''}`}
              onClick={e => scrollTo(e, href)}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <div className={styles.navRight}>
        <div className={styles.lang} role="group" aria-label="Language">
          <button
            className={`${styles.langBtn} ${lang === 'ru' ? styles.langActive : ''}`}
            onClick={() => setLang('ru')}
            aria-pressed={lang === 'ru'}
          >RU</button>
          <span className={styles.langSep}>/</span>
          <button
            className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
            onClick={() => setLang('en')}
            aria-pressed={lang === 'en'}
          >EN</button>
        </div>
        <a href="#contact" className={styles.cta} data-magnetic onClick={e => scrollTo(e, '#contact')}>
          {t('nav.cta')}
        </a>
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={t('nav.menu')}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
