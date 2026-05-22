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
  const { content, settings, addSubmission, t } = useSite()
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
    { label: t('contact.email'), val: company.email, href: `mailto:${company.email}` },
    { label: t('contact.telegram'), val: company.telegram, href: company.telegramUrl },
    { label: t('contact.phone'), val: company.phone, href: `tel:${company.phone.replace(/\D/g, '')}` },
    { label: t('contact.office'), val: company.address, href: '#' },
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
            <a key={c.label} href={c.href} className={styles.contactItem} data-fx="contact-item">
              <span className={styles.contactLabel}>{c.label}</span>
              <span className={styles.contactVal}>{c.val}</span>
              <span className={styles.contactArrow}>→</span>
            </a>
          ))}
        </div>

        <form className={`${styles.form} reveal`} onSubmit={onSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('contact.lblName')}</label>
              <input className={styles.formInput} name="name" type="text" placeholder={t('contact.phName')} value={form.name} onChange={onChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('contact.lblContact')}</label>
              <input className={styles.formInput} name="contact" type="text" placeholder={t('contact.phContact')} value={form.contact} onChange={onChange} required />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('contact.lblCompany')}</label>
            <input className={styles.formInput} name="company" type="text" placeholder={t('contact.phCompany')} value={form.company} onChange={onChange} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('contact.lblBudget')}</label>
            <input className={styles.formInput} name="budget" type="text" placeholder={t('contact.phBudget')} value={form.budget} onChange={onChange} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('contact.lblMessage')}</label>
            <textarea className={`${styles.formInput} ${styles.textarea}`} name="message" placeholder={t('contact.phMessage')} value={form.message} onChange={onChange} />
          </div>
          <button type="submit" className={`${styles.submit} ${submitted ? styles.submitDone : ''}`} data-magnetic>
            {submitted ? t('contact.submitDone') : <><span>{t('contact.submit')}</span> <span>→</span></>}
          </button>
        </form>
      </div>
    </section>
  )
}
