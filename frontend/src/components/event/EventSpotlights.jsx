import { quyMoLonAnh, vnptRaQuanAnh } from '../../data/eventGallery.js'

// Điểm nhấn hai sự kiện quy mô lớn trong ProjectsList, trình bày dạng
// thẻ lớn thay vì danh sách gọn — hình thức khác hẳn, nhưng chỉ dùng lại
// đúng sự thật đã có trong ProjectsList (tên, hạng mục, số khách), không
// thêm chi tiết chưa xác nhận (giờ thi công, số nhân sự…).
//
// Ảnh: vnptRaQuan xác minh đúng — chụp trước toà nhà VNPT Cần Thơ, băng-rôn
// "Ra quân — Tuổi trẻ VNPT vì khách hàng thân yêu". quyMoLon là ảnh nhà bạt
// + đám đông ngoài trời thật của MMT nhưng chưa tìm được đúng ảnh gốc của
// dự án Nam Long — dùng ảnh minh hoạ không lộ tên khách hàng khác trong
// khung hình, tránh gán nhầm thương hiệu.
const DIEM_NHAN = [
  {
    quymo: '800 khách',
    title: 'Mở bán dự án Nam Long',
    tag: 'Ngoài trời · Nhà bạt đôi · 2025',
    anh: quyMoLonAnh,
  },
  {
    quymo: 'Cấp doanh nghiệp',
    title: 'Lễ ra quân VNPT Cần Thơ',
    tag: 'Nghi lễ · Nhà bạt · Sân khấu · 2025',
    anh: vnptRaQuanAnh,
  },
]

export default function EventSpotlights() {
  return (
    <section className="blk" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Sự kiện quy mô lớn</span>
        <h2>Đã dựng nên cho <em>những cái tên lớn</em></h2>
      </div>
      <div className="diemnhan rv">
        {DIEM_NHAN.map((d) => (
          <div className="diemnhan-the" key={d.title}>
            <div className="anh">
              <img src={d.anh.src} alt={d.anh.alt} loading="lazy" decoding="async" />
            </div>
            <div className="phu">
              <div className="quymo">{d.quymo}</div>
              <h3>{d.title}</h3>
              <div className="tag">{d.tag}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
