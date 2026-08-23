// Thư viện công trình — ảnh thật do MMT chụp tại đám đã làm, công ty sở hữu.
//
// Ảnh đặt tĩnh trong `public/anh/`, không lấy qua `/api/images/wedding`:
// mỗi tấm có alt và chú thích tiếng Việt riêng, gắn cứng theo tên file.
// API trả về tên file gốc dạng Zalo (z5762384952671_...) nên không neo được
// phần chữ này vào ảnh.
//
// Ảnh đã nén: cạnh dài tối đa 1600px, WebP chất lượng 72 (hai tấm nặng
// nhất hạ thêm), mỗi tấm dưới 200 KB — 8,26 MB xuống 2,78 MB.
//
// `w`/`h` là kích thước thật đọc từ file sau khi nén, không phải số ước lượng —
// lưới masonry cần đúng tỉ lệ để không nhảy layout (CLS) khi ảnh tải xong.
//
// Chú thích và alt đã đối chiếu với từng tấm ảnh. Nhóm thứ hai đặt tên
// "Gia tiên & tiệc tại nhà" chứ không phải "Cổng cưới": trong 23 tấm hiện có
// KHÔNG có tấm nào chụp cổng cưới dựng ngoài ngõ — tất cả là trang trí trong
// nhà. Dịch vụ cho thuê cổng vẫn còn trong phần "bốn thời điểm", chỉ là chưa
// có ảnh minh hoạ.

export const galleryGroups = [
  { id: 'tat-ca', label: 'Tất cả' },
  { id: 'qua-cuoi-hoi', label: 'Quà cưới hỏi' },
  { id: 'gia-tien', label: 'Gia tiên & tiệc tại nhà' },
]

export const galleryItems = [
  // ===== QUÀ CƯỚI HỎI =====
  {
    file: 'quacuoihoi1.webp', group: 'qua-cuoi-hoi', w: 1276, h: 956,
    alt: 'Cặp mâm quả kết hình rồng phượng bằng trái cây cho lễ hỏi tại Cần Thơ',
    caption: 'Mâm trái cây kết rồng phượng',
  },
  {
    file: 'quacuoihoi2.webp', group: 'qua-cuoi-hoi', w: 1280, h: 914,
    alt: 'Bộ mâm quả trầu cau, mãng cầu, táo và bánh phu thê dọn sẵn tại nhà ở Cần Thơ',
    caption: 'Bộ mâm quả dọn sẵn tại nhà',
  },
  {
    file: 'quacuoihoi3.webp', group: 'qua-cuoi-hoi', w: 1276, h: 956,
    alt: 'Dàn mâm quả cưới hỏi đầy đủ gồm mâm táo, bánh phu thê, trầu cau và trà rượu tại Cần Thơ',
    caption: 'Dàn mâm quả đầy đủ một bộ',
  },
  {
    file: 'quacuoihoi4.webp', group: 'qua-cuoi-hoi', w: 960, h: 1280,
    alt: 'Mâm bánh kẹo kết hoa hồng trắng và hoa sen trong bộ quà hỏi cưới Cần Thơ',
    caption: 'Mâm bánh kẹo kết hoa sen trắng',
  },
  {
    file: 'quacuoihoi5.webp', group: 'qua-cuoi-hoi', w: 960, h: 1280,
    alt: 'Mâm rượu kết hoa hồng phấn trong bộ quà hỏi cưới tại Cần Thơ',
    caption: 'Mâm rượu kết hoa hồng phấn',
  },
  {
    file: 'quacuoihoi6.webp', group: 'qua-cuoi-hoi', w: 960, h: 1280,
    alt: 'Mâm bánh kẹo nhập kết hoa hồng trắng và hoa sen cho lễ ăn hỏi',
    caption: 'Mâm bánh kẹo kết hoa hồng trắng',
  },
  {
    file: 'quacuoihoi7.webp', group: 'qua-cuoi-hoi', w: 960, h: 1280,
    alt: 'Mâm bánh phu thê hộp xanh ngọc xếp tầng trong bộ quà hỏi cưới trọn gói',
    caption: 'Mâm bánh phu thê xếp tầng',
  },
  {
    file: 'quacuoihoi8.webp', group: 'qua-cuoi-hoi', w: 960, h: 1280,
    alt: 'Mâm rượu ngoại kết hoa hồng trắng và hoa sen cho lễ hỏi tại Cần Thơ',
    caption: 'Mâm rượu kết hoa hồng trắng',
  },
  {
    file: 'quacuoihoi9.webp', group: 'qua-cuoi-hoi', w: 960, h: 1280,
    alt: 'Mâm trầu cau dán chữ Hỷ kết hoa sen và hoa hồng trắng',
    caption: 'Mâm trầu cau kết hoa sen',
  },
  {
    file: 'quacuoihoi10.webp', group: 'qua-cuoi-hoi', w: 960, h: 1280,
    alt: 'Mâm trái cây kết tháp viền hoa hồng trắng và hoa sen trong lễ ăn hỏi',
    caption: 'Mâm trái cây kết tháp',
  },
  {
    file: 'quacuoihoi11.webp', group: 'qua-cuoi-hoi', w: 960, h: 1280,
    alt: 'Mâm táo đỏ kết tháp cao viền hoa hồng trắng, quà hỏi cưới Minh Minh Thúy',
    caption: 'Mâm táo đỏ viền hoa trắng',
  },

  // ===== GIA TIÊN & TIỆC TẠI NHÀ =====
  {
    file: 'congcuoi1.webp', group: 'gia-tien', w: 408, h: 306,
    alt: 'Trang trí gia tiên tông đỏ trắng với backdrop chữ Hỷ và bàn tiệc dài tại Cần Thơ',
    caption: 'Gia tiên tông đỏ trắng',
  },
  {
    file: 'congcuoi2.webp', group: 'gia-tien', w: 956, h: 1276,
    alt: 'Trang trí gia tiên và bàn tiệc lễ Tân Hôn tông đỏ vàng, ghế phủ khăn đồng bộ',
    caption: 'Gia tiên tông đỏ vàng, bàn tiệc dài',
  },
  {
    file: 'congcuoi3.webp', group: 'gia-tien', w: 1280, h: 852,
    alt: 'Trang trí gia tiên lễ đính hôn tông hồng phấn với backdrop hoa lụa và rèm voan',
    caption: 'Gia tiên tông hồng phấn',
  },
  {
    file: 'congcuoi4.webp', group: 'gia-tien', w: 1280, h: 960,
    alt: 'Trang trí gia tiên lễ đính hôn tông hồng đào với rèm vải và ghế Tiffany phủ voan',
    caption: 'Gia tiên tông hồng đào',
  },
  {
    file: 'congcuoi5.webp', group: 'gia-tien', w: 576, h: 1280,
    alt: 'Bàn thờ gia tiên tông vàng ánh kim với chữ Hỷ, lư đồng và đèn chuỗi',
    caption: 'Gia tiên tông vàng ánh kim',
  },
  {
    file: 'congcuoi6.webp', group: 'gia-tien', w: 1280, h: 852,
    alt: 'Toàn cảnh gian gia tiên tông hồng phấn với bàn thờ, backdrop hoa và bàn tiệc',
    caption: 'Gia tiên tông hồng phấn — góc rộng',
  },
  {
    file: 'congcuoi7.webp', group: 'gia-tien', w: 960, h: 1280,
    alt: 'Toàn cảnh gian gia tiên tông hồng đào dựng trong nhà tại Cần Thơ',
    caption: 'Gia tiên tông hồng đào — góc rộng',
  },
  {
    file: 'congcuoi8.webp', group: 'gia-tien', w: 1280, h: 960,
    alt: 'Trang trí gia tiên lễ Vu Quy tông kem vàng với backdrop chữ Hỷ và nơ ghế hoa hướng dương',
    caption: 'Gia tiên tông kem vàng',
  },
  {
    file: 'congcuoi9.webp', group: 'gia-tien', w: 1600, h: 1155,
    alt: 'Trang trí gia tiên lễ Vu Quy tông hồng pastel với hoa lụa và đèn cầu',
    caption: 'Gia tiên tông hồng pastel',
  },
  {
    file: 'congcuoi10.webp', group: 'gia-tien', w: 1066, h: 1600,
    alt: 'Bàn tiệc gia tiên trải khăn xanh lục trước backdrop rèm đỏ và chữ Hỷ mạ vàng',
    caption: 'Bàn gia tiên khăn xanh',
  },
  {
    file: 'congcuoi11.webp', group: 'gia-tien', w: 1600, h: 1200,
    alt: 'Trang trí gia tiên lễ Thành Hôn tông đỏ với bàn tiệc dài tại nhà ở Cần Thơ',
    caption: 'Gia tiên tông đỏ, bàn tiệc dài',
  },
  {
    file: 'congcuoi12.webp', group: 'gia-tien', w: 1280, h: 854,
    alt: 'Trang trí gia tiên lễ đính hôn tông kem cam đào với backdrop chữ Hỷ và bàn tiệc',
    caption: 'Gia tiên tông kem cam đào',
  },
]

export const galleryBasePath = '/anh/'

export function countInGroup(groupId) {
  return groupId === 'tat-ca'
    ? galleryItems.length
    : galleryItems.filter((item) => item.group === groupId).length
}
