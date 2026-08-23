import { contactInfo, companyLegalName } from '../../data/contactInfo.js'

export default function Footer({ view }) {
  const info = contactInfo[view] ?? contactInfo.event
  const isWedding = view === 'wedding'

  return (
    <footer>
      <div className="foot">
        <div>
          <div className="brand">{isWedding ? info.brand : 'MMT Event & Wedding'}</div>
          <p style={{ marginTop: 10 }}>
            {isWedding ? (
              <>
                Cưới hỏi trọn gói — gia tiên, mâm quả, cổng cưới, rạp và đãi tiệc.<br />
                Thương hiệu thuộc {companyLegalName}.
              </>
            ) : (
              <>
                Một đầu mối — trọn ngày vui.<br />
                Tổ chức sự kiện · Lễ hội · Cưới hỏi trọn gói<br />
                Cần Thơ &amp; các tỉnh miền Tây
              </>
            )}
          </p>
        </div>
        <div>
          <h4>Liên hệ</h4>
          Hotline / Zalo: {info.phoneDisplay} ({info.contactName})<br />
          {info.email && <>Email: <a href={`mailto:${info.email}`}>{info.email}</a><br /></>}
          Facebook: <a href={info.facebookUrl} target="_blank" rel="noopener noreferrer">{info.facebookLabel}</a><br />
          mmtevent-wedding.com
        </div>
        <div>
          <h4>{info.street ? 'Địa chỉ' : 'Dịch vụ'}</h4>
          {info.street ? (
            <>
              {info.street}<br />
              {info.locality}<br />
              Giờ mở cửa: {info.hours}<br />
              <a href={info.mapsUrl} target="_blank" rel="noopener noreferrer">Xem trên Google Maps</a>
            </>
          ) : (
            <>
              Nhà bạt không gian · Sân khấu · Âm thanh<br />Trang trí gia tiên · Đãi tiệc tại nhà
            </>
          )}
        </div>
      </div>
      <div className="sub">© 2026 {companyLegalName}.</div>
    </footer>
  )
}
