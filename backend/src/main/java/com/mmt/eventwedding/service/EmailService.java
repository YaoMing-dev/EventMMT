package com.mmt.eventwedding.service;

import com.mmt.eventwedding.model.Lead;
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
            message.setText(body.toString());
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send lead notification email for lead phone={}", lead.getPhone(), e);
        }
    }
}
