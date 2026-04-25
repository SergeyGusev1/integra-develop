import { useState, useEffect } from 'react'
import { useSite } from '../context/SiteContext'
import styles from './Nav.module.css'

const links = [
  { href: '#home', label: 'Главная' },
  { href: '#services', label: 'Услуги' },
  { href: '#about', label: 'О нас' },
  { href: '#process', label: 'Процесс' },
  { href: '#contact', label: 'Контакты' },
]

export default function Nav() {
  const { handleLogoClick } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)

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
        <a href="#contact" className={styles.cta} onClick={e => scrollTo(e, '#contact')}>
          Обсудить проект
        </a>
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Меню"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
