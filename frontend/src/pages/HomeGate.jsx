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
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200')" }}
          />
          <div className="inner">
            <span className="kicker">Trang trí cưới hỏi trọn gói</span>
            <h1>TIỆC CƯỚI &amp; GIA ĐÌNH</h1>
            <p>Cổng hoa, bàn gia tiên, rèm đèn và đãi tiệc tại nhà — giá công khai từ 6,9 triệu.</p>
            <div className="metrics">
              <span><b>4</b> Bộ sưu tập tông màu</span>
              <span><b>6,9tr</b> Gói trọn gói từ</span>
            </div>
            <span className="go">Khám phá MMT Wedding →</span>
          </div>
        </Link>
      </div>
    </main>
  )
}
