// Ảnh sự kiện thật, chọn tay từ kho ảnh gốc (D:/Job/images/events) và nén
// sẵn vào public/su-kien — không còn phụ thuộc /api/images/events (backend +
// Postgres phải chạy thì ảnh mới hiện, và ảnh gốc chưa nén nặng 3-9MB/tấm).
// Ảnh tĩnh nạp ngay khi mở trang, không cần chờ API.
//
// 4/6 ảnh xác minh được đúng khách hàng qua chữ trên phông/băng-rôn trong
// ảnh (đối chiếu được với danh sách đối tác ở partners.js): Viettien House,
// Mạnh Nông, Bia Sài Gòn, VNPT. Hai ảnh còn lại (nhaBat, quyMoLon) là ảnh
// minh hoạ không có tên khách hàng cụ thể lộ trong khung hình — dùng cho
// khối không nêu tên (ServicesGrid) hoặc khối đã có tên trong chữ nhưng
// chưa tìm được đúng ảnh gốc của dự án đó (EventSpotlights — Nam Long).

export const nhaBatAnh = {
  src: '/su-kien/nha-bat.webp',
  alt: 'Đội MMT chuẩn bị tiệc ngoài trời dưới tán cây cho sự kiện khách hàng',
}

export const khaiTruongAnh = {
  src: '/su-kien/khai-truong.webp',
  alt: 'Lễ khai trương cửa hàng Viettien House do MMT tổ chức',
}

export const hoiNghiAnh = {
  src: '/su-kien/hoi-nghi.webp',
  alt: 'Hội nghị khách hàng Mạnh Nông 2024 do MMT tổ chức',
}

export const thuongHieuAnh = {
  src: '/su-kien/thuong-hieu.webp',
  alt: 'Sân khấu họp mặt cuối năm của Bia Sài Gòn do MMT dàn dựng',
}

export const quyMoLonAnh = {
  src: '/su-kien/quy-mo-lon.webp',
  alt: 'Nhà bạt sự kiện ngoài trời quy mô lớn do MMT dựng',
}

export const vnptRaQuanAnh = {
  src: '/su-kien/vnpt-ra-quan.webp',
  alt: 'Lễ ra quân Tuổi trẻ VNPT Cần Thơ do MMT tổ chức',
}
