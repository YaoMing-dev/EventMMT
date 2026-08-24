# Chatbot AI tư vấn khách hàng — Spec

Ngày viết: 2026-08-24
Trạng thái: Đã duyệt thiết kế, chưa triển khai.

## 1. Mục tiêu

Thêm 1 chatbot nổi trên cả trang Sự kiện và Cưới hỏi, giúp khách được tư vấn
ngay (dịch vụ, quy trình, giá tham khảo) mà không cần chờ gọi điện/nhắn Zalo,
đồng thời tự động ghi nhận lead khi khách để lại số điện thoại trong lúc chat.

## 2. Vì sao khả thi trên Render free tier

Render free tier chặn/nghẽn SMTP outbound (đã gặp với Gmail SMTP, phải chuyển
sang Resend qua HTTPS). Gọi API Gemini cũng là HTTPS (cổng 443) — cùng loại kết
nối với Resend đang chạy ổn định — nên không bị chặn. Chỉ chịu chung hạn chế
cold-start ~20-90s sau 15 phút không hoạt động như toàn bộ backend hiện tại.

## 3. Quyết định thiết kế đã chốt

| Hạng mục | Lựa chọn |
|---|---|
| AI provider | Google Gemini (free tier đủ dùng cho quy mô web nhỏ, chi phí gần 0 lúc đầu) |
| Nguồn dữ liệu tư vấn | Hybrid: system prompt tĩnh (giới thiệu công ty, quy trình, giọng văn) + nội dung động đọc từ DB (bảng giá/gói dịch vụ), admin sửa qua textarea trong `/admin`, không cần deploy lại |
| Thu thập lead | Tự động: quét số điện thoại VN trong tin nhắn khách, phát hiện là tạo `Lead` mới ngay (không chờ khách điền form) |

## 4. Kiến trúc

### 4.1 Backend

**Database:** PostgreSQL — dùng đúng database Render đang cấp
(`mmt-db`, plan free, khai báo trong `render.yaml`), cùng instance với bảng
`lead` hiện có. `spring.jpa.hibernate.ddl-auto: update` đang bật sẵn nên bảng
`ChatbotContext` mới sẽ tự được tạo khi deploy, không cần viết migration tay.
Lưu ý: Postgres free plan của Render hết hạn định kỳ và cần vào dashboard gia
hạn thủ công — rủi ro chung của cả hệ thống hiện tại (không riêng chatbot),
không phải rủi ro mới phát sinh từ tính năng này.

**Entity mới:**
- `ChatbotContext` — bảng 1 dòng duy nhất (`id`, `content` text, `updatedAt`).
  Admin sửa nội dung này (bảng giá, gói dịch vụ, khuyến mãi...) qua form.

**Service mới:**
- `ChatService` — build request Gemini, gọi API, parse response.
  - System prompt = phần tĩnh hard-code (giới thiệu MMT, tông giọng, quy trình
    đặt tiệc/sự kiện, cách chốt cuộc trò chuyện) **ghép với** `ChatbotContext.content`
    đọc từ DB tại thời điểm request.
  - Dùng `java.net.http.HttpClient` — đúng pattern đã có trong `EmailService.java`
    khi gọi Resend, không cần thêm Maven dependency.
  - Timeout ngắn (8-10s), lỗi/timeout → trả câu fallback tĩnh, **không throw ra
    ngoài** — giữ đúng nguyên tắc fail-soft của `EmailService.send(...)`.
- `ChatbotContextService` — CRUD đơn giản (get/update) cho `ChatbotContext`.

**Endpoint mới:**
```
POST /api/chat
  body: { pageContext: "EVENT" | "WEDDING", history: [{role, text}, ...] }
  trả:  { reply: "..." }
```
- **Stateless**: không lưu session ở backend. Frontend giữ toàn bộ lịch sử hội
  thoại trong state, gửi lại nguyên mảng `history` mỗi lần gọi. Tránh phải thêm
  bảng session/DB mới cho quy mô 1 web nhỏ.
- Rate limit theo IP (vd. tối đa 15 request/phút) để tránh bot spam đốt quota
  Gemini miễn phí — chặn bằng 1 bộ đếm in-memory đơn giản (`ConcurrentHashMap`),
  không cần Redis.

```
GET  /api/admin/chatbot-context   (Basic Auth, dùng lại SecurityConfig hiện có)
PUT  /api/admin/chatbot-context   (Basic Auth)
```

**Lead tự động từ chat:**
- Sau mỗi tin nhắn khách gửi lên, `ChatService` regex-quét số điện thoại VN
  (`0\d{9}` hoặc tương đương) trong tin nhắn.
- Có số → gọi `LeadService.createFromChat(phone, pageContext)`:
  - Tạo `Lead` mới trực tiếp (không qua `LeadRequest` DTO, nên không bị chặn
    bởi validation `@NotBlank email` mới thêm cho form thường).
  - `category` = theo `pageContext` (EVENT/WEDDING), `subtype` = "Tư vấn qua
    Chatbot", `eventDate`/`guestCount`/`toneColor` = null, `email` = null.
  - Vẫn gửi mail thông báo lead mới cho MMT như bình thường
    (`sendNewLeadNotification`). Không gửi mail cảm ơn khách (không có email —
    `sendCustomerConfirmation` đã được guard theo email rỗng, giữ nguyên logic).
  - Chỉ tạo 1 lead / 1 phiên chat (frontend đánh dấu đã gửi số, tránh spam Lead
    trùng khi khách nhắc lại số nhiều lần trong cùng cuộc trò chuyện).

**Config mới (`application.yml` + `render.yaml`, theo đúng pattern
`RESEND_API_KEY` đang dùng):**
```yaml
app.gemini.api-key: ${GEMINI_API_KEY:}
```
`GEMINI_API_KEY` khai báo `sync: false` trong `render.yaml`, giá trị thật set
trực tiếp trong Render dashboard — **không bao giờ commit vào file**.

> Lưu ý bảo mật: API key Gemini đã được gửi qua chat trong phiên làm việc này.
> Key đó **chưa** được ghi vào bất kỳ file nào trong repo — sẽ chỉ dùng để dán
> trực tiếp vào Render dashboard lúc triển khai thật. Từ lần sau nên set thẳng
> trong Render dashboard thay vì dán qua chat, để tránh key nằm trong lịch sử
> hội thoại.

### 4.2 Frontend

- `ChatWidget.jsx` (component mới, đặt cùng `RailButtons.jsx` trong
  `components/layout/`) — nút tròn nổi, bung thành panel chat khi bấm.
- Theme theo trang: dùng lại token màu đã có (event: xanh `#2E4FE0`, wedding:
  vàng `#B98A3C`/serif) — nhất quán với email và `RailButtons`.
- State: mảng `messages` (role: user/assistant, text) giữ trong component,
  không cần Context/store riêng vì chỉ 1 widget duy nhất.
- Mỗi lần khách gửi tin nhắn → gọi `POST /api/chat` với `pageContext` (lấy từ
  prop `view` đã có sẵn ở `RailButtons`) + toàn bộ `messages`. Hiện "đang
  nhập..." trong lúc chờ.
- Tin nhắn chào mở đầu tự sinh (không gọi API) — giới thiệu ngắn, mời khách
  đặt câu hỏi.
- Lỗi mạng/timeout → hiện tin nhắn fallback tĩnh + nút "Nhắn Zalo" (dùng lại
  `contactInfo` đang có), không để khách thấy lỗi kỹ thuật.

### 4.3 Admin

- Thêm 1 khối "Nội dung tư vấn Chatbot" trong `AdminPage.jsx`: textarea load
  nội dung hiện tại (`GET /api/admin/chatbot-context`) + nút Lưu (`PUT`), dùng
  lại `authHeader` đã có sẵn từ đăng nhập.

## 5. Data flow

```
Khách gõ tin nhắn trên widget
  → frontend POST /api/chat { pageContext, history }
  → ChatController → ChatService
      → build prompt = static prompt + ChatbotContext.content (đọc DB)
      → quét phone trong tin nhắn mới nhất; có số → LeadService.createFromChat(...)
      → gọi Gemini API (HttpClient, timeout 8-10s)
      → parse text reply (lỗi/timeout → fallback tĩnh)
  ← trả { reply }
  → frontend thêm reply vào messages, render
```

## 6. Testing

- `ChatServiceTest` — mock `HttpClient` (giống `EmailServiceTest`), test: gọi
  đúng endpoint Gemini, ghép đúng prompt tĩnh+động, parse response đúng, lỗi
  HTTP/timeout trả fallback không throw.
- Test riêng cho hàm regex bắt số điện thoại (các case: có số, không số, số
  lẫn trong câu dài, nhiều số trong 1 tin nhắn → chỉ lấy đúng 1).
- `LeadServiceTest` — thêm test `createFromChat` tạo đúng Lead với category/
  subtype/email null như spec, gửi đúng 1 mail (không gửi mail cảm ơn khách).
- `ChatWidgetTest` (frontend, mock fetch) — gửi tin nhắn, hiện reply, hiện
  fallback khi fetch lỗi, không gọi lại API cho tin nhắn chào mở đầu.
- `ChatControllerTest` — rate limit trả 429 khi vượt ngưỡng, endpoint admin
  yêu cầu Basic Auth đúng như `/api/admin/leads`.

## 7. Rollout theo phase

1. **Phase 1** — Chat FAQ cơ bản: widget + endpoint + prompt tĩnh only (chưa
   có DB động, chưa thu lead). Mục tiêu: xác nhận Gemini hoạt động ổn định
   trên Render, UX widget mượt.
2. **Phase 2** — Thêm `ChatbotContext` (DB) + khối sửa nội dung trong
   `/admin`, ghép vào system prompt.
3. **Phase 3** — Thêm tự thu lead (regex phone + `createFromChat`) + rate
   limit chống spam.

## 8. Ngoài phạm vi (không làm ở bản này)

- Không làm RAG/vector search — quy mô nội dung nhỏ (1 trang giới thiệu +
  bảng giá), nhét thẳng vào prompt là đủ và rẻ hơn nhiều.
- Không parse file `.xlsx` — đã đánh giá và loại vì thêm độ phức tạp
  (validate, lưu trữ file) không tương xứng lợi ích ở quy mô này; admin sửa
  trực tiếp qua textarea là đủ linh hoạt.
- Không lưu session/lịch sử chat vào DB — chat là stateless theo phiên trình
  duyệt, mất khi khách tải lại trang. Có thể bổ sung sau nếu cần xem lại lịch
  sử tư vấn trong admin.
