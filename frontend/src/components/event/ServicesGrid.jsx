import { nhaBatAnh, khaiTruongAnh, hoiNghiAnh } from '../../data/eventGallery.js'

const SERVICES = [
  { num: '01', img: nhaBatAnh, title: 'Nhà bạt không gian & mở bán ngoài trời',
    desc: 'Hạng mục thế mạnh đặc trưng của MMT tại miền Tây — che nắng mưa tuyệt đối cho sự kiện quy mô lớn.',
    items: ['Nhà bạt sọc quy mô đến 1.000 khách', 'Quạt hơi nước, khu tea break', 'Thi công trong 48 giờ'],
    cap: 'Ảnh thực tế — Đội ngũ MMT tại hiện trường' },
  { num: '02', img: khaiTruongAnh, title: 'Lễ khai trương · Động thổ · Ra quân',
    desc: 'Kịch bản nghi thức chuẩn doanh nghiệp, chạy thử toàn bộ trước giờ G.',
    items: ['Sân khấu, backdrop, cổng chào', 'Múa lân, MC, nghi thức cắt băng', 'Kỹ thuật trực suốt buổi lễ'],
    cap: 'Ảnh dự án — Khai trương Viettien House' },
  { num: '03', img: hoiNghiAnh, title: 'Hội nghị · Hội thảo & cho thuê thiết bị',
    desc: 'Trọn gói kỹ thuật cho hội nghị trong nhà lẫn không gian mở, hoặc thuê lẻ từng hạng mục.',
    items: ['Âm thanh hội nghị, màn hình LED', 'Bàn ghế đại biểu, đón tiếp', 'Giao lắp tận nơi trong ngày'],
    cap: 'Ảnh dự án — Hội nghị khách hàng Mạnh Nông' },
]

export default function ServicesGrid() {
  return (
    <section className="blk" id="dichvu" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Năng lực</span>
        <h2>Thi công, dàn dựng &amp; <em>vận hành</em></h2>
      </div>
      <div className="svcgrid">
        {SERVICES.map((s) => (
          <div className="svc2 rv" key={s.num}>
            <div className="txt">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
              <span className="more">Xem chi tiết</span>
            </div>
            <div className="card-ph">
              <div className="img">
                <img src={s.img.src} alt={s.img.alt} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span className="num">{s.num}</span>
              <span className="cap">{s.cap}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
