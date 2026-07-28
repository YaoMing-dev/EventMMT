package com.mmt.eventwedding.dto;

import com.mmt.eventwedding.model.Lead;
import com.mmt.eventwedding.model.LeadCategory;

import java.time.Instant;
import java.time.LocalDate;

public record LeadResponse(
        Long id,
        LeadCategory category,
        String subtype,
        LocalDate eventDate,
        Integer guestCount,
        String toneColor,
        String phone,
        Instant createdAt
) {
    public static LeadResponse from(Lead lead) {
        return new LeadResponse(
                lead.getId(),
                lead.getCategory(),
                lead.getSubtype(),
                lead.getEventDate(),
                lead.getGuestCount(),
                lead.getToneColor(),
                lead.getPhone(),
                lead.getCreatedAt()
        );
    }
}
