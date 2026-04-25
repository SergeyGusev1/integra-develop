import { useState, useRef, useEffect } from 'react'
import { useSite } from '../../context/SiteContext'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const { settings, setAdminOpen, setAdminAuthed } = useSite()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value === settings.adminPassword) {
      setAdminAuthed(true)
    } else {
      setError(true)
      setShake(true)
      setValue('')
      setTimeout(() => setShake(false), 500)
      setTimeout(() => setError(false), 2500)
      inputRef.current?.focus()
    }
  }

  return (
    <div className={styles.overlay}>
      <form className={`${styles.box} ${shake ? styles.shake : ''}`} onSubmit={handleSubmit}>
        <div className={styles.logo}>
          Integra<span className={styles.mark}>DEV</span>
        </div>
        <p className={styles.label}>Введите пароль для входа в панель управления</p>

        <input
          ref={inputRef}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          type="password"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="••••••••••"
          autoComplete="current-password"
        />

        {error && <p className={styles.error}>Неверный пароль</p>}

        <div className={styles.actions}>
          <button type="submit" className={styles.btn}>Войти →</button>
          <button type="button" className={styles.cancel} onClick={() => setAdminOpen(false)}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}
