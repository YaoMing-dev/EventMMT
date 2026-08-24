package com.mmt.eventwedding.service;

import com.mmt.eventwedding.model.Lead;
import com.mmt.eventwedding.model.LeadCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.notify.to-email}")
    private String toEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendNewLeadNotification(Lead lead) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("MMT - Lead moi: " + lead.getCategory());
            // Lead cuoi hoi khong co so khach, va tu ban thiet ke moi thi cung
            // khong co tong mau. Bo dong rong thay vi in "null" vao email.
            StringBuilder body = new StringBuilder()
                    .append("Loai: ").append(lead.getCategory())
                    .append("\nHang muc: ").append(lead.getSubtype())
                    .append("\nNgay du kien: ").append(lead.getEventDate());
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
            message.setText(body.toString());
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send lead notification email for lead phone={}", lead.getPhone(), e);
        }
    }

    // Mail cam on gui cho khach — chi goi khi khach co de lai email (khong bat
    // buoc tren form). Nguoi phu trach lay theo category vi hai mang co
    // nguoi lien he khac nhau (xem contactInfo.js ben frontend).
    @Async
    public void sendCustomerConfirmation(Lead lead) {
        try {
            boolean isWedding = lead.getCategory() == LeadCategory.WEDDING;
            String contactName = isWedding ? "Chị Thúy" : "Anh Hiếu";
            String contactPhone = isWedding ? "0907 623 450" : "0939 050 550";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(lead.getEmail());
            message.setSubject("MMT da nhan yeu cau cua ban");
            StringBuilder body = new StringBuilder()
                    .append("Chao ban,\n\n")
                    .append("MMT da nhan duoc yeu cau tu ban:\n")
                    .append("Hang muc: ").append(lead.getSubtype()).append("\n")
                    .append("Ngay du kien: ").append(lead.getEventDate()).append("\n\n")
                    .append(isWedding
                            ? "MMT phan hoi qua Zalo trong 15 phut gio hanh chinh."
                            : "MMT gui bao gia chi tiet trong 24 gio.")
                    .append("\n\nNguoi phu trach: ").append(contactName)
                    .append(" - Hotline/Zalo: ").append(contactPhone)
                    .append("\n\nCam on ban da tin tuong MMT.");
            message.setText(body.toString());
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send customer confirmation email for lead phone={}", lead.getPhone(), e);
        }
    }
}
