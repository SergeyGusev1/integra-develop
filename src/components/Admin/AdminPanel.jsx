import { useState } from 'react'
import { useSite } from '../../context/SiteContext'
import { defaultContent } from '../../data/defaultContent'
import styles from './AdminPanel.module.css'

function Field({ label, value, onChange, multiline, full, placeholder, type = 'text' }) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
      <label className={styles.fieldLabel}>{label}</label>
      {multiline ? (
        <textarea
          className={`${styles.fieldInput} ${styles.fieldTextarea}`}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={styles.fieldInput}
          type={type}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}

function Accordion({ title, open, onToggle, children }) {
  return (
    <div className={styles.accordionItem}>
      <div
        className={`${styles.accordionHeader} ${open ? styles.accordionHeaderOpen : ''}`}
        onClick={onToggle}
      >
        <span className={styles.accordionTitle}>{title}</span>
        <span className={`${styles.accordionArrow} ${open ? styles.accordionArrowOpen : ''}`}>▼</span>
      </div>
      {open && <div className={styles.accordionBody}>{children}</div>}
    </div>
  )
}

export default function AdminPanel() {
  const {
    content, updateContent,
    settings, updateSettings,
    submissions, clearSubmissions,
    setAdminOpen, setAdminAuthed,
  } = useSite()

  const closePanel = () => {
    setAdminOpen(false)
    setAdminAuthed(false)
  }

  const [tab, setTab] = useState('content')
  const [openSection, setOpenSection] = useState('company')
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(content)))
  const [settingsDraft, setSettingsDraft] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

  const set = (path, value) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const parts = path.split('.')
      let cur = next
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
      cur[parts[parts.length - 1]] = value
      return next
    })
  }

  const save = () => {
    updateContent(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const saveSettings = () => {
    updateSettings(settingsDraft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetToDefaults = () => {
    if (window.confirm('Сбросить весь контент к исходным значениям?')) {
      const fresh = JSON.parse(JSON.stringify(defaultContent))
      setDraft(fresh)
    }
  }

  const toggle = (key) => setOpenSection(prev => prev === key ? null : key)

  const tabs = [
    { key: 'content', label: 'Контент' },
    { key: 'submissions', label: `Заявки${submissions.length ? ` (${submissions.length})` : ''}` },
    { key: 'settings', label: 'Настройки' },
  ]

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>
          Integra<span className={styles.headerMark}>DEV</span>
          <span className={styles.headerSub}>Панель управления</span>
        </span>
        <button className={styles.headerClose} onClick={closePanel}>
          Закрыть ✕
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.sidebar}>
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.sideTab} ${tab === key ? styles.sideTabActive : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.main}>

          {/* CONTENT TAB */}
          {tab === 'content' && (
            <>
              <div className={styles.accordion}>

                <Accordion title="Компания" open={openSection === 'company'} onToggle={() => toggle('company')}>
                  <div className={styles.fieldGrid}>
                    <Field label="Город" value={draft.company.city} onChange={v => set('company.city', v)} />
                    <Field label="Год основания" value={draft.company.year} onChange={v => set('company.year', v)} />
                    <Field label="Размер команды" value={draft.company.teamSize} onChange={v => set('company.teamSize', v)} />
                    <Field label="Кол-во проектов" value={draft.company.projectsCount} onChange={v => set('company.projectsCount', v)} />
                    <Field label="Email" value={draft.company.email} onChange={v => set('company.email', v)} />
                    <Field label="Telegram" value={draft.company.telegram} onChange={v => set('company.telegram', v)} />
                    <Field label="Telegram URL" value={draft.company.telegramUrl} onChange={v => set('company.telegramUrl', v)} />
                    <Field label="Телефон" value={draft.company.phone} onChange={v => set('company.phone', v)} />
                    <Field label="Адрес" value={draft.company.address} onChange={v => set('company.address', v)} full />
                    <Field label="Описание в футере" value={draft.company.footerDesc} onChange={v => set('company.footerDesc', v)} multiline full />
                  </div>
                </Accordion>

                <Accordion title="Главная страница" open={openSection === 'hero'} onToggle={() => toggle('hero')}>
                  <div className={styles.fieldGrid}>
                    <Field label="Заголовок — строка 1" value={draft.hero.titleLine1} onChange={v => set('hero.titleLine1', v)} />
                    <Field label="Строка 2 (акцент цветом)" value={draft.hero.titleLine2} onChange={v => set('hero.titleLine2', v)} />
                    <Field label="Строка 3" value={draft.hero.titleLine3} onChange={v => set('hero.titleLine3', v)} />
                    <Field label="Строка 4" value={draft.hero.titleLine4} onChange={v => set('hero.titleLine4', v)} />
                    <Field label="Подзаголовок" value={draft.hero.subtitle} onChange={v => set('hero.subtitle', v)} multiline full />
                  </div>
                  <div className={styles.subLabel}>Статистика</div>
                  {draft.hero.stats.map((s, i) => (
                    <div key={i} className={styles.arrayItem}>
                      <span className={styles.arrayItemNum}>Блок {i + 1}</span>
                      <div className={styles.fieldGrid}>
                        <Field label="Число" value={String(s.num)} onChange={v => set(`hero.stats.${i}.num`, parseInt(v) || 0)} />
                        <Field label="Суффикс (+, %, ...)" value={s.suffix} onChange={v => set(`hero.stats.${i}.suffix`, v)} />
                        <Field label="Подпись" value={s.label} onChange={v => set(`hero.stats.${i}.label`, v)} full />
                      </div>
                    </div>
                  ))}
                </Accordion>

                <Accordion title="Заголовки разделов" open={openSection === 'sections'} onToggle={() => toggle('sections')}>
                  {Object.entries({
                    services: 'Услуги',
                    about: 'О студии',
                    process: 'Процесс',
                    contact: 'Контакты',
                  }).map(([key, label]) => (
                    <div key={key}>
                      <div className={styles.subLabel}>{label}</div>
                      <div className={styles.fieldGrid}>
                        <Field label="Надпись над заголовком" value={draft.sections[key].eyebrow} onChange={v => set(`sections.${key}.eyebrow`, v)} />
                        <Field label="Заголовок" value={draft.sections[key].title} onChange={v => set(`sections.${key}.title`, v)} />
                        {draft.sections[key].desc !== undefined && (
                          <Field label="Описание" value={draft.sections[key].desc} onChange={v => set(`sections.${key}.desc`, v)} multiline full />
                        )}
                      </div>
                    </div>
                  ))}
                </Accordion>

                <Accordion title="Услуги" open={openSection === 'services'} onToggle={() => toggle('services')}>
                  {draft.services.map((svc, i) => (
                    <div key={i} className={styles.arrayItem}>
                      <span className={styles.arrayItemNum}>{svc.num}</span>
                      <div className={styles.fieldGrid}>
                        <Field label="Номер / категория" value={svc.num} onChange={v => set(`services.${i}.num`, v)} />
                        <Field label="Название" value={svc.name} onChange={v => set(`services.${i}.name`, v)} />
                        <Field label="Описание" value={svc.desc} onChange={v => set(`services.${i}.desc`, v)} multiline full />
                        <Field label="Технологии / теги" value={svc.tag} onChange={v => set(`services.${i}.tag`, v)} full />
                      </div>
                    </div>
                  ))}
                </Accordion>

                <Accordion title="О студии" open={openSection === 'about'} onToggle={() => toggle('about')}>
                  <div className={styles.fieldGrid}>
                    <Field label="Вводный текст" value={draft.about.lead} onChange={v => set('about.lead', v)} multiline full />
                  </div>
                  <div className={styles.subLabel}>Ценности</div>
                  {draft.about.values.map((v, i) => (
                    <div key={i} className={styles.arrayItem}>
                      <span className={styles.arrayItemNum}>{v.num}</span>
                      <div className={styles.fieldGrid}>
                        <Field label="Номер" value={v.num} onChange={val => set(`about.values.${i}.num`, val)} />
                        <Field label="Заголовок" value={v.title} onChange={val => set(`about.values.${i}.title`, val)} />
                        <Field label="Текст" value={v.text} onChange={val => set(`about.values.${i}.text`, val)} multiline full />
                      </div>
                    </div>
                  ))}
                </Accordion>

                <Accordion title="Процесс" open={openSection === 'process'} onToggle={() => toggle('process')}>
                  {draft.process.map((step, i) => (
                    <div key={i} className={styles.arrayItem}>
                      <span className={styles.arrayItemNum}>{step.num}</span>
                      <div className={styles.fieldGrid}>
                        <Field label="Этап" value={step.num} onChange={v => set(`process.${i}.num`, v)} />
                        <Field label="Название" value={step.name} onChange={v => set(`process.${i}.name`, v)} />
                        <Field label="Описание" value={step.desc} onChange={v => set(`process.${i}.desc`, v)} multiline full />
                      </div>
                    </div>
                  ))}
                </Accordion>

              </div>

              <div className={styles.saveBar}>
                <button className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`} onClick={save}>
                  {saved ? 'Сохранено ✓' : 'Сохранить изменения'}
                </button>
                <button className={styles.resetBtn} onClick={resetToDefaults}>
                  Сбросить к исходным
                </button>
              </div>
            </>
          )}

          {/* SUBMISSIONS TAB */}
          {tab === 'submissions' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h2 className={styles.pageTitle}>Заявки</h2>
                  <div className={styles.pageCount}>{submissions.length} записей</div>
                </div>
                {submissions.length > 0 && (
                  <button
                    className={styles.dangerBtn}
                    onClick={() => window.confirm('Удалить все заявки?') && clearSubmissions()}
                  >
                    Очистить все
                  </button>
                )}
              </div>

              {submissions.length === 0 ? (
                <div className={styles.empty}>Заявок пока нет</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Имя</th>
                      <th>Контакт</th>
                      <th>Компания</th>
                      <th>Бюджет</th>
                      <th>Задача</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s, i) => (
                      <tr key={i}>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)', fontSize: 12 }}>{s.date}</td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.contact}</td>
                        <td>{s.company || '—'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{s.budget || '—'}</td>
                        <td style={{ maxWidth: 220 }}>{s.message || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === 'settings' && (
            <div className={styles.settingsWrap}>
              <div className={styles.pageHeader} style={{ marginBottom: 24 }}>
                <h2 className={styles.pageTitle}>Настройки</h2>
              </div>

              <p className={styles.settingsDesc}>
                Настройте Telegram-бота для получения уведомлений о новых заявках.
                Как получить Chat ID: напишите <strong>@userinfobot</strong> в Telegram — он ответит вашим ID.
              </p>

              <div className={styles.settingsFields}>
                <Field
                  label="Telegram Bot Token"
                  value={settingsDraft.telegramToken}
                  onChange={v => setSettingsDraft(p => ({ ...p, telegramToken: v }))}
                  placeholder="1234567890:AAF..."
                  full
                />
                <p className={styles.tip}>Создайте бота через @BotFather и скопируйте токен.</p>

                <Field
                  label="Telegram Chat ID"
                  value={settingsDraft.telegramChatId}
                  onChange={v => setSettingsDraft(p => ({ ...p, telegramChatId: v }))}
                  placeholder="123456789"
                  full
                />
                <p className={styles.tip}>Ваш личный Chat ID или ID группы, куда будут приходить заявки.</p>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, marginTop: 8 }} />

                <Field
                  label="Пароль для входа в админ-панель"
                  value={settingsDraft.adminPassword}
                  onChange={v => setSettingsDraft(p => ({ ...p, adminPassword: v }))}
                  placeholder="Новый пароль"
                  type="password"
                  full
                />
                <p className={styles.tip}>Текущий пароль по умолчанию: <strong>integra2022</strong></p>
              </div>

              <div className={styles.saveBar}>
                <button className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`} onClick={saveSettings}>
                  {saved ? 'Сохранено ✓' : 'Сохранить настройки'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
