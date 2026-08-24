package com.mmt.eventwedding.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ChatRequest(
        @NotBlank(message = "Thieu pageContext") String pageContext,
        @NotNull(message = "Thieu history") List<ChatTurn> history
) {
}
