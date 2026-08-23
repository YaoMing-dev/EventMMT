import { partners, partnersBasePath } from '../../data/partners.js'

// Dải logo chạy ngang liên tục — animation "trusted by" kiểu nhiều website
// doanh nghiệp hay dùng. Logo thật do công ty cung cấp (xem partners.js),
// đối chiếu được với fanpage Facebook của mảng sự kiện.
//
// Chia hai hàng chạy ngược chiều nhau ("chạy quanh trái phải") thay vì một
// hàng dài — với hơn 30 logo, một hàng duy nhất sẽ mất quá lâu để lặp lại
// một vòng.
const GIUA = Math.ceil(partners.length / 2)
const HANG_TREN = partners.slice(0, GIUA)
const HANG_DUOI = partners.slice(GIUA)

// Lặp lại mỗi hàng 2 lần để chạy liền mạch — animation dịch đúng 50% chiều
// rộng một vòng, hết vòng thì bản sao thứ hai đã xếp khít chỗ vừa trôi qua.
function haiVong(hang) {
  return [...hang, ...hang]
}

function Hang({ items, nguoc }) {
  return (
    <div className="doitac-vien">
      <div className={nguoc ? 'doitac-chay nguoc' : 'doitac-chay'} aria-hidden="true">
        {haiVong(items).map((p, i) => (
          <div className="doitac-logo" key={p.file + i}>
            <img src={partnersBasePath + p.file} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PartnerMarquee() {
  return (
    <div className="doitac">
      <span className="doitac-nhan">Đã đồng hành cùng</span>
      <div className="doitac-hang-boc">
        <Hang items={HANG_TREN} />
        <Hang items={HANG_DUOI} nguoc />
      </div>
      {/* Danh sách thật cho trình đọc màn hình — hai dải chạy phía trên chỉ mang tính thị giác */}
      <span className="sr-only">{partners.map((p) => p.label).join(', ')}</span>
    </div>
  )
}
