package com.mmt.eventwedding.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mmt.eventwedding.model.Lead;
import com.mmt.eventwedding.model.LeadCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

// Gui mail qua Resend (HTTP API) — xem ghi chu lich su trong git log ve ly
// do khong dung SMTP truc tiep (Render free chan ket noi SMTP di ra).
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final URI RESEND_API_URL = URI.create("https://api.resend.com/emails");
    private static final String FROM_ADDRESS = "MMT <noreply@minhminhthuy.io.vn>";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // Tong mau dong bo voi web: su kien = xanh corporate, cuoi hoi = vang
    // dong tren nen kem (xem global.css body[data-view]).
    private static final String EVENT_ACCENT = "#2E4FE0";
    private static final String EVENT_BG = "#F4F6FA";
    private static final String WEDDING_ACCENT = "#B98A3C";
    private static final String WEDDING_BG = "#FAF6EE";
    private static final String INK = "#151B2C";
    private static final String MUTED = "#5B6478";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    @Value("${app.notify.to-email}")
    private String toEmail;

    @Value("${app.resend.api-key}")
    private String resendApiKey;

    @Async
    public void sendNewLeadNotification(Lead lead) {
        boolean isWedding = lead.getCategory() == LeadCategory.WEDDING;

        StringBuilder rows = new StringBuilder();
        rows.append(row("Hạng mục", lead.getSubtype()));
        rows.append(row("Ngày dự kiến", formatDate(lead)));
        if (lead.getGuestCount() != null) {
            rows.append(row("Số khách", String.valueOf(lead.getGuestCount())));
        }
        if (lead.getToneColor() != null && !lead.getToneColor().isBlank()) {
            rows.append(row("Tông màu", lead.getToneColor()));
        }
        rows.append(row("Số điện thoại", lead.getPhone()));
        if (lead.getEmail() != null && !lead.getEmail().isBlank()) {
            rows.append(row("Email", lead.getEmail()));
        }

        String heading = isWedding ? "Yêu cầu cưới hỏi mới" : "Yêu cầu sự kiện mới";
        String html = renderShell(isWedding, heading,
                "<table style=\"width:100%;border-collapse:collapse;margin-top:4px\">" + rows + "</table>");

        StringBuilder text = new StringBuilder()
                .append("Loai: ").append(lead.getCategory())
                .append("\nHang muc: ").append(lead.getSubtype())
                .append("\nNgay du kien: ").append(formatDate(lead));
        if (lead.getGuestCount() != null) {
            text.append("\nSo khach: ").append(lead.getGuestCount());
        }
        if (lead.getToneColor() != null && !lead.getToneColor().isBlank()) {
            text.append("\nTong mau: ").append(lead.getToneColor());
        }
        text.append("\nSDT: ").append(lead.getPhone());
        if (lead.getEmail() != null && !lead.getEmail().isBlank()) {
            text.append("\nEmail: ").append(lead.getEmail());
        }

        String subject = (isWedding ? "Lead cưới hỏi mới — " : "Lead sự kiện mới — ") + lead.getSubtype();
        send(toEmail, subject, text.toString(), html, lead.getPhone());
    }

    // Mail cam on gui cho khach — chi goi khi khach co de lai email (khong bat
    // buoc tren form). Noi dung/mau sac tach theo category vi hai mang co
    // nguoi lien he va giong dieu thuong hieu khac nhau.
    @Async
    public void sendCustomerConfirmation(Lead lead) {
        boolean isWedding = lead.getCategory() == LeadCategory.WEDDING;
        String contactName = isWedding ? "Chị Thúy" : "Anh Hiếu";
        String contactPhone = isWedding ? "0907 623 450" : "0939 050 550";
        String brand = isWedding ? "Minh Minh Thúy" : "MMT Event";
        String promiseText = isWedding
                ? "MMT sẽ phản hồi qua Zalo trong 15 phút giờ hành chính."
                : "MMT sẽ gửi báo giá chi tiết trong 24 giờ.";

        String bodyHtml = "<p style=\"margin:0 0 16px;color:" + INK + ";font-size:15px;line-height:1.7\">Xin chào,</p>"
                + "<p style=\"margin:0 0 20px;color:" + INK + ";font-size:15px;line-height:1.7\">"
                + escapeHtml(brand) + " đã nhận được yêu cầu của bạn:</p>"
                + "<table style=\"width:100%;border-collapse:collapse;margin-bottom:20px\">"
                + row(isWedding ? "Ngày lành dự kiến" : "Ngày dự kiến", formatDate(lead))
                + row("Hạng mục", lead.getSubtype())
                + "</table>"
                + "<p style=\"margin:0 0 24px;color:" + INK + ";font-size:15px;line-height:1.7\">" + promiseText + "</p>"
                + "<p style=\"margin:0;color:" + MUTED + ";font-size:14px;line-height:1.7\">"
                + "Người phụ trách: <strong style=\"color:" + INK + "\">" + contactName
                + "</strong> — Hotline/Zalo: <strong style=\"color:" + INK + "\">" + contactPhone + "</strong></p>";

        String html = renderShell(isWedding, "Cảm ơn bạn đã tin tưởng " + brand, bodyHtml);

        String text = "Chao ban,\n\n"
                + brand + " da nhan duoc yeu cau tu ban:\n"
                + "Hang muc: " + lead.getSubtype() + "\n"
                + "Ngay du kien: " + formatDate(lead) + "\n\n"
                + promiseText
                + "\n\nNguoi phu trach: " + contactName + " - Hotline/Zalo: " + contactPhone
                + "\n\nCam on ban da tin tuong " + brand + ".";

        send(lead.getEmail(), "Cảm ơn bạn đã liên hệ " + brand, text, html, lead.getPhone());
    }

    private String row(String label, String value) {
        return "<tr>"
                + "<td style=\"padding:8px 16px 8px 0;color:" + MUTED + ";font-size:13px;white-space:nowrap;vertical-align:top\">" + escapeHtml(label) + "</td>"
                + "<td style=\"padding:8px 0;color:" + INK + ";font-size:14px;font-weight:600\">" + escapeHtml(value) + "</td>"
                + "</tr>";
    }

    private String formatDate(Lead lead) {
        return lead.getEventDate() == null ? "" : lead.getEventDate().format(DATE_FMT);
    }

    private String renderShell(boolean isWedding, String heading, String bodyHtml) {
        String accent = isWedding ? WEDDING_ACCENT : EVENT_ACCENT;
        String bg = isWedding ? WEDDING_BG : EVENT_BG;
        String brand = isWedding ? "Minh Minh Thúy" : "MMT Event";
        String font = isWedding ? "Georgia, 'Times New Roman', serif" : "Arial, Helvetica, sans-serif";
        return "<div style=\"background:" + bg + ";padding:32px 16px;font-family:" + font + "\">"
                + "<div style=\"max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid rgba(0,0,0,.08)\">"
                + "<div style=\"background:" + accent + ";padding:22px 28px\">"
                + "<span style=\"color:#fff;font-size:18px;font-weight:700;letter-spacing:.3px\">" + escapeHtml(brand) + "</span>"
                + "</div>"
                + "<div style=\"padding:28px\">"
                + "<h1 style=\"margin:0 0 18px;font-size:20px;color:" + INK + ";font-weight:700\">" + escapeHtml(heading) + "</h1>"
                + bodyHtml
                + "</div>"
                + "</div>"
                + "</div>";
    }

    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private void send(String to, String subject, String text, String html, String leadPhone) {
        try {
            Map<String, Object> payload = Map.of(
                    "from", FROM_ADDRESS,
                    "to", List.of(to),
                    "subject", subject,
                    "text", text,
                    "html", html
            );
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(RESEND_API_URL)
                    .timeout(Duration.ofSeconds(8))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                log.error("Resend tu choi mail cho lead phone={} (HTTP {}): {}",
                        leadPhone, response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email via Resend for lead phone={}", leadPhone, e);
        }
    }
}
