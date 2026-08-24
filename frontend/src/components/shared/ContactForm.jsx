import { useState } from 'react'

// Backend Render (goi free) co the vua thuc day tu trang thai ngu — lan goi
// dau tien doi khi rot mang ngay truoc khi ket noi kip. Thu lai 1 lan la du
// de khach khong phai tu bam gui lan hai.
async function postLead(payload) {
  try {
    return await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    return fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }
}

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

export default function ContactForm({ variant }) {
  const isEvent = variant === 'event'
  const [subtype, setSubtype] = useState(isEvent ? EVENT_TYPES[0] : WEDDING_TYPES[0])
  const [eventDate, setEventDate] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success

  async function handleSubmit(e) {
    e.preventDefault()
    const clientErrors = {}
    if (!phone.trim()) clientErrors.phone = 'Vui lòng nhập số điện thoại'
    if (!eventDate) clientErrors.eventDate = 'Vui lòng chọn ngày dự kiến'
    if (!email.trim()) clientErrors.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) clientErrors.email = 'Email không hợp lệ'
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
      // Trang cưới hỏi không còn chia theo tông màu — nội dung chia theo
      // thời điểm trong ngày. Cột toneColor giữ nguyên ở backend, để trống.
      toneColor: null,
      phone,
      email: email.trim() || null,
    }

    try {
      const response = await postLead(payload)
      if (response.ok) {
        setStatus('success')
        setPhone('')
        setEmail('')
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
    <form className={isEvent ? 'cform rv' : 'cform'} onSubmit={handleSubmit} noValidate>
      <label>{isEvent ? 'Loại sự kiện' : 'Loại lễ'}</label>
      <select value={subtype} onChange={(e) => setSubtype(e.target.value)}>
        {(isEvent ? EVENT_TYPES : WEDDING_TYPES).map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <label htmlFor={`${variant}-event-date`}>{isEvent ? 'Ngày dự kiến' : 'Ngày lành dự kiến'}</label>
      <input id={`${variant}-event-date`} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      {errors.eventDate && <div className="note loi-nhap">{errors.eventDate}</div>}

      {isEvent && (
        <>
          <label>Số khách (ước tính)</label>
          <input type="number" placeholder="Ví dụ: 300" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} />
        </>
      )}

      <label>Số điện thoại của bạn</label>
      <input
        type="tel"
        placeholder="Để MMT gọi lại tư vấn"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      {errors.phone && <div className="note loi-nhap">{errors.phone}</div>}

      <label>Email của bạn</label>
      <input
        type="email"
        placeholder="Để MMT gửi mail xác nhận"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <div className="note loi-nhap">{errors.email}</div>}

      {errors.general && <div className="note loi-nhap">{errors.general}</div>}
      {Object.entries(errors)
        .filter(([field]) => field !== 'phone' && field !== 'eventDate' && field !== 'email' && field !== 'general')
        .map(([field, message]) => (
          <div className="note loi-nhap" key={field}>{message}</div>
        ))}

      <button className="btn gold" type="submit" disabled={status === 'submitting'}>
        {isEvent ? 'Gửi yêu cầu báo giá' : 'Giữ lịch & nhận báo giá'}
      </button>

      {status === 'success' && <div className="note">Đã gửi yêu cầu — MMT sẽ liên hệ lại sớm nhất.</div>}
      <div className="note">Chỉ vài thông tin — không cần điền dài dòng.</div>
    </form>
  )
}
