package com.mmt.eventwedding.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mmt.eventwedding.dto.LeadResponse;
import com.mmt.eventwedding.model.LeadCategory;
import com.mmt.eventwedding.service.LeadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LeadController.class)
@AutoConfigureMockMvc(addFilters = false)
class LeadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LeadService leadService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createLeadReturns201() throws Exception {
        LeadResponse response = new LeadResponse(
                1L, LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", Instant.now());
        when(leadService.createLead(any())).thenReturn(response);

        String body = """
                {"category":"EVENT","subtype":"Khai truong","eventDate":"2026-08-01","guestCount":300,"phone":"0900000001"}
                """;

        mockMvc.perform(post("/api/leads").contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.phone").value("0900000001"));
    }

    @Test
    void createLeadWithBlankPhoneReturns400() throws Exception {
        String body = """
                {"category":"EVENT","subtype":"Khai truong","eventDate":"2026-08-01","guestCount":300,"phone":""}
                """;

        mockMvc.perform(post("/api/leads").contentType("application/json").content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.phone").exists());
    }
}
