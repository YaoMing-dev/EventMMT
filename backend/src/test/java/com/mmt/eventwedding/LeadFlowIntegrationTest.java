package com.mmt.eventwedding;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class LeadFlowIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void publicCanSubmitLead_adminRequiresAuth() {
        Map<String, Object> body = Map.of(
                "category", "EVENT",
                "subtype", "Khai truong",
                "eventDate", "2026-08-01",
                "guestCount", 300,
                "phone", "0911222333"
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> createResponse = restTemplate.postForEntity(
                url("/api/leads"), new HttpEntity<>(body, headers), String.class);
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<String> unauthorized = restTemplate.getForEntity(url("/api/admin/leads"), String.class);
        assertThat(unauthorized.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        ResponseEntity<List> authorized = restTemplate
                .withBasicAuth("admin", "test123")
                .getForEntity(url("/api/admin/leads"), List.class);
        assertThat(authorized.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(authorized.getBody()).isNotEmpty();
    }
}
