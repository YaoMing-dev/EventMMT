// Quy trình làm việc với doanh nghiệp/cơ quan qua hồ sơ mời thầu.
// Cố ý không chốt % chiết khấu hay ngưỡng quy mô cụ thể — công ty chưa xác
// nhận số liệu thật, đưa số bịa lên trang là quảng cáo sai sự thật.
const BUOC = [
  {
    no: '01',
    title: 'Tiếp nhận hồ sơ mời thầu',
    desc: 'Đọc yêu cầu kỹ thuật, quy mô và thời hạn từ phòng mua sắm hoặc ban tổ chức, tư vấn phương án phù hợp ngân sách trước khi báo giá.',
  },
  {
    no: '02',
    title: 'Báo giá cạnh tranh, bóc tách hạng mục',
    desc: 'Báo giá minh bạch từng đầu mục thi công và thiết bị, đúng tinh thần đấu thầu công khai — không gộp mập mờ, không phát sinh ẩn sau khi ký.',
  },
  {
    no: '03',
    title: 'Hỗ trợ giá cho sự kiện quy mô lớn',
    desc: 'Sự kiện nhiều ngày thi công hoặc nhiều hạng mục đi kèm, MMT trao đổi trực tiếp phương án giá phù hợp quy mô thực tế — không báo cố định qua điện thoại.',
  },
]

export default function BiddingProcess() {
  return (
    <section className="blk" id="dauthau" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Làm việc với doanh nghiệp &amp; cơ quan</span>
        <h2>Sẵn sàng cho hồ sơ <em>mời thầu</em></h2>
        <p>Từ tiếp nhận yêu cầu đến bàn giao — quy trình rõ ràng cho phòng mua sắm đối chiếu.</p>
      </div>
      <div className="dauthau rv">
        {BUOC.map((b) => (
          <div className="dauthau-o" key={b.no}>
            <span className="no">{b.no}</span>
            <h3>{b.title}</h3>
            <p>{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
