package com.mmt.eventwedding.service;

import com.mmt.eventwedding.dto.LeadRequest;
import com.mmt.eventwedding.dto.LeadResponse;
import com.mmt.eventwedding.model.Lead;
import com.mmt.eventwedding.repository.LeadRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final EmailService emailService;

    public LeadService(LeadRepository leadRepository, EmailService emailService) {
        this.leadRepository = leadRepository;
        this.emailService = emailService;
    }

    public LeadResponse createLead(LeadRequest request) {
        Lead lead = new Lead(
                request.category(),
                request.subtype(),
                request.eventDate(),
                request.guestCount(),
                request.toneColor(),
                request.phone(),
                request.email()
        );
        Lead saved = leadRepository.save(lead);
        emailService.sendNewLeadNotification(saved);
        if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
            emailService.sendCustomerConfirmation(saved);
        }
        return LeadResponse.from(saved);
    }

    public List<LeadResponse> listLeads() {
        return leadRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(LeadResponse::from)
                .toList();
    }

    public void deleteLead(Long id) {
        leadRepository.deleteById(id);
    }
}
