package com.mmt.eventwedding.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

// TAM THOI — chi de chan doan gui mail that tren production, xoa ngay sau
// khi xong. Khong lo mat khau, chi tra ve username/notify-to da che va ket
// qua gui that (khac testConnection() chi kiem tra bat tay/dang nhap).
@RestController
public class MailDebugController {

    private final JavaMailSenderImpl mailSender;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.host}")
    private String host;

    @Value("${spring.mail.port}")
    private String port;

    @Value("${app.notify.to-email}")
    private String notifyTo;

    public MailDebugController(JavaMailSenderImpl mailSender) {
        this.mailSender = mailSender;
    }

    @GetMapping("/api/debug/mail-check")
    public Map<String, Object> check() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("host", host);
        result.put("port", port);
        result.put("usernameMasked", mask(username));
        result.put("notifyToMasked", mask(notifyTo));
        try {
            mailSender.testConnection();
            result.put("connectionOk", true);
        } catch (Exception e) {
            result.put("connectionOk", false);
            result.put("connectionError", e.getClass().getSimpleName() + ": " + e.getMessage());
            return result;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(username);
            message.setTo(notifyTo);
            message.setSubject("MMT debug - test gui that " + Instant.now());
            message.setText("Day la mail test tu /api/debug/mail-check, xoa sau khi kiem tra xong.");
            mailSender.send(message);
            result.put("realSendOk", true);
        } catch (Exception e) {
            result.put("realSendOk", false);
            result.put("sendError", e.getClass().getName() + ": " + e.getMessage());
        }
        return result;
    }

    private static String mask(String value) {
        if (value == null || value.isBlank()) return "(trong)";
        int at = value.indexOf('@');
        if (at <= 1) return "***" + value.substring(Math.max(at, 0));
        return value.charAt(0) + "***" + value.substring(at);
    }
}
