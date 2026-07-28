import { Link } from 'react-router-dom'

export default function Header({ view }) {
  const isEvent = view === 'event'
  return (
    <header role="banner">
      <div className="nav">
        <Link className="logo" to="/">
          <img className="mark" src="/logo.jpg" alt="MMT" />
          <span>
            <b>MMT {isEvent ? 'Event' : 'Wedding'}</b>
            <small>{isEvent ? 'Tổ chức sự kiện miền Tây' : 'by Minh Minh Thúy'}</small>
          </span>
        </Link>
        <nav>
          {isEvent ? (
            <ul>
              <li><a href="#quymo">Quy mô</a></li>
              <li><a href="#duan">Dự án</a></li>
              <li><a href="#dichvu">Dịch vụ</a></li>
              <li><a href="#quytrinh">Quy trình</a></li>
              <li><a href="#lienhe">Liên hệ</a></li>
            </ul>
          ) : (
            <ul>
              <li><a href="#tongmau">Bộ sưu tập</a></li>
              <li><a href="#banggia">Bảng giá</a></li>
              <li><a href="#album">Album</a></li>
              <li><a href="#lienhe-cuoi">Liên hệ</a></li>
            </ul>
          )}
        </nav>
        <div className="nav-right">
          {isEvent ? (
            <Link className="crosslink" to="/tiec-cuoi">Tiệc cưới — Đám hỏi</Link>
          ) : (
            <Link className="crosslink" to="/su-kien">Sự kiện doanh nghiệp</Link>
          )}
          <a className="btn gold" href={isEvent ? '#lienhe' : '#lienhe-cuoi'}>Nhận báo giá</a>
        </div>
      </div>
    </header>
  )
}
