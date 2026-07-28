export default function Pillars() {
  const pillars = [
    { no: '01', title: 'Đúng giờ khai mạc', desc: 'Sự kiện không có cơ hội làm lại. Mọi hạng mục dựng xong và chạy thử trước giờ G — đó là cam kết, không phải khẩu hiệu.' },
    { no: '02', title: 'Giá minh bạch từng hạng mục', desc: 'Báo giá chi tiết trong 24 giờ, bóc tách rõ ràng, không phát sinh ẩn khi đã ký.' },
    { no: '03', title: 'Đội thi công tại chỗ', desc: 'Nhân sự và kho thiết bị đặt tại Cần Thơ — xử lý phát sinh trong 30 phút, không chờ điều động.' },
  ]
  return (
    <section className="blk" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Cách MMT làm việc</span>
        <h2>Vì sao doanh nghiệp chọn MMT cho ngày <em>quan trọng nhất</em></h2>
      </div>
      <div className="pillars rv">
        {pillars.map((p) => (
          <div className="pillar" key={p.no}>
            <span className="no">{p.no}</span>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
