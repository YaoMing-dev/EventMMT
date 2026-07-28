import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useScrollReveal from '../components/shared/useScrollReveal.js'
import StatsBar from '../components/shared/StatsBar.jsx'
import ProcessSteps from '../components/shared/ProcessSteps.jsx'
import Quotes from '../components/shared/Quotes.jsx'
import ContactForm from '../components/shared/ContactForm.jsx'
import Gallery from '../components/shared/Gallery.jsx'
import WeddingHero from '../components/wedding/WeddingHero.jsx'
import ToneSelector from '../components/wedding/ToneSelector.jsx'
import AlbumServices from '../components/wedding/AlbumServices.jsx'
import PricingTable from '../components/wedding/PricingTable.jsx'
import { toneOrder } from '../data/toneData.js'
import { pickImages, TONE_IMAGE_INDEXES } from '../data/imagePicks.js'

const STATS = [
  { value: '200+', label: 'lễ Vu Quy — Tân Hôn' },
  { value: '4', label: 'bộ sưu tập tông màu' },
  { value: '6,9tr', label: 'gói trọn gói từ' },
  { value: '1 ngày', label: 'hoàn tất trước lễ' },
]

const STEPS = [
  { no: 'Bước 01', title: 'Xem nhà qua Zalo', desc: 'Gửi ảnh, video nhà — hoặc MMT đến khảo sát tận nơi, cùng chọn tông màu.' },
  { no: 'Bước 02', title: 'Báo giá trong 24h', desc: 'Báo giá chi tiết từng hạng mục, chốt gói và giữ lịch ngày lành.' },
  { no: 'Bước 03', title: 'Trang trí trước lễ 1 ngày', desc: 'Hoàn tất sớm để gia đình kiểm tra, yên tâm trước ngày vui.' },
  { no: 'Bước 04', title: 'Phục vụ & dọn dẹp', desc: 'Phục vụ trọn buổi lễ, tháo dỡ trả lại nhà gọn gàng.' },
]

const QUOTES = [
  { text: 'Nhà mình trong hẻm nhỏ mà các bạn biến thành không gian tiệc đẹp không ngờ. Khách tới ai cũng hỏi ai trang trí.', name: 'Cô dâu tại Ninh Kiều', meta: 'Bộ sưu tập Đào · lễ Vu Quy' },
  { text: 'Ba mẹ mình khó tính chuyện lễ nghĩa mà xem bàn gia tiên xong gật đầu liền. Đội làm nhanh, dọn sạch, giá đúng như báo.', name: 'Chú rể tại Cái Răng', meta: 'Bộ sưu tập Son · lễ Tân Hôn' },
]

export default function WeddingPage() {
  useScrollReveal()
  const [images, setImages] = useState([])

  useEffect(() => {
    fetch('/api/images/wedding')
      .then((res) => (res.ok ? res.json() : []))
      .then(setImages)
      .catch(() => setImages([]))
  }, [])

  const imagesByTone = toneOrder.reduce((acc, key) => {
    acc[key] = pickImages(images, TONE_IMAGE_INDEXES[key])
    return acc
  }, {})

  return (
    <main>
      <WeddingHero />
      <StatsBar items={STATS} />

      <section className="blk" id="tongmau">
        <div className="sec-head rv">
          <span className="eyebrow">Bộ sưu tập tông màu</span>
          <h2>Chọn <em>tông màu</em>, MMT lo phần còn lại</h2>
          <p>Bốn bộ sưu tập được đặt tên riêng — mỗi bộ là một bảng màu xuyên suốt từ cổng hoa đến khăn bàn.</p>
        </div>
        <ToneSelector imagesByTone={imagesByTone} />
      </section>

      <AlbumServices />
      <Quotes items={QUOTES} />
      <ProcessSteps id="quytrinh-cuoi" title={<h2>Bốn bước — gia đình chỉ việc <em>đón khách</em></h2>} steps={STEPS} />
      <PricingTable />

      <section className="blk" id="lienhe-cuoi" style={{ paddingTop: 0 }}>
        <div className="contact">
          <div className="info rv">
            <span className="eyebrow">Giữ lịch ngày lành</span>
            <h2>Đã chọn ngày?<br /><em>Nhắn MMT giữ lịch ngay.</em></h2>
            <p>Mùa cưới lịch kín rất nhanh — gửi ngày lành và ảnh nhà, MMT báo giá chính xác trong 24 giờ.</p>
            <div className="big">0939 050 550</div>
            <p>Hotline kiêm Zalo · Cần Thơ &amp; các tỉnh miền Tây</p>
          </div>
          <ContactForm variant="wedding" />
        </div>
      </section>

      <section className="blk" style={{ paddingTop: 0 }}>
        <div className="sec-head rv">
          <span className="eyebrow">Album thực tế</span>
          <h2>Những lễ cưới <em>đã hoàn thiện</em></h2>
        </div>
        <Gallery category="wedding" />
      </section>

      <section className="blk" style={{ paddingTop: 0 }}>
        <div className="promo rv">
          <div><h3>Công ty bạn cần tổ chức sự kiện?</h3><p>MMT Event — nhà thầu trọn gói khai trương, hội nghị, mở bán; đã đồng hành cùng VNPT, Nam Long, Caragroup.</p></div>
          <Link className="go" to="/su-kien">Khám phá MMT Event →</Link>
        </div>
      </section>
    </main>
  )
}
