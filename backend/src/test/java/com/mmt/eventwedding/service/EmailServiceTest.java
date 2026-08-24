package com.mmt.eventwedding.service;

import com.mmt.eventwedding.model.Lead;
import com.mmt.eventwedding.model.LeadCategory;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EmailServiceTest {

    @SuppressWarnings("unchecked")
    private static HttpResponse<String> mockResponse(int status, String body) {
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(status);
        when(response.body()).thenReturn(body);
        return response;
    }

    private static EmailService newService(HttpClient httpClient, String toEmail) throws Exception {
        EmailService service = new EmailService();
        ReflectionTestUtils.setField(service, "httpClient", httpClient);
        ReflectionTestUtils.setField(service, "toEmail", toEmail);
        ReflectionTestUtils.setField(service, "resendApiKey", "test-key");
        return service;
    }

    @Test
    void sendsNotificationWithLeadDetailsToResend() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(mockResponse(200, "{\"id\":\"abc\"}"));
        EmailService service = newService(httpClient, "owner@example.com");

        Lead lead = new Lead(LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", null);

        service.sendNewLeadNotification(lead);

        ArgumentCaptor<HttpRequest> captor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(httpClient).send(captor.capture(), any(HttpResponse.BodyHandler.class));
        HttpRequest sent = captor.getValue();
        assertThat(sent.uri().toString()).isEqualTo("https://api.resend.com/emails");
        assertThat(sent.headers().firstValue("Authorization")).contains("Bearer test-key");
    }

    @Test
    void doesNotThrowWhenResendCallFails() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenThrow(new java.io.IOException("network down"));
        EmailService service = newService(httpClient, "owner@example.com");

        Lead lead = new Lead(LeadCategory.WEDDING, "Le Vu Quy", LocalDate.of(2026, 9, 1), null, "son", "0900000002", null);

        assertThatCode(() -> service.sendNewLeadNotification(lead)).doesNotThrowAnyException();
    }

    @Test
    void logsButDoesNotThrowWhenResendRejectsWithNon2xx() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(mockResponse(422, "{\"message\":\"invalid from\"}"));
        EmailService service = newService(httpClient, "owner@example.com");

        Lead lead = new Lead(LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", null);

        assertThatCode(() -> service.sendNewLeadNotification(lead)).doesNotThrowAnyException();
    }

    @Test
    void sendsCustomerConfirmationToLeadEmailWithMatchingContact() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(mockResponse(200, "{\"id\":\"abc\"}"));
        EmailService service = newService(httpClient, "owner@example.com");

        Lead lead = new Lead(LeadCategory.WEDDING, "Le Vu Quy", LocalDate.of(2026, 9, 1), null, null, "0900000002", "khach@example.com");

        service.sendCustomerConfirmation(lead);

        ArgumentCaptor<HttpRequest> captor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(httpClient).send(captor.capture(), any(HttpResponse.BodyHandler.class));
        assertThat(captor.getValue().uri().toString()).isEqualTo("https://api.resend.com/emails");
    }

    @Test
    void doesNotThrowWhenCustomerConfirmationCallFails() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenThrow(new java.io.IOException("network down"));
        EmailService service = newService(httpClient, "owner@example.com");

        Lead lead = new Lead(LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", "khach@example.com");

        assertThatCode(() -> service.sendCustomerConfirmation(lead)).doesNotThrowAnyException();
    }
}
