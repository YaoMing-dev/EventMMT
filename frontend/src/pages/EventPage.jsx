import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useScrollReveal from '../components/shared/useScrollReveal.js'
import StatsBar from '../components/shared/StatsBar.jsx'
import ProcessSteps from '../components/shared/ProcessSteps.jsx'
import Quotes from '../components/shared/Quotes.jsx'
import ContactForm from '../components/shared/ContactForm.jsx'
import Gallery from '../components/shared/Gallery.jsx'
import EventHero from '../components/event/EventHero.jsx'
import GuestCalculator from '../components/event/GuestCalculator.jsx'
import ProjectsList from '../components/event/ProjectsList.jsx'
import ServicesGrid from '../components/event/ServicesGrid.jsx'
import Pillars from '../components/event/Pillars.jsx'
import { contactInfo } from '../data/contactInfo.js'

const STATS = [
  { value: '10+', label: 'năm thi công' },
  { value: '300+', label: 'sự kiện đã tổ chức' },
  { value: '1.000', label: 'khách / nhà bạt lớn nhất' },
  { value: '24h', label: 'báo giá chi tiết' },
]

const STEPS = [
  { no: 'Bước 01', title: 'Khảo sát & tư vấn', desc: 'Xem mặt bằng thực tế, đo đạc, tư vấn phương án phù hợp ngân sách.' },
  { no: 'Bước 02', title: 'Báo giá trong 24h', desc: 'Báo giá chi tiết từng hạng mục, không phát sinh ẩn.' },
  { no: 'Bước 03', title: 'Thi công lắp đặt', desc: 'Dựng và chạy thử toàn bộ trước giờ G, trực suốt sự kiện.' },
  { no: 'Bước 04', title: 'Nghiệm thu & tháo dỡ', desc: 'Bàn giao đúng cam kết, trả lại mặt bằng sạch.' },
]

const QUOTES = [
  { text: 'Sự kiện ra quân diễn ra đúng kế hoạch từng phút. Đội MMT dựng xong từ hôm trước và có mặt từ sáng sớm xử lý âm thanh.', name: 'Đại diện ban tổ chức', meta: 'Sự kiện doanh nghiệp tại Cần Thơ' },
  { text: 'Nhà bạt cho buổi mở bán hơn 800 khách dựng gọn trong hai ngày, che nắng tốt và rất chỉn chu trên ảnh truyền thông.', name: 'Phòng marketing chủ đầu tư', meta: 'Sự kiện mở bán bất động sản' },
]

export default function EventPage() {
  useScrollReveal()
  const [images, setImages] = useState([])

  useEffect(() => {
    fetch('/api/images/events')
      .then((res) => (res.ok ? res.json() : []))
      .then(setImages)
      .catch(() => setImages([]))
  }, [])

  return (
    <main>
      <EventHero />
      <StatsBar items={STATS} />

      <section className="blk" id="quymo">
        <div className="sec-head rv">
          <span className="eyebrow">Hạ tầng &amp; thiết bị sẵn có</span>
          <h2>Bảng thông số &amp; <em>tính nhanh quy mô</em></h2>
          <p>Chọn quy mô sự kiện dự kiến để xem phương án hạ tầng nhà bạt &amp; thiết bị tương ứng từ kho MMT.</p>
        </div>
        <GuestCalculator />
      </section>

      <ProjectsList />
      <ServicesGrid images={images} />
      <Pillars />

      <ProcessSteps id="quytrinh" title={<h2>Bốn bước — cam kết <em>đúng giờ</em></h2>} steps={STEPS} />
      <Quotes items={QUOTES} />

      <section className="blk" id="lienhe" style={{ paddingTop: 0 }}>
        <div className="contact">
          <div className="info rv">
            <span className="eyebrow">Liên hệ</span>
            <h2>Cùng dựng nên<br /><em>dấu ấn của bạn.</em></h2>
            <p>Gửi thông tin ngắn gọn — MMT phản hồi qua Zalo trong 15 phút giờ hành chính và gửi báo giá chi tiết trong 24 giờ.</p>
            <div className="big">{contactInfo.event.phoneDisplay}</div>
            <p>Hotline kiêm Zalo · {contactInfo.event.contactName} · Cần Thơ &amp; các tỉnh miền Tây</p>
          </div>
          <ContactForm variant="event" />
        </div>
      </section>

      <section className="blk" style={{ paddingTop: 0 }}>
        <div className="sec-head rv">
          <span className="eyebrow">Album thực tế</span>
          <h2>Những sự kiện <em>đã dựng nên</em></h2>
        </div>
        <Gallery category="events" />
      </section>

      <section className="blk" style={{ paddingTop: 0 }}>
        <div className="promo rv">
          <div><h3>Nhà sắp có hỷ sự?</h3><p>MMT Wedding by Minh Minh Thúy — trang trí cưới hỏi trọn gói tại gia, giá công khai từ 6,9 triệu.</p></div>
          <Link className="go" to="/tiec-cuoi">Khám phá MMT Wedding →</Link>
        </div>
      </section>
    </main>
  )
}
