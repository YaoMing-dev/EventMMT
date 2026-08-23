// Điểm nhấn hai sự kiện quy mô lớn nhất trong ProjectsList, trình bày dạng
// thẻ lớn thay vì danh sách gọn — hình thức khác hẳn, nhưng chỉ dùng lại
// đúng sự thật đã có trong ProjectsList (tên, hạng mục, số khách), không
// thêm chi tiết chưa xác nhận (giờ thi công, số nhân sự…).
const DIEM_NHAN = [
  {
    quymo: '800 khách',
    title: 'Mở bán dự án Nam Long',
    tag: 'Ngoài trời · Nhà bạt đôi · 2025',
    imgIndex: 4,
  },
  {
    quymo: 'Cấp doanh nghiệp',
    title: 'Lễ ra quân VNPT Cần Thơ',
    tag: 'Nghi lễ · Nhà bạt · Sân khấu · 2025',
    imgIndex: 5,
  },
]

export default function EventSpotlights({ images = [] }) {
  return (
    <section className="blk" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Sự kiện quy mô lớn</span>
        <h2>Đã dựng nên cho <em>những cái tên lớn</em></h2>
      </div>
      <div className="diemnhan rv">
        {DIEM_NHAN.map((d) => {
          const anh = images[d.imgIndex]
          return (
            <div className="diemnhan-the" key={d.title}>
              {anh && (
                <div className="anh">
                  <img src={anh.url} alt={anh.filename} loading="lazy" decoding="async" />
                </div>
              )}
              <div className="phu">
                <div className="quymo">{d.quymo}</div>
                <h3>{d.title}</h3>
                <div className="tag">{d.tag}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
