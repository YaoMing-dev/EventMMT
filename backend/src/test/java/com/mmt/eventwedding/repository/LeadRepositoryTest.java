package com.mmt.eventwedding.repository;

import com.mmt.eventwedding.model.Lead;
import com.mmt.eventwedding.model.LeadCategory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class LeadRepositoryTest {

    @Autowired
    private LeadRepository leadRepository;

    @Test
    void savesAndOrdersByCreatedAtDesc() throws InterruptedException {
        Lead first = leadRepository.save(new Lead(
                LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001"));
        Thread.sleep(5);
        Lead second = leadRepository.save(new Lead(
                LeadCategory.WEDDING, "Le Vu Quy", LocalDate.of(2026, 9, 1), null, "son", "0900000002"));

        List<Lead> all = leadRepository.findAllByOrderByCreatedAtDesc();

        assertThat(all).hasSize(2);
        assertThat(all.get(0).getId()).isEqualTo(second.getId());
        assertThat(all.get(1).getId()).isEqualTo(first.getId());
        assertThat(all.get(0).getCreatedAt()).isNotNull();
        assertThat(first.getGuestCount()).isEqualTo(300);
        assertThat(second.getToneColor()).isEqualTo("son");
    }
}
