import { useState } from 'react'

function specsFor(guests) {
  if (guests <= 300) {
    return {
      tent: 'Khẩu độ 10m · Diện tích ~250m²',
      led: 'Màn LED P3.91 · Kích thước 15m²',
      audio: 'Hệ thống Sub/Full 6.000W chuẩn hội nghị',
      time: 'Bàn giao trước G-12 giờ (Thi công 18h)',
    }
  }
  if (guests <= 700) {
    return {
      tent: 'Khẩu độ 12m - 15m · Diện tích ~500m²',
      led: 'Màn LED P3.91 · Kích thước 24m² - 30m²',
      audio: 'Line Array 8 Sub 12 Full ngoài trời',
      time: 'Bàn giao trước G-24 giờ (Thi công 24h)',
    }
  }
  return {
    tent: 'Khẩu độ 18m - 20m · Diện tích ~900m² - 1200m²',
    led: 'Màn LED P3.91 · Kích thước 40m² + 2 Màn phụ',
    audio: 'Hệ thống Line Array công suất lớn 20.000W',
    time: 'Bàn giao trước G-24 giờ (Thi công 48h)',
  }
}

export default function GuestCalculator() {
  const [guests, setGuests] = useState(500)
  const specs = specsFor(guests)

  return (
    <>
      <div className="guest-calculator rv">
        <div className="calc-header">
          <span>Quy mô sự kiện dự kiến:</span>
          <b>{guests} Khách</b>
        </div>
        <input
          type="range"
          role="slider"
          min="100"
          max="1200"
          step="100"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        />
        <div className="range-labels">
          <span>100 khách</span>
          <span>500 khách</span>
          <span>1.000+ khách</span>
        </div>
      </div>
      <div className="specs-grid rv">
        <div className="spec-card">
          <div className="spec-info">
            <small>HỆ THỐNG NHÀ BẠT</small>
            <h3>{specs.tent}</h3>
            <p>Bạt 2 lớp chống nóng cách nhiệt, khung truss hợp kim nhôm chịu lực ngoài trời.</p>
          </div>
        </div>
        <div className="spec-card">
          <div className="spec-info">
            <small>MÀN HÌNH LED OUTDOOR</small>
            <h3>{specs.led}</h3>
            <p>Độ sáng cao ngoài trời, hệ thống cabin nhôm đúc siêu nhẹ, processor chuẩn HD.</p>
          </div>
        </div>
        <div className="spec-card">
          <div className="spec-info">
            <small>ÂM THANH &amp; ÁNH SÁNG</small>
            <h3>{specs.audio}</h3>
            <p>Hệ thống loa Line Array công suất lớn, Mixer Digital 32 kênh, đèn Beam 350W.</p>
          </div>
        </div>
        <div className="spec-card highlight">
          <div className="spec-info">
            <small>TIMELINE THI CÔNG CAM KẾT</small>
            <h3>{specs.time}</h3>
            <p>Thi công trong 24h. Đội ngũ trực kỹ thuật suốt thời gian diễn ra sự kiện.</p>
          </div>
        </div>
      </div>
    </>
  )
}
