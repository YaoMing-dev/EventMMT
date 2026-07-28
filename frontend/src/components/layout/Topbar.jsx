import { contactInfo } from '../../data/contactInfo.js'

export default function Topbar({ view }) {
  const info = contactInfo[view] ?? contactInfo.event
  return (
    <div className="topbar">
      <div className="in">
        <span><b>MMT</b> · Một đầu mối — trọn ngày vui · Cần Thơ &amp; miền Tây</span>
        <span>Hotline / Zalo: <b>{info.phoneDisplay}</b> ({info.contactName})</span>
      </div>
    </div>
  )
}
