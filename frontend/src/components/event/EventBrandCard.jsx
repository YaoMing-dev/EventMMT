import { contactInfo, companyLegalName } from '../../data/contactInfo.js'
import { thuongHieuAnh } from '../../data/eventGallery.js'

const event = contactInfo.event

// Đối xứng với BrandCard bên trang cưới hỏi: cùng một khối "giới thiệu
// thương hiệu" trước phần liên hệ, cùng công thức bố cục (chữ trái, ảnh
// phải, ảnh ẩn trên điện thoại) — chỉ đổi tông màu và nội dung sang B2B.
//
// Danh mục lấy từ chính dữ liệu đã có trên trang (EVENT_TYPES của
// ContactForm + hạng mục hạ tầng của GuestCalculator), không bịa thêm dịch
// vụ ngoài phạm vi đã công bố.
const DANH_MUC = [
  'Nhà bạt không gian ngoài trời',
  'Sân khấu · Backdrop · Cổng chào',
  'Âm thanh · Ánh sáng · Màn LED',
  'Bàn ghế đại biểu · Tea break',
  'Khai trương · Động thổ · Ra quân',
  'Hội nghị · Hội thảo doanh nghiệp',
  'Mở bán · Sự kiện ngoài trời',
  'Cho thuê thiết bị lẻ',
]

export default function EventBrandCard() {
  return (
    <section className="blk ev-brand-blk" id="gioi-thieu">
      <div className="ev-brand rv">
        <div className="ev-brand-chu">
          <div className="ev-brand-dau">
            <img className="dau" src="/logo.jpg" alt="" width="64" height="64" />
            <div>
              <h2>{event.brand}</h2>
              <p className="ev-brand-phu">{event.tagline}</p>
            </div>
          </div>

          <span className="eyebrow" style={{ marginTop: 28, marginBottom: 16 }}>Danh mục dịch vụ</span>

          <ul className="ev-danh-muc">
            {DANH_MUC.map((muc) => <li key={muc}>{muc}</li>)}
          </ul>

          <p className="ev-brand-chan">
            Nhà thầu sự kiện của {companyLegalName} — phục vụ doanh nghiệp, ngân hàng,
            trường đại học và cơ quan nhà nước từ Cà Mau đến Long An. Đã đồng hành cùng
            VNPT, Viettel, FPT, Vietcombank, Shopee và cả Tổng Lãnh Sự Quán Ấn Độ.
          </p>
        </div>

        <figure className="ev-brand-anh">
          <img src={thuongHieuAnh.src} alt={thuongHieuAnh.alt} loading="lazy" decoding="async" />
        </figure>
      </div>
    </section>
  )
}
