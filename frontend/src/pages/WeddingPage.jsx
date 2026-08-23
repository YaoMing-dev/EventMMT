import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ContactForm from '../components/shared/ContactForm.jsx'
import WeddingHero from '../components/wedding/WeddingHero.jsx'
import MomentsTimeline from '../components/wedding/MomentsTimeline.jsx'
import WorkGallery from '../components/wedding/WorkGallery.jsx'
import BrandCard from '../components/wedding/BrandCard.jsx'
import NapBlock from '../components/wedding/NapBlock.jsx'
import WeddingSchema from '../components/wedding/WeddingSchema.jsx'
import useReveal from '../components/wedding/useReveal.js'
import { contactInfo } from '../data/contactInfo.js'

const wedding = contactInfo.wedding

export default function WeddingPage() {
  const rootRef = useRef(null)
  useReveal(rootRef)

  return (
    <main className="mmt-mt" ref={rootRef}>
      <WeddingSchema />
      <WeddingHero />
      <MomentsTimeline />
      <WorkGallery />

      <section className="khoi" id="cach-dat">
        <div className="truc">
          <div className="doi-xung">
            <div className="gach-doi"><span>Cách đặt</span></div>
            <h2 className="de">Gọi trước, xem tận nơi, chốt rồi mới cọc</h2>
          </div>

          <div className="dat len">
            <div className="loi">
              <p>
                Gia đình gọi báo ngày cưới và địa chỉ. Chúng tôi tới đo sân, xem bàn thờ,
                chụp lại hiện trạng, rồi báo giá theo đúng mặt bằng thật.
                Không có giá qua điện thoại vì mỗi nhà mỗi khác. Chốt mẫu xong mới nhận cọc.
              </p>
              <p>
                Mùa cưới lịch kín rất nhanh. Nếu đã chọn được ngày lành, để lại ngày và
                số điện thoại — {wedding.contactName} gọi lại trong ngày.
              </p>
              <div className="nut-hang">
                <a className="nut dam" href={`tel:${wedding.phoneIntl}`}>Gọi báo ngày cưới</a>
                <a className="nut" href={wedding.zaloUrl} target="_blank" rel="noopener noreferrer">Nhắn Zalo</a>
              </div>
            </div>

            <ContactForm variant="wedding" />
          </div>
        </div>
      </section>

      <BrandCard />
      <NapBlock />

      <div className="truc">
        <div className="re len">
          <div>
            <h3>Công ty bạn cần tổ chức sự kiện?</h3>
            <p>
              Cùng một pháp nhân, mảng sự kiện của MMT nhận thầu trọn gói khai trương,
              hội nghị, mở bán — đã đồng hành cùng VNPT, Nam Long, Caragroup.
            </p>
          </div>
          <Link to="/su-kien">Xem mảng sự kiện →</Link>
        </div>
      </div>
    </main>
  )
}
