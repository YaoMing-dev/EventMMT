package com.mmt.eventwedding.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ChatRequest(
        @NotBlank(message = "Thieu pageContext")
        @Pattern(regexp = "EVENT|WEDDING", message = "pageContext khong hop le")
        String pageContext,
        @NotNull(message = "Thieu history")
        @Size(max = 30, message = "Lich su chat qua dai")
        @Valid
        List<ChatTurn> history
) {
}
