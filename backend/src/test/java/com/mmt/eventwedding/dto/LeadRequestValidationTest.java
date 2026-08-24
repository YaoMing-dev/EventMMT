package com.mmt.eventwedding.dto;

import com.mmt.eventwedding.model.LeadCategory;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class LeadRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    @Test
    void validRequestHasNoViolations() {
        LeadRequest request = new LeadRequest(
                LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", null);

        Set<ConstraintViolation<LeadRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void validRequestWithEmailHasNoViolations() {
        LeadRequest request = new LeadRequest(
                LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", "khach@example.com");

        Set<ConstraintViolation<LeadRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void malformedEmailFailsValidation() {
        LeadRequest request = new LeadRequest(
                LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", "khong-phai-email");

        Set<ConstraintViolation<LeadRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .contains("email");
    }

    @Test
    void blankPhoneFailsValidation() {
        LeadRequest request = new LeadRequest(
                LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "", null);

        Set<ConstraintViolation<LeadRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .contains("phone");
    }

    @Test
    void missingCategoryFailsValidation() {
        LeadRequest request = new LeadRequest(
                null, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", null);

        Set<ConstraintViolation<LeadRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .contains("category");
    }
}
