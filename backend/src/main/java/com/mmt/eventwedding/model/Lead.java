package com.mmt.eventwedding.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadCategory category;

    @Column(nullable = false)
    private String subtype;

    @Column(nullable = false)
    private LocalDate eventDate;

    private Integer guestCount;

    private String toneColor;

    @Column(nullable = false)
    private String phone;

    private String email;

    @Column(nullable = false)
    private Instant createdAt;

    protected Lead() {
        // JPA
    }

    public Lead(LeadCategory category, String subtype, LocalDate eventDate,
                Integer guestCount, String toneColor, String phone, String email) {
        this.category = category;
        this.subtype = subtype;
        this.eventDate = eventDate;
        this.guestCount = guestCount;
        this.toneColor = toneColor;
        this.phone = phone;
        this.email = email;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public LeadCategory getCategory() { return category; }
    public String getSubtype() { return subtype; }
    public LocalDate getEventDate() { return eventDate; }
    public Integer getGuestCount() { return guestCount; }
    public String getToneColor() { return toneColor; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public Instant getCreatedAt() { return createdAt; }
}
