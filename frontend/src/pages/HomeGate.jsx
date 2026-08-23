import { Link } from 'react-router-dom'

export default function HomeGate() {
  return (
    <main>
      <div className="gate">
        <div className="brandmid">
          <img className="mark" src="/logo.jpg" alt="MMT" />
          <b>MMT</b>
          <small>Event &amp; Wedding</small>
        </div>

        <Link className="side ev" to="/su-kien">
          <div
            className="bgart"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200')" }}
          />
          <div className="inner">
            <span className="kicker">Nhà thầu sự kiện trọn gói</span>
            <h1>SỰ KIỆN DOANH NGHIỆP</h1>
            <p>Nhà bạt 1.000 khách, sân khấu, âm thanh ánh sáng — khai trương, ra quân, hội nghị, mở bán.</p>
            <div className="metrics">
              <span><b>10+</b> Năm thi công</span>
              <span><b>300+</b> Sự kiện lớn</span>
            </div>
            <span className="go">Khám phá MMT Event →</span>
          </div>
        </Link>

        <Link className="side wd" to="/tiec-cuoi">
          <div
            className="bgart"
            style={{ backgroundImage: "url('/anh/congcuoi10.webp')" }}
          />
          <div className="inner">
            <span className="kicker">Cưới hỏi trọn gói</span>
            <h1>MINH MINH THÚY</h1>
            <p>Bàn thờ gia tiên, mâm quả, cổng hoa, rạp cưới và bàn ghế đãi tiệc — khảo sát tận nhà tại Cần Thơ.</p>
            <div className="metrics">
              <span><b>2018</b> Bắt đầu tại Cần Thơ</span>
              <span><b>Tận nơi</b> Khảo sát trước khi báo giá</span>
            </div>
            <span className="go">Khám phá Minh Minh Thúy →</span>
          </div>
        </Link>
      </div>
    </main>
  )
}
