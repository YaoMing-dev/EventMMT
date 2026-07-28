import { useState } from 'react'

const EVENT_TYPES = [
  'Khai trương / Động thổ / Ra quân',
  'Hội nghị / Hội thảo',
  'Mở bán / Sự kiện ngoài trời',
  'Thuê thiết bị lẻ',
]

const WEDDING_TYPES = [
  'Lễ Vu Quy (nhà gái)',
  'Lễ Tân Hôn (nhà trai)',
  'Đám hỏi',
  'Tiệc báo hỷ tại nhà',
]

const TONE_OPTIONS = [
  ['son', 'Son — đỏ truyền thống'],
  ['dao', 'Đào — hồng hiện đại'],
  ['kem', 'Kem — tối giản'],
  ['ngoc', 'Ngọc — xanh khác biệt'],
  ['', 'Chưa biết, cần tư vấn'],
]

export default function ContactForm({ variant }) {
  const isEvent = variant === 'event'
  const [subtype, setSubtype] = useState(isEvent ? EVENT_TYPES[0] : WEDDING_TYPES[0])
  const [eventDate, setEventDate] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [toneColor, setToneColor] = useState(TONE_OPTIONS[0][0])
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success

  async function handleSubmit(e) {
    e.preventDefault()
    const clientErrors = {}
    if (!phone.trim()) clientErrors.phone = 'Vui lòng nhập số điện thoại'
    if (!eventDate) clientErrors.eventDate = 'Vui lòng chọn ngày dự kiến'
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }
    setErrors({})
    setStatus('submitting')

    const payload = {
      category: isEvent ? 'EVENT' : 'WEDDING',
      subtype,
      eventDate: eventDate || null,
      guestCount: isEvent ? (guestCount ? Number(guestCount) : null) : null,
      toneColor: isEvent ? null : (toneColor || null),
      phone,
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        setStatus('success')
        setPhone('')
      } else {
        const fieldErrors = await response.json()
        setErrors(fieldErrors)
        setStatus('idle')
      }
    } catch {
      setErrors({ general: 'Không gửi được yêu cầu, vui lòng thử lại.' })
      setStatus('idle')
    }
  }

  return (
    <form className="cform rv" onSubmit={handleSubmit}>
      <label>{isEvent ? 'Loại sự kiện' : 'Loại lễ'}</label>
      <select value={subtype} onChange={(e) => setSubtype(e.target.value)}>
        {(isEvent ? EVENT_TYPES : WEDDING_TYPES).map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <label htmlFor={`${variant}-event-date`}>{isEvent ? 'Ngày dự kiến' : 'Ngày lành dự kiến'}</label>
      <input id={`${variant}-event-date`} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      {errors.eventDate && <div className="note" style={{ color: 'var(--accent)' }}>{errors.eventDate}</div>}

      {isEvent ? (
        <>
          <label>Số khách (ước tính)</label>
          <input type="number" placeholder="Ví dụ: 300" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} />
        </>
      ) : (
        <>
          <label>Tông màu yêu thích</label>
          <select value={toneColor} onChange={(e) => setToneColor(e.target.value)}>
            {TONE_OPTIONS.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
          </select>
        </>
      )}

      <label>Số điện thoại của bạn</label>
      <input
        type="tel"
        placeholder="Để MMT gọi lại tư vấn"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      {errors.phone && <div className="note" style={{ color: 'var(--accent)' }}>{errors.phone}</div>}
      {errors.general && <div className="note" style={{ color: 'var(--accent)' }}>{errors.general}</div>}
      {Object.entries(errors)
        .filter(([field]) => field !== 'phone' && field !== 'eventDate' && field !== 'general')
        .map(([field, message]) => (
          <div className="note" style={{ color: 'var(--accent)' }} key={field}>{message}</div>
        ))}

      <button className="btn gold" type="submit" disabled={status === 'submitting'}>
        {isEvent ? 'Gửi yêu cầu báo giá' : 'Giữ lịch & nhận báo giá'}
      </button>

      {status === 'success' && <div className="note">Đã gửi yêu cầu — MMT sẽ liên hệ lại sớm nhất.</div>}
      <div className="note">Chỉ 4 thông tin — không cần điền dài dòng.</div>
    </form>
  )
}
