import { useEffect, useRef } from 'react'
import { contactInfo } from '../../data/contactInfo.js'

const wedding = contactInfo.wedding

export default function WeddingHero() {
  const congRef = useRef(null)

  // Cổng hoa tự vẽ khi tải trang. Chạy một lần; StrictMode gọi effect hai
  // lần nên phải dọn lại stroke-dash ở cleanup, không thì lượt hai không vẽ.
  useEffect(() => {
    const svg = congRef.current
    if (!svg) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const nets = Array.from(svg.querySelectorAll('path, line, circle'))
    const frames = []

    nets.forEach((net, i) => {
      let len = 0
      try {
        len = net.getTotalLength()
      } catch {
        len = 0
      }
      if (!len) return

      net.style.strokeDasharray = String(len)
      net.style.strokeDashoffset = String(len)
      net.style.transition = `stroke-dashoffset 1.5s cubic-bezier(.35,.8,.35,1) ${(i * 0.07 + 0.15).toFixed(2)}s`

      frames.push(
        requestAnimationFrame(() => {
          frames.push(
            requestAnimationFrame(() => {
              net.style.strokeDashoffset = '0'
            }),
          )
        }),
      )
    })

    return () => {
      frames.forEach((id) => cancelAnimationFrame(id))
      nets.forEach((net) => {
        net.style.strokeDasharray = ''
        net.style.strokeDashoffset = ''
        net.style.transition = ''
      })
    }
  }, [])

  return (
    <div className="mmt-hero">
      {/* Cổng hoa vẽ nét: đối xứng tuyệt đối quanh trục giữa */}
      <svg ref={congRef} className="cong" viewBox="0 0 860 340" aria-hidden="true" focusable="false">
        <path d="M120 340 L120 150 Q120 44 430 44 Q740 44 740 150 L740 340" />
        <path d="M152 340 L152 156 Q152 74 430 74 Q708 74 708 156 L708 340" className="to" />
        <line x1="120" y1="150" x2="152" y2="156" />
        <line x1="740" y1="150" x2="708" y2="156" />
        <circle cx="430" cy="44" r="7" />
        <circle cx="288" cy="56" r="4.5" />
        <circle cx="572" cy="56" r="4.5" />
        <circle cx="186" cy="102" r="4.5" />
        <circle cx="674" cy="102" r="4.5" />
        <circle cx="128" cy="196" r="4" />
        <circle cx="732" cy="196" r="4" />
        <circle cx="128" cy="262" r="4" />
        <circle cx="732" cy="262" r="4" />
      </svg>

      <div className="truc doi-xung hero-noi">
        <div className="gach-doi"><span>Cần Thơ · từ 2018</span></div>

        <h1 className="ten">Minh Minh Thúy<br /><em>cưới hỏi trọn gói</em></h1>

        <p className="phu">
          Trang trí bàn thờ gia tiên, cổng hoa, rạp cưới và bàn ghế đãi tiệc.
          Khảo sát tận nhà, dựng trước ngày cưới một hôm, thu dọn ngay sau tiệc.
        </p>

        <div className="nut-hang">
          <a className="nut dam" href={`tel:${wedding.phoneIntl}`}>Gọi {wedding.phoneDisplay}</a>
          <a className="nut" href={wedding.zaloUrl} target="_blank" rel="noopener noreferrer">Nhắn Zalo</a>
        </div>
      </div>
    </div>
  )
}
