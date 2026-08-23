import { useEffect, useRef } from 'react'

// Nội dung chia theo thời điểm trong ngày cưới, không chia theo loại dịch vụ:
// gia đình Việt nghĩ theo trình tự "tối nay dựng rạp, sáng làm lễ, chiều đãi tiệc".
// Bốn thời điểm — trước một ngày / sáng / giữa buổi / chiều tối — năm hạng mục.
const MOMENTS = [
  {
    gio: 'Trước một ngày',
    title: 'Dựng rạp',
    desc: 'Đo sân, dựng khung, căng bạt, kê bàn ghế. Xong trước để sáng hôm sau nhà chỉ việc lo lễ.',
    items: [
      'Rạp cưới các cỡ, khung sắt che nắng che mưa',
      'Bàn ghế, khăn trải, nơ ghế',
      'Quạt, đèn, ổ điện',
    ],
  },
  {
    gio: 'Sáng — lễ gia tiên',
    title: 'Bàn thờ gia tiên',
    diem: true,
    desc: 'Phần được nhìn nhiều nhất trong ngày, và cũng là phần cả họ chụp hình. Dựng đối xứng, chỉnh theo bàn thờ sẵn có của nhà.',
    items: [
      'Backdrop chữ Hỷ, câu đối, hoa tươi',
      'Bộ lư đồng, chân nến, mâm trái cây',
      'Phối màu theo bàn thờ gốc, không phá bố cục nhà',
    ],
  },
  {
    gio: 'Sáng — lễ hỏi',
    title: 'Quà hỏi cưới',
    diem: true,
    desc: 'Mâm quả kết tay theo số mâm nhà chọn. Trầu cau, trái cây, bánh, trà rượu — kết trước, giao đúng giờ, kèm đội bê tráp nếu nhà cần.',
    items: [
      'Mâm trầu cau, rồng phượng kết tay',
      'Mâm trái cây, bánh phu thê, trà rượu',
      'Đội ngũ bê tráp đồng phục',
    ],
  },
  {
    gio: 'Giữa buổi — rước dâu',
    title: 'Cho thuê cổng cưới',
    desc: 'Cổng dựng ngoài ngõ, là thứ khách nhìn thấy đầu tiên. Cho thuê theo ngày, dựng và tháo đều bên này lo.',
    items: [
      'Cổng hoa tươi, cổng hoa lụa, cổng phao',
      'Lối đi trải thảm, trang trí cổng nhà gái',
      'Xe hoa, bảng tên cô dâu chú rể',
    ],
  },
  {
    gio: 'Chiều tối — đãi tiệc',
    title: 'Sân khấu và âm thanh',
    desc: 'Dùng chung thiết bị với mảng sự kiện của công ty, nên loa đèn là hàng chuyên nghiệp chứ không phải hàng thuê lại.',
    items: [
      'Sân khấu, backdrop tiệc',
      'Âm thanh, ánh sáng, màn LED',
      'Thu dọn toàn bộ sau tiệc',
    ],
  },
]

export default function MomentsTimeline() {
  const bocRef = useRef(null)

  // Vạch vàng chạy dọc trục giữa theo scroll — trục bàn thờ của cả trang.
  useEffect(() => {
    const boc = bocRef.current
    if (!boc) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      boc.style.setProperty('--chay', '100%')
      return undefined
    }

    let cho = false
    const doi = () => {
      const r = boc.getBoundingClientRect()
      if (!r.height) return
      const p = Math.max(0, Math.min(1, (window.innerHeight * 0.62 - r.top) / r.height))
      boc.style.setProperty('--chay', `${(p * 100).toFixed(2)}%`)
    }
    const onScroll = () => {
      if (cho) return
      cho = true
      requestAnimationFrame(() => { doi(); cho = false })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', doi, { passive: true })
    doi()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', doi)
    }
  }, [])

  return (
    <section className="khoi nen-2" id="dich-vu">
      <div className="truc">
        <div className="doi-xung">
          <div className="gach-doi"><span>Chúng tôi làm gì</span></div>
          <h2 className="de">Một ngày cưới có bốn thời điểm</h2>
          <p className="de-phu">
            Mỗi thời điểm cần một thứ khác nhau. Gia đình chỉ cần nói ngày, chúng tôi lo phần dựng.
          </p>
        </div>

        <div className="moc-boc" ref={bocRef}>
          {MOMENTS.map((moment) => (
            <article className="moc" key={moment.title}>
              <div className={moment.diem ? 'cham diem' : 'cham'} aria-hidden="true" />
              <div className="moc-o">
                <div className="gio">{moment.gio}</div>
                <h3>{moment.title}</h3>
                <p>{moment.desc}</p>
                <ul className="viec">
                  {moment.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
