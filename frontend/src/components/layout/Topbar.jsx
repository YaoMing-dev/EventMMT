import { contactInfo } from '../../data/contactInfo.js'

export default function Topbar({ view }) {
  const info = contactInfo[view] ?? contactInfo.event
  const isWedding = view === 'wedding'

  return (
    <div className="topbar">
      <div className="in">
        <span>
          {isWedding ? (
            // Minh Minh Thúy đứng tên trước ở mảng cưới hỏi — đây là dòng đầu
            // tiên của trang, không được đọc ra như nhãn phụ của MMT.
            <><b>Minh Minh Thúy</b> · Cưới hỏi trọn gói · Cần Thơ</>
          ) : (
            <><b>MMT</b> · Một đầu mối — trọn ngày vui · Cần Thơ &amp; miền Tây</>
          )}
        </span>
        <span>Hotline / Zalo: <b>{info.phoneDisplay}</b> ({info.contactName})</span>
      </div>
    </div>
  )
}
