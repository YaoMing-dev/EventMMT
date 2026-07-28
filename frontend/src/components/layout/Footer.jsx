import { contactInfo } from '../../data/contactInfo.js'

export default function Footer({ view }) {
  const info = contactInfo[view] ?? contactInfo.event
  return (
    <footer>
      <div className="foot">
        <div>
          <div className="brand">MMT Event &amp; Wedding</div>
          <p style={{ marginTop: 10 }}>
            Một đầu mối — trọn ngày vui.<br />
            Tổ chức sự kiện · Lễ hội · Cưới hỏi trọn gói<br />
            Cần Thơ &amp; các tỉnh miền Tây
          </p>
        </div>
        <div>
          <h4>Liên hệ</h4>
          Hotline / Zalo: {info.phoneDisplay} ({info.contactName})<br />
          Facebook: <a href={info.facebookUrl} target="_blank" rel="noopener noreferrer">{view === 'wedding' ? 'Cưới hỏi trọn gói Minh Thúy' : 'Tổ chức sự kiện lễ hội Cần Thơ'}</a><br />
          mmtevent-wedding.com
        </div>
        <div>
          <h4>Dịch vụ</h4>
          Nhà bạt không gian · Sân khấu · Âm thanh<br />Trang trí gia tiên · Đãi tiệc tại nhà
        </div>
      </div>
      <div className="sub">© 2026 MMT — Bản dựng: khung ảnh dùng ảnh thật từ thư viện MMT.</div>
    </footer>
  )
}
