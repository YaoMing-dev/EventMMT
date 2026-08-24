package com.mmt.eventwedding.service;

import com.mmt.eventwedding.dto.LeadRequest;
import com.mmt.eventwedding.dto.LeadResponse;
import com.mmt.eventwedding.model.Lead;
import com.mmt.eventwedding.model.LeadCategory;
import com.mmt.eventwedding.repository.LeadRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LeadServiceTest {

    @Test
    void createLeadSavesAndNotifies() {
        LeadRepository repository = mock(LeadRepository.class);
        EmailService emailService = mock(EmailService.class);
        LeadService service = new LeadService(repository, emailService);

        Lead saved = new Lead(LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", null);
        ReflectionTestUtils.setField(saved, "id", 42L);
        ReflectionTestUtils.setField(saved, "createdAt", Instant.parse("2026-07-28T00:00:00Z"));
        when(repository.save(any(Lead.class))).thenReturn(saved);

        LeadRequest request = new LeadRequest(
                LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", null);

        LeadResponse response = service.createLead(request);

        ArgumentCaptor<Lead> captor = ArgumentCaptor.forClass(Lead.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getPhone()).isEqualTo("0900000001");

        verify(emailService).sendNewLeadNotification(saved);
        verify(emailService, never()).sendCustomerConfirmation(any());

        assertThat(response.id()).isEqualTo(42L);
        assertThat(response.phone()).isEqualTo("0900000001");
    }

    @Test
    void createLeadWithEmailAlsoSendsCustomerConfirmation() {
        LeadRepository repository = mock(LeadRepository.class);
        EmailService emailService = mock(EmailService.class);
        LeadService service = new LeadService(repository, emailService);

        Lead saved = new Lead(LeadCategory.WEDDING, "Le Vu Quy", LocalDate.of(2026, 9, 1), null, null, "0900000002", "khach@example.com");
        ReflectionTestUtils.setField(saved, "id", 43L);
        ReflectionTestUtils.setField(saved, "createdAt", Instant.parse("2026-07-28T00:00:00Z"));
        when(repository.save(any(Lead.class))).thenReturn(saved);

        LeadRequest request = new LeadRequest(
                LeadCategory.WEDDING, "Le Vu Quy", LocalDate.of(2026, 9, 1), null, null, "0900000002", "khach@example.com");

        LeadResponse response = service.createLead(request);

        verify(emailService).sendCustomerConfirmation(saved);
        assertThat(response.email()).isEqualTo("khach@example.com");
    }

    @Test
    void listLeadsMapsRepositoryResults() {
        LeadRepository repository = mock(LeadRepository.class);
        EmailService emailService = mock(EmailService.class);
        LeadService service = new LeadService(repository, emailService);

        Lead lead = new Lead(LeadCategory.WEDDING, "Le Vu Quy", LocalDate.of(2026, 9, 1), null, "son", "0900000002", null);
        ReflectionTestUtils.setField(lead, "id", 1L);
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(lead));

        List<LeadResponse> result = service.listLeads();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).toneColor()).isEqualTo("son");
    }
}
