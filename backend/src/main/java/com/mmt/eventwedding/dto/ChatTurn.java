package com.mmt.eventwedding.dto;

import jakarta.validation.constraints.Size;

public record ChatTurn(
        String role,
        @Size(max = 2000, message = "Noi dung qua dai") String text
) {
}
