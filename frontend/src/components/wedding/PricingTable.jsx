export default function PricingTable() {
  return (
    <section className="blk" id="banggia" style={{ paddingTop: 0 }}>
      <div className="sec-head center rv">
        <span className="eyebrow">Bảng giá tham khảo</span>
        <h2>Ba gói trọn gói, giá <em>rõ ràng</em> từ đầu</h2>
        <p>Giá cuối tùy diện tích nhà và hoa tươi hay hoa lụa — báo giá chính xác sau khi xem ảnh nhà qua Zalo.</p>
      </div>
      <div className="prices rv">
        <div className="price">
          <h3>Se Duyên</h3>
          <div className="amt">6,9tr <small>/ lễ</small></div>
          <ul>
            <li>Cổng hoa lụa + bảng tên</li>
            <li>Bàn gia tiên cơ bản</li>
            <li>Áo ghế, nơ lụa 20 ghế</li>
            <li>Thi công &amp; tháo dỡ trọn gói</li>
          </ul>
          <a className="btn ghost" href="#lienhe-cuoi">Xem chi tiết gói</a>
        </div>
        <div className="price hot">
          <h3>Vu Quy</h3>
          <div className="amt">12,9tr <small>/ lễ</small></div>
          <ul>
            <li>Toàn bộ gói Se Duyên</li>
            <li>Rèm voan + đèn chuỗi toàn không gian</li>
            <li>Backdrop chụp ảnh theo tên</li>
            <li>Mâm quả, lư đồng đầy đủ</li>
            <li>Tea break 50 khách</li>
          </ul>
          <a className="btn gold" href="#lienhe-cuoi">Nhận tư vấn gói này</a>
        </div>
        <div className="price">
          <h3>Trọn Vẹn</h3>
          <div className="amt">19,9tr <small>/ lễ</small></div>
          <ul>
            <li>Toàn bộ gói Vu Quy</li>
            <li>Hoa tươi 100%</li>
            <li>Nhà bạt + bàn tiệc 100 khách</li>
            <li>Âm thanh + MC lễ gia tiên</li>
          </ul>
          <a className="btn ghost" href="#lienhe-cuoi">Xem chi tiết gói</a>
        </div>
      </div>
    </section>
  )
}
