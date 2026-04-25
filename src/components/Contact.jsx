import { useState } from 'react'
import { useSite } from '../context/SiteContext'
import { useReveal } from '../hooks/useReveal'
import styles from './Contact.module.css'

async function sendToTelegram(token, chatId, data) {
  const text =
    `🆕 Новая заявка с сайта\n\n` +
    `👤 Имя: ${data.name}\n` +
    `📱 Контакт: ${data.contact}\n` +
    `🏢 Компания: ${data.company || '—'}\n` +
    `💰 Бюджет: ${data.budget || '—'}\n` +
    `📝 Задача:\n${data.message || '—'}\n\n` +
    `⏰ ${data.date}`

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

export default function Contact() {
  const { content, settings, addSubmission } = useSite()
  const { company, sections } = content
  const s = sections.contact
  const sectionRef = useReveal()

  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', company: '', budget: '', message: '' })

  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const entry = { ...form, date: new Date().toLocaleString('ru-RU') }
    addSubmission(entry)

    if (settings.telegramToken && settings.telegramChatId) {
      try {
        await sendToTelegram(settings.telegramToken, settings.telegramChatId, entry)
      } catch {
        // silent — submission already saved locally
      }
    }

    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', contact: '', company: '', budget: '', message: '' })
    }, 3500)
  }

  const contactItems = [
    { label: 'Email', val: company.email, href: `mailto:${company.email}` },
    { label: 'Telegram', val: company.telegram, href: company.telegramUrl },
    { label: 'Телефон', val: company.phone, href: `tel:${company.phone.replace(/\D/g, '')}` },
    { label: 'Офис', val: company.address, href: '#' },
  ]

  return (
    <section id="contact" className={styles.section} ref={sectionRef}>
      <div className={`${styles.sectionHead} reveal`}>
        <div>
          <span className={styles.eyebrow}>{s.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{s.title}</h2>
        </div>
        <p className={styles.sectionDesc}>{s.desc}</p>
      </div>

      <div className={styles.wrap}>
        <div className={`${styles.info} reveal`}>
          {contactItems.map(c => (
            <a key={c.label} href={c.href} className={styles.contactItem}>
              <span className={styles.contactLabel}>{c.label}</span>
              <span className={styles.contactVal}>{c.val}</span>
              <span className={styles.contactArrow}>→</span>
            </a>
          ))}
        </div>

        <form className={`${styles.form} reveal`} onSubmit={onSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Имя</label>
              <input className={styles.formInput} name="name" type="text" placeholder="Иван Иванов" value={form.name} onChange={onChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Контакт</label>
              <input className={styles.formInput} name="contact" type="text" placeholder="Email или Telegram" value={form.contact} onChange={onChange} required />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Компания</label>
            <input className={styles.formInput} name="company" type="text" placeholder="ООО «Ваша компания»" value={form.company} onChange={onChange} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Бюджет проекта</label>
            <input className={styles.formInput} name="budget" type="text" placeholder="500 000 — 2 000 000 ₽" value={form.budget} onChange={onChange} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Опишите задачу</label>
            <textarea className={`${styles.formInput} ${styles.textarea}`} name="message" placeholder="Кратко о проекте, целях и сроках..." value={form.message} onChange={onChange} />
          </div>
          <button type="submit" className={`${styles.submit} ${submitted ? styles.submitDone : ''}`}>
            {submitted ? 'Заявка отправлена ✓' : <><span>Отправить заявку</span> <span>→</span></>}
          </button>
        </form>
      </div>
    </section>
  )
}
