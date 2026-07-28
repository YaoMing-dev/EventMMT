package com.mmt.eventwedding.service;

import com.mmt.eventwedding.model.Lead;
import com.mmt.eventwedding.model.LeadCategory;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EmailServiceTest {

    @Test
    void sendsNotificationWithLeadDetails() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailService service = new EmailService(mailSender);
        ReflectionTestUtils.setField(service, "toEmail", "owner@example.com");

        Lead lead = new Lead(LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001");

        service.sendNewLeadNotification(lead);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly("owner@example.com");
        assertThat(sent.getText()).contains("0900000001").contains("Khai truong");
    }

    @Test
    void doesNotThrowWhenMailSenderFails() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(any(SimpleMailMessage.class));
        EmailService service = new EmailService(mailSender);
        ReflectionTestUtils.setField(service, "toEmail", "owner@example.com");

        Lead lead = new Lead(LeadCategory.WEDDING, "Le Vu Quy", LocalDate.of(2026, 9, 1), null, "son", "0900000002");

        assertThatCode(() -> service.sendNewLeadNotification(lead)).doesNotThrowAnyException();
    }
}
