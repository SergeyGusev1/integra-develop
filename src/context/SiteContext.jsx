import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { defaultContent, defaultSettings } from '../data/defaultContent'

const SiteContext = createContext(null)

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

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function SiteProvider({ children }) {
  const [content, setContent] = useState(() =>
    deepMerge(defaultContent, load('integra_content', null))
  )

  const [settings, setSettings] = useState(() =>
    ({ ...defaultSettings, ...load('integra_settings', {}) })
  )

  const [submissions, setSubmissions] = useState(() =>
    load('integra_submissions', [])
  )

  const [adminOpen, setAdminOpen] = useState(false)
  const [adminAuthed, setAdminAuthed] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const clickTimer = useRef(null)

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

  const updateContent = useCallback((next) => {
    setContent(next)
    localStorage.setItem('integra_content', JSON.stringify(next))
  }, [])

  const updateSettings = useCallback((next) => {
    setSettings(next)
    localStorage.setItem('integra_settings', JSON.stringify(next))
  }, [])

  const addSubmission = useCallback((entry) => {
    setSubmissions(prev => {
      const updated = [entry, ...prev]
      localStorage.setItem('integra_submissions', JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearSubmissions = useCallback(() => {
    setSubmissions([])
    localStorage.removeItem('integra_submissions')
  }, [])

  return (
    <SiteContext.Provider value={{
      content, updateContent,
      settings, updateSettings,
      submissions, addSubmission, clearSubmissions,
      adminOpen, setAdminOpen,
      adminAuthed, setAdminAuthed,
      handleLogoClick,
    }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSite = () => useContext(SiteContext)
