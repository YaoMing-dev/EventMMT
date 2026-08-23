import { contactInfo, companyLegalName } from '../../data/contactInfo.js'

const wedding = contactInfo.wedding

// Dựng lại từ banner thương hiệu (images/wedding/branding.jpg) bằng chữ sống
// thay vì nhúng file JPG: Google đọc được danh mục, trình đọc màn hình đọc
// được, chữ tự xuống dòng trên điện thoại, và NAP lấy từ contactInfo.js nên
// không thể lệch với JSON-LD như địa chỉ in trong ảnh.
//
// Đã lược nhóm B2B trên banner — hội nghị, khai trương, khởi công, lễ kỷ
// niệm, khánh thành, tất niên, lễ ra mắt sản phẩm, dù sự kiện. Đó là danh
// mục của mảng sự kiện; đưa vào đây là hai thương hiệu giành từ khoá của
// nhau. Chờ chủ chốt rồi bổ sung sau nếu cần.
const DANH_MUC = [
  'Tiệc cưới · Đính hôn · Lễ gia tiên',
  'Trang trí tại nhà và tại nhà hàng',
  'Sinh nhật · Thôi nôi · Đầy tháng',
  'Xe hoa · Cổng cưới · Cổng phao',
  'Nhà khách · Bàn ghế · Sân khấu',
  'Mâm quả · Đội ngũ bê tráp',
  'Âm thanh · Ánh sáng',
  'Band nhạc biểu diễn & hoà tấu',
]

export default function BrandCard() {
  return (
    <section className="khoi noi nen-2" id="gioi-thieu">
      <div className="truc">
        <div className="hieu len">
          <div className="hieu-chu">
            <div className="hieu-dau">
              <img className="dau" src="/logo.jpg" alt="" width="128" height="128" />
              <div>
                <h2>{wedding.brand}</h2>
                <p className="hieu-phu">Dịch vụ cưới hỏi, đám tiệc trang trí trọn gói</p>
              </div>
            </div>

            <div className="gach-doi"><span>Danh mục dịch vụ</span></div>

            <ul className="danh-muc">
              {DANH_MUC.map((muc) => <li key={muc}>{muc}</li>)}
            </ul>

            <p className="hieu-chan">
              Thương hiệu cưới hỏi của {companyLegalName} — phục vụ TP Cần Thơ và vùng lân cận từ 2018.
            </p>
          </div>

          {/* Ảnh chỉ hiện từ 861px trở lên; điện thoại đổ về một cột chữ. */}
          <figure className="hieu-anh">
            <img
              src="/anh/congcuoi10.webp"
              alt="Bàn tiệc gia tiên trải khăn xanh trước backdrop rèm đỏ và chữ Hỷ mạ vàng do Minh Minh Thúy dựng"
              width="1066"
              height="1600"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </section>
  )
}
