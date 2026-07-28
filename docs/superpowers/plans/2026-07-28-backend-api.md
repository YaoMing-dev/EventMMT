# MMT Event & Wedding — Backend API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Spring Boot REST API that (a) lists and serves real photos from `D:\Job\images\{events,wedding}`, (b) accepts and stores contact/quote-request leads with email notification, and (c) exposes an authenticated admin endpoint to list leads — fully runnable and curl-testable on its own, with no dependency on the frontend.

**Architecture:** Single Spring Boot module (`backend/`), layered `controller → service → repository`, PostgreSQL for persistence, H2 in-memory for the `test` profile. Images are read directly off disk (never copied into the repo); lead notification email is sent asynchronously and never blocks or fails the save.

**Tech Stack:** Java 17, Spring Boot 3.3.4 (Web, Data JPA, Mail, Security, Validation), Maven, PostgreSQL (runtime), H2 (test only), JUnit 5 + Mockito + Spring Test.

## Global Constraints

- Requires JDK 17+ and Maven 3.9+ installed locally (`java -version`, `mvn -v` to check).
- All API responses under `/api/**` use relative paths (e.g. `/api/images/events/foo.jpg`) — never emit absolute `http://localhost:8080/...` URLs. The frontend's dev proxy depends on this.
- Image base path is configurable (`app.images.base-path`), defaulting to `D:/Job/images` — never hard-code the path inside Java code.
- No `name` field on leads — the original site's forms never collected one.
- Admin endpoints (`/api/admin/**`) require HTTP Basic auth; all other `/api/**` endpoints are public.
- A failed email send must never cause a lead submission to fail or roll back.

---

### Task B1: Project scaffold, configuration, and context-loads test

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/java/com/mmt/eventwedding/EventWeddingApplication.java`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/main/resources/application-test.yml`
- Test: `backend/src/test/java/com/mmt/eventwedding/EventWeddingApplicationTests.java`

**Interfaces:**
- Produces: Spring Boot application context bootable under `test` profile (H2) and default profile (PostgreSQL). Package root `com.mmt.eventwedding` — every later task's classes live under this package.

- [ ] **Step 1: Create `backend/pom.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <groupId>com.mmt</groupId>
    <artifactId>event-wedding-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>event-wedding-backend</name>
    <description>MMT Event and Wedding backend API</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-mail</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 2: Create `backend/src/main/resources/application.yml`**

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mmt_event_wedding
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    open-in-view: false
  security:
    user:
      name: admin
      password: changeme
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-gmail-app-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

app:
  images:
    base-path: D:/Job/images
  notify:
    to-email: your-email@gmail.com
```

- [ ] **Step 3: Create `backend/src/main/resources/application-test.yml`**

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password: ""
  jpa:
    hibernate:
      ddl-auto: create-drop
    database-platform: org.hibernate.dialect.H2Dialect
    open-in-view: false
  security:
    user:
      name: admin
      password: test123
  mail:
    host: localhost
    port: 3025

app:
  images:
    base-path: ${java.io.tmpdir}
  notify:
    to-email: test@example.com
```

- [ ] **Step 4: Create `backend/src/main/java/com/mmt/eventwedding/EventWeddingApplication.java`**

```java
package com.mmt.eventwedding;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EventWeddingApplication {
    public static void main(String[] args) {
        SpringApplication.run(EventWeddingApplication.class, args);
    }
}
```

- [ ] **Step 5: Write the context-loads test**

```java
package com.mmt.eventwedding;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class EventWeddingApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 6: Run the test**

Run: `cd backend && mvn test -Dtest=EventWeddingApplicationTests`
Expected: PASS (`BUILD SUCCESS`, Spring context starts against the H2 `test` profile). If it fails with a datasource error, double-check `application-test.yml` was saved under `src/main/resources` (test resources fall back to main resources when there's no `src/test/resources` override — that's expected here, no separate test resources folder needed).

- [ ] **Step 7: Commit**

```bash
cd backend
git add pom.xml src/main/java/com/mmt/eventwedding/EventWeddingApplication.java src/main/resources/application.yml src/main/resources/application-test.yml src/test/java/com/mmt/eventwedding/EventWeddingApplicationTests.java
git commit -m "Scaffold Spring Boot backend with dev/test profiles"
```

---

### Task B2: Lead entity, category enum, repository

**Files:**
- Create: `backend/src/main/java/com/mmt/eventwedding/model/LeadCategory.java`
- Create: `backend/src/main/java/com/mmt/eventwedding/model/Lead.java`
- Create: `backend/src/main/java/com/mmt/eventwedding/repository/LeadRepository.java`
- Test: `backend/src/test/java/com/mmt/eventwedding/repository/LeadRepositoryTest.java`

**Interfaces:**
- Consumes: nothing (foundational).
- Produces: `Lead` (fields: `Long id`, `LeadCategory category`, `String subtype`, `LocalDate eventDate`, `Integer guestCount`, `String toneColor`, `String phone`, `Instant createdAt`, all with public getters), constructor `Lead(LeadCategory, String, LocalDate, Integer, String, String)`. `LeadRepository extends JpaRepository<Lead, Long>` with `List<Lead> findAllByOrderByCreatedAtDesc()`.

- [ ] **Step 1: Create `LeadCategory.java`**

```java
package com.mmt.eventwedding.model;

public enum LeadCategory {
    EVENT,
    WEDDING
}
```

- [ ] **Step 2: Create `Lead.java`**

```java
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

    @Column(nullable = false)
    private Instant createdAt;

    protected Lead() {
        // JPA
    }

    public Lead(LeadCategory category, String subtype, LocalDate eventDate,
                Integer guestCount, String toneColor, String phone) {
        this.category = category;
        this.subtype = subtype;
        this.eventDate = eventDate;
        this.guestCount = guestCount;
        this.toneColor = toneColor;
        this.phone = phone;
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
    public Instant getCreatedAt() { return createdAt; }
}
```

- [ ] **Step 3: Create `LeadRepository.java`**

```java
package com.mmt.eventwedding.repository;

import com.mmt.eventwedding.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findAllByOrderByCreatedAtDesc();
}
```

- [ ] **Step 4: Write the failing test**

```java
package com.mmt.eventwedding.repository;

import com.mmt.eventwedding.model.Lead;
import com.mmt.eventwedding.model.LeadCategory;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class LeadRepositoryTest {

    @org.springframework.beans.factory.annotation.Autowired
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
```

- [ ] **Step 5: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=LeadRepositoryTest`
Expected: FAIL to compile (`Lead`, `LeadCategory`, `LeadRepository` referenced before... actually they exist from steps 1-3). If steps 1-3 were done first, this test should instead fail only if there's a logic bug; to genuinely see red first, comment out `onCreate()`'s body temporarily — otherwise skip red/green here and proceed straight to step 6, since the entity/repository code is trivial infrastructure written alongside its test.

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=LeadRepositoryTest`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
cd backend
git add src/main/java/com/mmt/eventwedding/model/LeadCategory.java src/main/java/com/mmt/eventwedding/model/Lead.java src/main/java/com/mmt/eventwedding/repository/LeadRepository.java src/test/java/com/mmt/eventwedding/repository/LeadRepositoryTest.java
git commit -m "Add Lead entity, LeadCategory enum, and repository"
```

---

### Task B3: Lead request/response DTOs with Bean Validation

**Files:**
- Create: `backend/src/main/java/com/mmt/eventwedding/dto/LeadRequest.java`
- Create: `backend/src/main/java/com/mmt/eventwedding/dto/LeadResponse.java`
- Test: `backend/src/test/java/com/mmt/eventwedding/dto/LeadRequestValidationTest.java`

**Interfaces:**
- Consumes: `Lead`, `LeadCategory` (Task B2).
- Produces: `LeadRequest(LeadCategory category, String subtype, LocalDate eventDate, Integer guestCount, String toneColor, String phone)` record with validation annotations. `LeadResponse(Long id, LeadCategory category, String subtype, LocalDate eventDate, Integer guestCount, String toneColor, String phone, Instant createdAt)` record with static factory `LeadResponse.from(Lead)`.

- [ ] **Step 1: Create `LeadRequest.java`**

```java
package com.mmt.eventwedding.dto;

import com.mmt.eventwedding.model.LeadCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record LeadRequest(
        @NotNull(message = "Vui long chon loai") LeadCategory category,
        @NotBlank(message = "Vui long chon hang muc") String subtype,
        @NotNull(message = "Vui long chon ngay du kien") LocalDate eventDate,
        Integer guestCount,
        String toneColor,
        @NotBlank(message = "Vui long nhap so dien thoai")
        @Pattern(regexp = "^[0-9 +()-]{8,15}$", message = "So dien thoai khong hop le")
        String phone
) {}
```

- [ ] **Step 2: Create `LeadResponse.java`**

```java
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
```

- [ ] **Step 3: Write the failing test**

```java
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
                LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001");

        Set<ConstraintViolation<LeadRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void blankPhoneFailsValidation() {
        LeadRequest request = new LeadRequest(
                LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "");

        Set<ConstraintViolation<LeadRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .contains("phone");
    }

    @Test
    void missingCategoryFailsValidation() {
        LeadRequest request = new LeadRequest(
                null, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001");

        Set<ConstraintViolation<LeadRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .contains("category");
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=LeadRequestValidationTest`
Expected: PASS (all 3 cases)

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/java/com/mmt/eventwedding/dto/LeadRequest.java src/main/java/com/mmt/eventwedding/dto/LeadResponse.java src/test/java/com/mmt/eventwedding/dto/LeadRequestValidationTest.java
git commit -m "Add Lead request/response DTOs with validation"
```

---

### Task B4: Email notification service

**Files:**
- Create: `backend/src/main/java/com/mmt/eventwedding/service/EmailService.java`
- Test: `backend/src/test/java/com/mmt/eventwedding/service/EmailServiceTest.java`

**Interfaces:**
- Consumes: `Lead` (Task B2).
- Produces: `EmailService.sendNewLeadNotification(Lead lead)` — `@Async void`, never throws.

- [ ] **Step 1: Write the failing test**

```java
package com.mmt.eventwedding.service;

import com.mmt.eventwedding.model.Lead;
import com.mmt.eventwedding.model.LeadCategory;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EmailServiceTest {

    @Test
    void sendsNotificationWithLeadDetails() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailService service = new EmailService(mailSender);
        ReflectionTestUtils.setField(service, "toEmail", "owner@example.com");

        Lead lead = new Lead(LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001");

        service.sendNewLeadNotification(lead);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly("owner@example.com");
        assertThat(sent.getText()).contains("0900000001").contains("Khai truong");
    }

    @Test
    void doesNotThrowWhenMailSenderFails() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(any(SimpleMailMessage.class));
        EmailService service = new EmailService(mailSender);
        ReflectionTestUtils.setField(service, "toEmail", "owner@example.com");

        Lead lead = new Lead(LeadCategory.WEDDING, "Le Vu Quy", LocalDate.of(2026, 9, 1), null, "son", "0900000002");

        assertThatCode(() -> service.sendNewLeadNotification(lead)).doesNotThrowAnyException();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=EmailServiceTest`
Expected: FAIL (`EmailService` does not exist yet — compile error)

- [ ] **Step 3: Write minimal implementation**

```java
package com.mmt.eventwedding.service;

import com.mmt.eventwedding.model.Lead;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.notify.to-email}")
    private String toEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendNewLeadNotification(Lead lead) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("MMT - Lead moi: " + lead.getCategory());
            message.setText(
                    "Loai: " + lead.getCategory() +
                    "\nHang muc: " + lead.getSubtype() +
                    "\nNgay du kien: " + lead.getEventDate() +
                    "\nSo khach: " + lead.getGuestCount() +
                    "\nTong mau: " + lead.getToneColor() +
                    "\nSDT: " + lead.getPhone()
            );
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send lead notification email for lead phone={}", lead.getPhone(), e);
        }
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=EmailServiceTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/java/com/mmt/eventwedding/service/EmailService.java src/test/java/com/mmt/eventwedding/service/EmailServiceTest.java
git commit -m "Add async email notification service for new leads"
```

---

### Task B5: Lead service (save + notify + list)

**Files:**
- Create: `backend/src/main/java/com/mmt/eventwedding/service/LeadService.java`
- Test: `backend/src/test/java/com/mmt/eventwedding/service/LeadServiceTest.java`

**Interfaces:**
- Consumes: `LeadRepository` (B2), `EmailService` (B4), `LeadRequest`/`LeadResponse` (B3).
- Produces: `LeadService.createLead(LeadRequest) -> LeadResponse`, `LeadService.listLeads() -> List<LeadResponse>`.

- [ ] **Step 1: Write the failing test**

```java
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

        Lead saved = new Lead(LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001");
        ReflectionTestUtils.setField(saved, "id", 42L);
        ReflectionTestUtils.setField(saved, "createdAt", Instant.parse("2026-07-28T00:00:00Z"));
        when(repository.save(any(Lead.class))).thenReturn(saved);

        LeadRequest request = new LeadRequest(
                LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001");

        LeadResponse response = service.createLead(request);

        ArgumentCaptor<Lead> captor = ArgumentCaptor.forClass(Lead.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getPhone()).isEqualTo("0900000001");

        verify(emailService).sendNewLeadNotification(saved);

        assertThat(response.id()).isEqualTo(42L);
        assertThat(response.phone()).isEqualTo("0900000001");
    }

    @Test
    void listLeadsMapsRepositoryResults() {
        LeadRepository repository = mock(LeadRepository.class);
        EmailService emailService = mock(EmailService.class);
        LeadService service = new LeadService(repository, emailService);

        Lead lead = new Lead(LeadCategory.WEDDING, "Le Vu Quy", LocalDate.of(2026, 9, 1), null, "son", "0900000002");
        ReflectionTestUtils.setField(lead, "id", 1L);
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(lead));

        List<LeadResponse> result = service.listLeads();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).toneColor()).isEqualTo("son");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=LeadServiceTest`
Expected: FAIL (`LeadService` does not exist)

- [ ] **Step 3: Write minimal implementation**

```java
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
                request.phone()
        );
        Lead saved = leadRepository.save(lead);
        emailService.sendNewLeadNotification(saved);
        return LeadResponse.from(saved);
    }

    public List<LeadResponse> listLeads() {
        return leadRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(LeadResponse::from)
                .toList();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=LeadServiceTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/java/com/mmt/eventwedding/service/LeadService.java src/test/java/com/mmt/eventwedding/service/LeadServiceTest.java
git commit -m "Add LeadService for creating and listing leads"
```

---

### Task B6: Global exception handler + public lead submission endpoint

**Files:**
- Create: `backend/src/main/java/com/mmt/eventwedding/exception/ImageNotFoundException.java`
- Create: `backend/src/main/java/com/mmt/eventwedding/exception/GlobalExceptionHandler.java`
- Create: `backend/src/main/java/com/mmt/eventwedding/controller/LeadController.java`
- Test: `backend/src/test/java/com/mmt/eventwedding/controller/LeadControllerTest.java`

**Interfaces:**
- Consumes: `LeadService` (B5), `LeadRequest`/`LeadResponse` (B3).
- Produces: `POST /api/leads` (201 + `LeadResponse` JSON on success, 400 + field-error map on validation failure). `GET /api/admin/leads` (defined here, secured in Task B7) returning `List<LeadResponse>`. `ImageNotFoundException(String category, String filename)` for later use by Task B8/B9.

- [ ] **Step 1: Create `ImageNotFoundException.java`**

```java
package com.mmt.eventwedding.exception;

public class ImageNotFoundException extends RuntimeException {
    public ImageNotFoundException(String category, String filename) {
        super("Image not found: category=" + category + ", filename=" + filename);
    }
}
```

- [ ] **Step 2: Create `GlobalExceptionHandler.java`**

```java
package com.mmt.eventwedding.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            errors.put(err.getField(), err.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(ImageNotFoundException.class)
    public ResponseEntity<Void> handleImageNotFound(ImageNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
```

- [ ] **Step 3: Write the failing test**

```java
package com.mmt.eventwedding.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mmt.eventwedding.dto.LeadResponse;
import com.mmt.eventwedding.model.LeadCategory;
import com.mmt.eventwedding.service.LeadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LeadController.class)
@AutoConfigureMockMvc(addFilters = false)
class LeadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LeadService leadService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createLeadReturns201() throws Exception {
        LeadResponse response = new LeadResponse(
                1L, LeadCategory.EVENT, "Khai truong", LocalDate.of(2026, 8, 1), 300, null, "0900000001", Instant.now());
        when(leadService.createLead(any())).thenReturn(response);

        String body = """
                {"category":"EVENT","subtype":"Khai truong","eventDate":"2026-08-01","guestCount":300,"phone":"0900000001"}
                """;

        mockMvc.perform(post("/api/leads").contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.phone").value("0900000001"));
    }

    @Test
    void createLeadWithBlankPhoneReturns400() throws Exception {
        String body = """
                {"category":"EVENT","subtype":"Khai truong","eventDate":"2026-08-01","guestCount":300,"phone":""}
                """;

        mockMvc.perform(post("/api/leads").contentType("application/json").content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.phone").exists());
    }
}
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=LeadControllerTest`
Expected: FAIL (`LeadController` does not exist)

- [ ] **Step 5: Write minimal implementation**

```java
package com.mmt.eventwedding.controller;

import com.mmt.eventwedding.dto.LeadRequest;
import com.mmt.eventwedding.dto.LeadResponse;
import com.mmt.eventwedding.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping("/leads")
    public ResponseEntity<LeadResponse> create(@Valid @RequestBody LeadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(request));
    }

    @GetMapping("/admin/leads")
    public List<LeadResponse> list() {
        return leadService.listLeads();
    }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=LeadControllerTest`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
cd backend
git add src/main/java/com/mmt/eventwedding/exception/ImageNotFoundException.java src/main/java/com/mmt/eventwedding/exception/GlobalExceptionHandler.java src/main/java/com/mmt/eventwedding/controller/LeadController.java src/test/java/com/mmt/eventwedding/controller/LeadControllerTest.java
git commit -m "Add lead submission endpoint and global exception handling"
```

---

### Task B7: Security config (admin auth) + CORS

**Files:**
- Create: `backend/src/main/java/com/mmt/eventwedding/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/mmt/eventwedding/config/CorsConfig.java`
- Test: `backend/src/test/java/com/mmt/eventwedding/LeadFlowIntegrationTest.java`

**Interfaces:**
- Consumes: `LeadController` (B6), `application-test.yml`'s `spring.security.user.*` (B1).
- Produces: `/api/admin/**` requires HTTP Basic auth; all other `/api/**` is public; CORS allows `http://localhost:5173` for `GET`/`POST`/`OPTIONS`.

- [ ] **Step 1: Create `SecurityConfig.java`**

```java
package com.mmt.eventwedding.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/admin/**").authenticated()
                        .anyRequest().permitAll()
                )
                .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
```

- [ ] **Step 2: Create `CorsConfig.java`**

```java
package com.mmt.eventwedding.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

- [ ] **Step 3: Write the failing test**

```java
package com.mmt.eventwedding;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.LocalServerPort;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class LeadFlowIntegrationTest {

    @LocalServerPort
    private int port;

    @org.springframework.beans.factory.annotation.Autowired
    private TestRestTemplate restTemplate;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void publicCanSubmitLead_adminRequiresAuth() {
        Map<String, Object> body = Map.of(
                "category", "EVENT",
                "subtype", "Khai truong",
                "eventDate", "2026-08-01",
                "guestCount", 300,
                "phone", "0911222333"
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> createResponse = restTemplate.postForEntity(
                url("/api/leads"), new HttpEntity<>(body, headers), String.class);
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<String> unauthorized = restTemplate.getForEntity(url("/api/admin/leads"), String.class);
        assertThat(unauthorized.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        ResponseEntity<List> authorized = restTemplate
                .withBasicAuth("admin", "test123")
                .getForEntity(url("/api/admin/leads"), List.class);
        assertThat(authorized.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(authorized.getBody()).isNotEmpty();
    }
}
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=LeadFlowIntegrationTest`
Expected: FAIL — `/api/admin/leads` returns 200 without auth (no `SecurityConfig` yet), so the `isEqualTo(UNAUTHORIZED)` assertion fails.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=LeadFlowIntegrationTest`
Expected: PASS (steps 1-2 already added `SecurityConfig`/`CorsConfig` before this test ran)

- [ ] **Step 6: Commit**

```bash
cd backend
git add src/main/java/com/mmt/eventwedding/config/SecurityConfig.java src/main/java/com/mmt/eventwedding/config/CorsConfig.java src/test/java/com/mmt/eventwedding/LeadFlowIntegrationTest.java
git commit -m "Secure admin endpoints with HTTP Basic auth and configure CORS"
```

---

### Task B8: Image service (list, safe file resolution, content type)

**Files:**
- Create: `backend/src/main/java/com/mmt/eventwedding/dto/ImageDto.java`
- Create: `backend/src/main/java/com/mmt/eventwedding/service/ImageService.java`
- Test: `backend/src/test/java/com/mmt/eventwedding/service/ImageServiceTest.java`

**Interfaces:**
- Consumes: `ImageNotFoundException` (B6), `app.images.base-path` property.
- Produces: `ImageDto(String filename, String url)`. `ImageService.listImages(String category) -> List<ImageDto>`, `ImageService.loadImage(String category, String filename) -> org.springframework.core.io.Resource`, `ImageService.contentTypeFor(String filename) -> String`.

- [ ] **Step 1: Create `ImageDto.java`**

```java
package com.mmt.eventwedding.dto;

public record ImageDto(String filename, String url) {}
```

- [ ] **Step 2: Write the failing test**

```java
package com.mmt.eventwedding.service;

import com.mmt.eventwedding.dto.ImageDto;
import com.mmt.eventwedding.exception.ImageNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageServiceTest {

    @Test
    void listImagesFiltersAndSortsByFilename(@TempDir Path tempDir) throws IOException {
        Path eventsDir = tempDir.resolve("events");
        Files.createDirectories(eventsDir);
        Files.writeString(eventsDir.resolve("b.jpg"), "b");
        Files.writeString(eventsDir.resolve("a.png"), "a");
        Files.writeString(eventsDir.resolve("skip.heic"), "skip");
        Files.writeString(eventsDir.resolve("notes.txt"), "skip");

        ImageService service = new ImageService(tempDir.toString());

        List<ImageDto> images = service.listImages("events");

        assertThat(images).extracting(ImageDto::filename).containsExactly("a.png", "b.jpg");
        assertThat(images).extracting(ImageDto::url)
                .containsExactly("/api/images/events/a.png", "/api/images/events/b.jpg");
    }

    @Test
    void listImagesReturnsEmptyForMissingDirectory(@TempDir Path tempDir) {
        ImageService service = new ImageService(tempDir.toString());

        assertThat(service.listImages("wedding")).isEmpty();
    }

    @Test
    void loadImageRejectsPathTraversal(@TempDir Path tempDir) throws IOException {
        Path eventsDir = tempDir.resolve("events");
        Files.createDirectories(eventsDir);
        Files.writeString(eventsDir.resolve("real.jpg"), "content");
        Path secret = tempDir.resolve("secret.txt");
        Files.writeString(secret, "top secret");

        ImageService service = new ImageService(tempDir.toString());

        assertThatThrownBy(() -> service.loadImage("events", "../secret.txt"))
                .isInstanceOf(ImageNotFoundException.class);
    }

    @Test
    void loadImageReturnsExistingFile(@TempDir Path tempDir) throws IOException {
        Path eventsDir = tempDir.resolve("events");
        Files.createDirectories(eventsDir);
        Files.writeString(eventsDir.resolve("real.jpg"), "content");

        ImageService service = new ImageService(tempDir.toString());

        Resource resource = service.loadImage("events", "real.jpg");

        assertThat(resource.exists()).isTrue();
    }

    @Test
    void contentTypeForKnownExtensions() {
        ImageService service = new ImageService("/anywhere");

        assertThat(service.contentTypeFor("a.jpg")).isEqualTo("image/jpeg");
        assertThat(service.contentTypeFor("a.jpeg")).isEqualTo("image/jpeg");
        assertThat(service.contentTypeFor("a.png")).isEqualTo("image/png");
        assertThat(service.contentTypeFor("a.webp")).isEqualTo("image/webp");
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=ImageServiceTest`
Expected: FAIL (`ImageService` does not exist)

- [ ] **Step 4: Write minimal implementation**

```java
package com.mmt.eventwedding.service;

import com.mmt.eventwedding.dto.ImageDto;
import com.mmt.eventwedding.exception.ImageNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

@Service
public class ImageService {

    private static final Set<String> ALLOWED_CATEGORIES = Set.of("events", "wedding");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final Path basePath;

    public ImageService(@Value("${app.images.base-path}") String basePathStr) {
        this.basePath = Paths.get(basePathStr).toAbsolutePath().normalize();
    }

    public List<ImageDto> listImages(String category) {
        validateCategory(category);
        Path dir = basePath.resolve(category);
        if (!Files.isDirectory(dir)) {
            return List.of();
        }
        try (Stream<Path> files = Files.list(dir)) {
            return files
                    .filter(Files::isRegularFile)
                    .filter(p -> hasAllowedExtension(p.getFileName().toString()))
                    .sorted(Comparator.comparing(p -> p.getFileName().toString()))
                    .map(p -> new ImageDto(
                            p.getFileName().toString(),
                            "/api/images/" + category + "/" + p.getFileName().toString()))
                    .toList();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public Resource loadImage(String category, String filename) {
        validateCategory(category);
        Path dir = basePath.resolve(category).normalize();
        Path file = dir.resolve(filename).normalize();
        if (!file.startsWith(dir) || !Files.isRegularFile(file) || !hasAllowedExtension(filename)) {
            throw new ImageNotFoundException(category, filename);
        }
        return new FileSystemResource(file);
    }

    public String contentTypeFor(String filename) {
        return switch (extensionOf(filename)) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }

    private void validateCategory(String category) {
        if (!ALLOWED_CATEGORIES.contains(category)) {
            throw new ImageNotFoundException(category, null);
        }
    }

    private boolean hasAllowedExtension(String filename) {
        return ALLOWED_EXTENSIONS.contains(extensionOf(filename));
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase();
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=ImageServiceTest`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd backend
git add src/main/java/com/mmt/eventwedding/dto/ImageDto.java src/main/java/com/mmt/eventwedding/service/ImageService.java src/test/java/com/mmt/eventwedding/service/ImageServiceTest.java
git commit -m "Add ImageService with safe path resolution and extension filtering"
```

---

### Task B9: Image controller

**Files:**
- Create: `backend/src/main/java/com/mmt/eventwedding/controller/ImageController.java`
- Test: `backend/src/test/java/com/mmt/eventwedding/controller/ImageControllerTest.java`

**Interfaces:**
- Consumes: `ImageService` (B8), `GlobalExceptionHandler` (B6).
- Produces: `GET /api/images/{category}` → JSON array of `ImageDto`. `GET /api/images/{category}/{filename}` → image bytes with matching `Content-Type`; 404 via `ImageNotFoundException` for bad category/file.

- [ ] **Step 1: Write the failing test**

```java
package com.mmt.eventwedding.controller;

import com.mmt.eventwedding.dto.ImageDto;
import com.mmt.eventwedding.exception.ImageNotFoundException;
import com.mmt.eventwedding.service.ImageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ImageController.class)
@AutoConfigureMockMvc(addFilters = false)
class ImageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ImageService imageService;

    @Test
    void listReturnsImageDtos() throws Exception {
        when(imageService.listImages("events")).thenReturn(List.of(
                new ImageDto("a.jpg", "/api/images/events/a.jpg")
        ));

        mockMvc.perform(get("/api/images/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].filename").value("a.jpg"))
                .andExpect(jsonPath("$[0].url").value("/api/images/events/a.jpg"));
    }

    @Test
    void getReturnsImageBytesWithContentType() throws Exception {
        byte[] bytes = "fake-image-bytes".getBytes();
        when(imageService.loadImage("events", "a.jpg")).thenReturn(new ByteArrayResource(bytes));
        when(imageService.contentTypeFor("a.jpg")).thenReturn("image/jpeg");

        mockMvc.perform(get("/api/images/events/a.jpg"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"))
                .andExpect(content().bytes(bytes));
    }

    @Test
    void getReturns404WhenNotFound() throws Exception {
        when(imageService.loadImage("events", "missing.jpg"))
                .thenThrow(new ImageNotFoundException("events", "missing.jpg"));

        mockMvc.perform(get("/api/images/events/missing.jpg"))
                .andExpect(status().isNotFound());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=ImageControllerTest`
Expected: FAIL (`ImageController` does not exist)

- [ ] **Step 3: Write minimal implementation**

```java
package com.mmt.eventwedding.controller;

import com.mmt.eventwedding.service.ImageService;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import com.mmt.eventwedding.dto.ImageDto;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @GetMapping("/{category}")
    public List<ImageDto> list(@PathVariable String category) {
        return imageService.listImages(category);
    }

    @GetMapping("/{category}/{filename}")
    public ResponseEntity<Resource> get(@PathVariable String category, @PathVariable String filename) {
        Resource resource = imageService.loadImage(category, filename);
        MediaType contentType = MediaType.parseMediaType(imageService.contentTypeFor(filename));
        return ResponseEntity.ok().contentType(contentType).body(resource);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=ImageControllerTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/java/com/mmt/eventwedding/controller/ImageController.java src/test/java/com/mmt/eventwedding/controller/ImageControllerTest.java
git commit -m "Add image listing and file-serving endpoints"
```

---

### Task B10: Backend README and manual end-to-end verification

**Files:**
- Create: `backend/README.md`

**Interfaces:**
- Consumes: everything from B1-B9.
- Produces: none (documentation + manual verification only).

- [ ] **Step 1: Create `backend/README.md`**

```markdown
# MMT Event & Wedding — Backend

Spring Boot REST API: lead capture (contact/quote forms) with email
notification, and an image API serving real photos from `D:\Job\images`.

## Prerequisites

- JDK 17+
- Maven 3.9+
- PostgreSQL (local install or Docker)

## First-time setup

1. Create the database:
   ```bash
   createdb mmt_event_wedding
   # or, with Docker:
   docker run --name mmt-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
   docker exec -it mmt-postgres createdb -U postgres mmt_event_wedding
   ```
2. Edit `src/main/resources/application.yml`:
   - `spring.datasource.username` / `password` — your local Postgres credentials.
   - `spring.security.user.name` / `password` — the admin login for `/admin` on the frontend.
   - `spring.mail.username` / `password` — a Gmail address + [app password](https://myaccount.google.com/apppasswords) (or another SMTP provider).
   - `app.notify.to-email` — where new-lead notification emails are sent.
   - `app.images.base-path` — defaults to `D:/Job/images`; change if your photos live elsewhere.

## Run

```bash
cd backend
mvn spring-boot:run
```

The API listens on `http://localhost:8080`.

## Run tests

```bash
cd backend
mvn test
```

## Manual verification (after `mvn spring-boot:run`)

```bash
# List event photos
curl http://localhost:8080/api/images/events

# Fetch one photo (use a real filename from the list above)
curl -o test.jpg http://localhost:8080/api/images/events/<filename>.jpg

# Submit a lead (public)
curl -X POST http://localhost:8080/api/leads \
  -H "Content-Type: application/json" \
  -d '{"category":"EVENT","subtype":"Khai truong","eventDate":"2026-08-01","guestCount":300,"phone":"0900000001"}'

# Admin list without auth -> expect 401
curl -i http://localhost:8080/api/admin/leads

# Admin list with auth -> expect 200 and the lead just created
curl -u admin:changeme http://localhost:8080/api/admin/leads
```

Check your inbox at `app.notify.to-email` for the lead notification email.
```

- [ ] **Step 2: Manually verify**

Follow every command in the README's "Manual verification" section against a running instance (`mvn spring-boot:run` in one terminal, curl commands in another). Confirm: image list returns real filenames from `D:\Job\images\events`, the fetched photo opens correctly, lead POST returns 201, unauthenticated admin GET returns 401, authenticated admin GET returns 200 with the created lead, and the notification email arrives.

- [ ] **Step 3: Commit**

```bash
cd backend
git add README.md
git commit -m "Add backend README with setup and manual verification steps"
```
