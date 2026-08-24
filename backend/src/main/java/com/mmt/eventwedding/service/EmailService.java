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
import java.util.List;
import java.util.Map;

// Gui mail qua Resend (HTTP API), khong dung SMTP truc tiep nua — Render
// (goi free) chan/gioi han ket noi SMTP di ra ngoai, khien mail treo vo thoi
// han thay vi loi ro rang. HTTPS (port 443) khong bi chan kieu do.
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final URI RESEND_API_URL = URI.create("https://api.resend.com/emails");
    // Resend chi cho gui bang domain da xac minh; chua xac minh minhminhthuy.io.vn
    // nen dung sender test cua Resend — chi gui toi duoc dia chi da dang ky tai
    // khoan Resend (tuc NOTIFY_TO_EMAIL). Mail xac nhan cho khach (dia chi bat
    // ky) se can xac minh domain moi gui duoc ra ngoai.
    private static final String FROM_ADDRESS = "MMT <onboarding@resend.dev>";

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
        StringBuilder body = new StringBuilder()
                .append("Loai: ").append(lead.getCategory())
                .append("\nHang muc: ").append(lead.getSubtype())
                .append("\nNgay du kien: ").append(lead.getEventDate());
        // Lead cuoi hoi khong co so khach, va tu ban thiet ke moi thi cung
        // khong co tong mau. Bo dong rong thay vi in "null" vao email.
        if (lead.getGuestCount() != null) {
            body.append("\nSo khach: ").append(lead.getGuestCount());
        }
        if (lead.getToneColor() != null && !lead.getToneColor().isBlank()) {
            body.append("\nTong mau: ").append(lead.getToneColor());
        }
        body.append("\nSDT: ").append(lead.getPhone());
        if (lead.getEmail() != null && !lead.getEmail().isBlank()) {
            body.append("\nEmail: ").append(lead.getEmail());
        }
        send(toEmail, "MMT - Lead moi: " + lead.getCategory(), body.toString(), lead.getPhone());
    }

    // Mail cam on gui cho khach — chi goi khi khach co de lai email (khong bat
    // buoc tren form). Nguoi phu trach lay theo category vi hai mang co
    // nguoi lien he khac nhau (xem contactInfo.js ben frontend).
    @Async
    public void sendCustomerConfirmation(Lead lead) {
        boolean isWedding = lead.getCategory() == LeadCategory.WEDDING;
        String contactName = isWedding ? "Chị Thúy" : "Anh Hiếu";
        String contactPhone = isWedding ? "0907 623 450" : "0939 050 550";
        String body = "Chao ban,\n\n"
                + "MMT da nhan duoc yeu cau tu ban:\n"
                + "Hang muc: " + lead.getSubtype() + "\n"
                + "Ngay du kien: " + lead.getEventDate() + "\n\n"
                + (isWedding
                        ? "MMT phan hoi qua Zalo trong 15 phut gio hanh chinh."
                        : "MMT gui bao gia chi tiet trong 24 gio.")
                + "\n\nNguoi phu trach: " + contactName + " - Hotline/Zalo: " + contactPhone
                + "\n\nCam on ban da tin tuong MMT.";
        send(lead.getEmail(), "MMT da nhan yeu cau cua ban", body, lead.getPhone());
    }

    private void send(String to, String subject, String text, String leadPhone) {
        try {
            Map<String, Object> payload = Map.of(
                    "from", FROM_ADDRESS,
                    "to", List.of(to),
                    "subject", subject,
                    "text", text
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
