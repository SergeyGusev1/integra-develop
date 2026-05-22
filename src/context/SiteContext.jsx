import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { defaultContent, defaultSettings } from '../data/defaultContent'
import { contentEn } from '../data/contentEn'
import { ui } from '../data/ui'

const SiteContext = createContext(null)
const API = '/integra'

function deepMerge(base, override) {
  if (!override) return base
  const result = { ...base }
  for (const key of Object.keys(override)) {
    if (Array.isArray(override[key])) {
      result[key] = override[key]
    } else if (typeof override[key] === 'object' && override[key] !== null && typeof base[key] === 'object') {
      result[key] = deepMerge(base[key], override[key])
    } else {
      result[key] = override[key]
    }
  }
  return result
}

function loadLang() {
  try {
    return localStorage.getItem('integra_lang') === 'en' ? 'en' : 'ru'
  } catch {
    return 'ru'
  }
}

export function SiteProvider({ children }) {
  // RU content is the source of truth — loaded from the backend, edited in admin.
  const [rawContent, setRawContent] = useState(defaultContent)
  const [settings, setSettings] = useState(defaultSettings)
  const [submissions, setSubmissions] = useState([])

  const [adminOpen, setAdminOpen] = useState(false)
  const [adminAuthed, setAdminAuthed] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [lang, setLangState] = useState(loadLang)

  const clickTimer = useRef(null)
  const passwordRef = useRef('')

  // Load live content from the backend on mount.
  useEffect(() => {
    fetch(`${API}/content`)
      .then(res => (res.ok ? res.json() : {}))
      .then(data => {
        if (data && Object.keys(data).length > 0) setRawContent(prev => deepMerge(prev, data))
      })
      .catch(() => {})
  }, [])

  // Keep <html lang> in sync.
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next) => {
    setLangState(next)
    try { localStorage.setItem('integra_lang', next) } catch {}
  }, [])

  const login = useCallback(async (password) => {
    try {
      const res = await fetch(`${API}/settings?password=${encodeURIComponent(password)}`)
      if (res.status === 403) return false
      if (res.ok) {
        const data = await res.json()
        setSettings({ ...defaultSettings, ...data })
        passwordRef.current = password
        setAdminAuthed(true)
        const subsRes = await fetch(`${API}/submissions?password=${encodeURIComponent(password)}`)
        if (subsRes.ok) {
          const subs = await subsRes.json()
          setSubmissions(Array.isArray(subs) ? subs : [])
        }
        return true
      }
    } catch {}
    return false
  }, [])

  const handleLogoClick = useCallback((e) => {
    e.preventDefault()
    if (clickTimer.current) clearTimeout(clickTimer.current)

    setClickCount(prev => {
      const next = prev + 1
      if (next >= 5) {
        setAdminOpen(true)
        setAdminAuthed(false)
        return 0
      }
      document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' })
      clickTimer.current = setTimeout(() => setClickCount(0), 2500)
      return next
    })
  }, [])

  const updateContent = useCallback(async (next) => {
    setRawContent(next)
    await fetch(`${API}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordRef.current, content: next }),
    }).catch(() => {})
  }, [])

  const updateSettings = useCallback(async (next) => {
    setSettings(next)
    await fetch(`${API}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordRef.current, settings: next }),
    }).catch(() => {})
  }, [])

  const addSubmission = useCallback(async (entry) => {
    setSubmissions(prev => [entry, ...prev])
    await fetch(`${API}/submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {})
  }, [])

  const clearSubmissions = useCallback(async () => {
    setSubmissions([])
    await fetch(`${API}/submissions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordRef.current }),
    }).catch(() => {})
  }, [])

  // Active display content: static EN when language = EN (RU while editing in admin).
  const content = lang === 'en' && !adminOpen ? contentEn : rawContent

  // UI string translator: t('contact.submit')
  const t = useCallback((key) => {
    const dict = ui[lang] || ui.ru
    const value = key.split('.').reduce((obj, part) => (obj && obj[part] != null ? obj[part] : null), dict)
    return value == null ? key : value
  }, [lang])

  return (
    <SiteContext.Provider value={{
      content, rawContent, updateContent,
      settings, updateSettings,
      submissions, addSubmission, clearSubmissions,
      adminOpen, setAdminOpen,
      adminAuthed, setAdminAuthed,
      handleLogoClick, login,
      lang, setLang, t,
    }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSite = () => useContext(SiteContext)
