package com.mmt.eventwedding.dto;

import com.mmt.eventwedding.model.LeadCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record LeadRequest(
        @NotNull(message = "Vui long chon loai") LeadCategory category,
        @NotBlank(message = "Vui long chon hang muc")
        @Size(max = 200, message = "Hang muc qua dai")
        String subtype,
        @NotNull(message = "Vui long chon ngay du kien") LocalDate eventDate,
        Integer guestCount,
        @Size(max = 100, message = "Tong mau qua dai")
        String toneColor,
        @NotBlank(message = "Vui long nhap so dien thoai")
        @Pattern(regexp = "^[0-9 +()-]{8,15}$", message = "So dien thoai khong hop le")
        String phone,
        @NotBlank(message = "Vui long nhap email")
        @Email(message = "Email khong hop le")
        String email
) {}
