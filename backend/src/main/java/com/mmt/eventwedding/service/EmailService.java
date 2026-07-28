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
            message.setText(
                    "Loai: " + lead.getCategory() +
                    "\nHang muc: " + lead.getSubtype() +
                    "\nNgay du kien: " + lead.getEventDate() +
                    "\nSo khach: " + lead.getGuestCount() +
                    "\nTong mau: " + lead.getToneColor() +
                    "\nSDT: " + lead.getPhone()
            );
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send lead notification email for lead phone={}", lead.getPhone(), e);
        }
    }
}
