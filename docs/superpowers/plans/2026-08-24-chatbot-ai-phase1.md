# Chatbot AI — Phase 1 (Chat FAQ cơ bản) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating chatbot widget (event + wedding pages) that answers customer questions using Gemini, backed by a static system prompt per category. No DB-backed dynamic content and no automatic lead capture yet — those are Phase 2 and Phase 3 of the spec.

**Architecture:** New stateless `POST /api/chat` endpoint (`ChatController` → `ChatService`) calls the Gemini `generateContent` REST API over HTTPS via `java.net.http.HttpClient` — the same pattern `EmailService` already uses for Resend. The frontend keeps the full conversation in React state and resends it each turn; no chat session storage on the backend. A new `ChatWidget.jsx` component renders next to the existing `RailButtons.jsx` floating rail.

**Tech Stack:** Spring Boot 3.3.5 (Java 17) backend, `java.net.http.HttpClient` + Jackson (already a transitive dependency via `spring-boot-starter-web`, no new Maven dependency needed), React 19 + Vite frontend, Vitest + React Testing Library, JUnit 5 + Mockito + AssertJ.

**Spec:** [chatbotAI.md](../../../chatbotAI.md) — read this first for the full rationale (why Gemini, why stateless, why static prompt for Phase 1, DB choice, deferred scope).

## Global Constraints

- No new Maven or npm dependencies — reuse `HttpClient`/Jackson (backend) and native `fetch` (frontend), exactly as `EmailService.java` and `ContactForm.jsx` already do.
- The system prompt must never invent prices, discounts, or capacity numbers not already published on the site — match the existing policy documented in `frontend/src/components/event/BiddingProcess.jsx:1-3` ("công ty chưa xác nhận số liệu thật, đưa số bịa lên trang là quảng cáo sai sự thật"). When asked about price, the prompt must redirect to Zalo/phone contact.
- `ChatService` must never throw out of `getReply(...)` — on any HTTP error, non-2xx response, or malformed response body, return the fixed fallback string. This matches `EmailService.send(...)`'s fail-soft contract.
- `/api/chat` is public (no auth) — do not add it under `/api/admin/**`.
- All new UI text is Vietnamese, matching the rest of the site.
- New CSS must reuse the existing theme tokens (`--accent`, `--accent-deep`, `--panel`, `--ink`, `--muted`, `--line`, `--gold-soft` — defined in `frontend/src/styles/global.css:7-42`) so the widget matches both event/wedding themes and dark mode automatically. Do not introduce new hardcoded colors.
- Backend tests run with `"C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test` from `backend/` (H2 in-memory DB, no Postgres needed). Frontend tests run with `npx vitest run <path>` from `frontend/`.

---

### Task 1: `ChatService` — Gemini HTTP client

**Files:**
- Create: `backend/src/main/java/com/mmt/eventwedding/dto/ChatTurn.java`
- Create: `backend/src/main/java/com/mmt/eventwedding/service/ChatService.java`
- Test: `backend/src/test/java/com/mmt/eventwedding/service/ChatServiceTest.java`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/main/resources/application-test.yml`

**Interfaces:**
- Produces: `record ChatTurn(String role, String text)` — `role` is `"user"` or `"model"` (Gemini's own vocabulary, no translation layer needed).
- Produces: `ChatService.getReply(String pageContext, List<ChatTurn> history)` → `String` — `pageContext` is `"EVENT"` or `"WEDDING"` (anything else falls back to the EVENT prompt). Never throws.
- Produces (package-private, for tests and for `getReply` itself): `ChatService.buildPayload(String pageContext, List<ChatTurn> history)` → `Map<String, Object>` — pure function, no I/O, builds the exact JSON-serializable Gemini request body.
- Produces: `ChatService.FALLBACK_REPLY` (package-private `static final String`) — the fixed Vietnamese fallback message.

- [ ] **Step 1: Write the failing tests for `buildPayload` (pure, no HTTP)**

Create `backend/src/test/java/com/mmt/eventwedding/service/ChatServiceTest.java`:

```java
package com.mmt.eventwedding.service;

import com.mmt.eventwedding.dto.ChatTurn;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ChatServiceTest {

    @SuppressWarnings("unchecked")
    private static HttpResponse<String> mockResponse(int status, String body) {
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(status);
        when(response.body()).thenReturn(body);
        return response;
    }

    private static ChatService newService(HttpClient httpClient) {
        ChatService service = new ChatService();
        ReflectionTestUtils.setField(service, "httpClient", httpClient);
        ReflectionTestUtils.setField(service, "apiKey", "test-gemini-key");
        ReflectionTestUtils.setField(service, "model", "gemini-2.0-flash");
        return service;
    }

    @SuppressWarnings("unchecked")
    private static String extractSystemText(Map<String, Object> payload) {
        Map<String, Object> systemInstruction = (Map<String, Object>) payload.get("system_instruction");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) systemInstruction.get("parts");
        return (String) parts.get(0).get("text");
    }

    @Test
    void buildsEventSystemPromptForEventPageContext() {
        ChatService service = new ChatService();
        Map<String, Object> payload = service.buildPayload("EVENT", List.of());
        assertThat(extractSystemText(payload)).contains("MMT Event");
    }

    @Test
    void buildsWeddingSystemPromptForWeddingPageContext() {
        ChatService service = new ChatService();
        Map<String, Object> payload = service.buildPayload("WEDDING", List.of());
        assertThat(extractSystemText(payload)).contains("Minh Minh Thúy");
    }

    @Test
    void fallsBackToEventPromptForUnknownPageContext() {
        ChatService service = new ChatService();
        Map<String, Object> payload = service.buildPayload("BOGUS", List.of());
        assertThat(extractSystemText(payload)).contains("MMT Event");
    }

    @Test
    @SuppressWarnings("unchecked")
    void mapsHistoryTurnsToGeminiContentsPreservingOrderAndRoles() {
        ChatService service = new ChatService();
        List<ChatTurn> history = List.of(
                new ChatTurn("user", "Cau hoi 1"),
                new ChatTurn("model", "Tra loi 1"),
                new ChatTurn("user", "Cau hoi 2")
        );

        Map<String, Object> payload = service.buildPayload("EVENT", history);
        List<Map<String, Object>> contents = (List<Map<String, Object>>) payload.get("contents");

        assertThat(contents).hasSize(3);
        assertThat(contents.get(0).get("role")).isEqualTo("user");
        assertThat(contents.get(1).get("role")).isEqualTo("model");
        assertThat(contents.get(2).get("role")).isEqualTo("user");
    }

    @Test
    void sendsRequestToGeminiWithApiKeyHeaderAndParsesReply() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        String geminiBody = """
                {"candidates":[{"content":{"parts":[{"text":"Chao ban, MMT co the ho tro gi?"}]}}]}
                """;
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(mockResponse(200, geminiBody));
        ChatService service = newService(httpClient);

        String reply = service.getReply("EVENT", List.of(new ChatTurn("user", "Cho hoi gia thue nha bat")));

        assertThat(reply).isEqualTo("Chao ban, MMT co the ho tro gi?");

        ArgumentCaptor<HttpRequest> captor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(httpClient).send(captor.capture(), any(HttpResponse.BodyHandler.class));
        HttpRequest sent = captor.getValue();
        assertThat(sent.uri().toString())
                .isEqualTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent");
        assertThat(sent.headers().firstValue("x-goog-api-key")).contains("test-gemini-key");
    }

    @Test
    void returnsFallbackWhenGeminiRejectsWithNon2xx() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(mockResponse(429, "{\"error\":\"quota exceeded\"}"));
        ChatService service = newService(httpClient);

        String reply = service.getReply("EVENT", List.of(new ChatTurn("user", "Xin chao")));

        assertThat(reply).isEqualTo(ChatService.FALLBACK_REPLY);
    }

    @Test
    void returnsFallbackWhenHttpClientThrows() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenThrow(new java.io.IOException("timeout"));
        ChatService service = newService(httpClient);

        String reply = service.getReply("WEDDING", List.of(new ChatTurn("user", "Xin chao")));

        assertThat(reply).isEqualTo(ChatService.FALLBACK_REPLY);
    }

    @Test
    void returnsFallbackWhenGeminiResponseHasNoCandidates() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(mockResponse(200, "{\"candidates\":[]}"));
        ChatService service = newService(httpClient);

        String reply = service.getReply("EVENT", List.of(new ChatTurn("user", "Xin chao")));

        assertThat(reply).isEqualTo(ChatService.FALLBACK_REPLY);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=ChatServiceTest`
Expected: FAIL to compile — `ChatService` and `ChatTurn` do not exist yet.

- [ ] **Step 3: Create `ChatTurn.java`**

```java
package com.mmt.eventwedding.dto;

public record ChatTurn(String role, String text) {
}
```

- [ ] **Step 4: Add Gemini config to `application.yml` and `application-test.yml`**

In `backend/src/main/resources/application.yml`, add after the existing `app.resend` block:

```yaml
  gemini:
    api-key: ${GEMINI_API_KEY:}
    model: ${GEMINI_MODEL:gemini-2.0-flash}
```

(Full `app:` block becomes: `images`, `notify`, `cors`, `resend`, `gemini` — indentation matches the existing siblings.)

In `backend/src/main/resources/application-test.yml`, add after the existing `app.resend` block:

```yaml
  gemini:
    api-key: test-key
    model: gemini-2.0-flash
```

- [ ] **Step 5: Implement `ChatService.java`**

```java
package com.mmt.eventwedding.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mmt.eventwedding.dto.ChatTurn;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// Chatbot tu van qua Gemini (HTTP API) — cung mot kieu ket noi HTTPS nhu
// Resend dang dung trong EmailService, khong bi Render chan nhu SMTP.
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final String GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";

    static final String FALLBACK_REPLY =
            "Xin lỗi, hệ thống tư vấn tự động đang bận. Bạn nhắn Zalo hoặc gọi trực tiếp giúp mình để được hỗ trợ ngay nhé!";

    // Khong tu bia gia/so lieu — dung chinh sach da ap dung cho trang dau
    // thau (xem BiddingProcess.jsx), luon dan khach ve Zalo/dien thoai khi
    // hoi gia cu the.
    private static final String EVENT_PROMPT = """
            Bạn là trợ lý tư vấn ảo của MMT Event — công ty tổ chức sự kiện tại Cần Thơ, miền Tây. \
            Thế mạnh: nhà bạt không gian & sự kiện ngoài trời quy mô lớn, lễ khai trương/động thổ/ra quân, \
            hội nghị/hội thảo, cho thuê thiết bị lẻ (âm thanh, màn hình LED, bàn ghế). MMT cũng nhận hồ sơ \
            mời thầu/đấu thầu từ doanh nghiệp và cơ quan, báo giá minh bạch từng hạng mục.

            Trả lời ngắn gọn, thân thiện, đúng trọng tâm câu hỏi của khách bằng tiếng Việt. TUYỆT ĐỐI KHÔNG \
            được tự bịa số liệu, phần trăm chiết khấu, hay báo giá cụ thể — MMT chỉ báo giá chính xác sau khi \
            trao đổi trực tiếp qua Zalo/điện thoại. Khi khách hỏi giá, giải thích ngắn gọn các yếu tố ảnh \
            hưởng giá (quy mô, hạng mục, thời gian thi công) rồi mời khách để lại số điện thoại hoặc nhắn \
            Zalo Anh Hiếu (0939 050 550) để được báo giá chính xác.

            Nếu khách hỏi ngoài phạm vi tổ chức sự kiện, trả lời ngắn gọn là bạn chỉ hỗ trợ tư vấn dịch vụ \
            của MMT Event và mời khách liên hệ trực tiếp cho các vấn đề khác.""";

    private static final String WEDDING_PROMPT = """
            Bạn là trợ lý tư vấn ảo của Minh Minh Thúy — dịch vụ cưới hỏi trọn gói tại Cần Thơ (162/24 Trần \
            Ngọc Quế, Phường Ninh Kiều). Các loại lễ phục vụ: Lễ Vu Quy (nhà gái), Lễ Tân Hôn (nhà trai), \
            Đám hỏi, Tiệc báo hỷ tại nhà. Giờ làm việc: 7:30 - 20:30 tất cả các ngày.

            Trả lời ngắn gọn, ấm áp, đúng trọng tâm câu hỏi của khách bằng tiếng Việt, giọng văn trang trọng \
            nhẹ nhàng phù hợp dịch vụ cưới hỏi. TUYỆT ĐỐI KHÔNG được tự bịa số liệu hay báo giá cụ thể — \
            Minh Minh Thúy chỉ báo giá chính xác sau khi trao đổi trực tiếp qua Zalo/điện thoại. Khi khách \
            hỏi giá hoặc muốn giữ lịch, mời khách để lại số điện thoại hoặc nhắn Zalo Chị Thúy (0907 623 450) \
            để được tư vấn và giữ lịch chính xác.

            Nếu khách hỏi ngoài phạm vi dịch vụ cưới hỏi, trả lời ngắn gọn là bạn chỉ hỗ trợ tư vấn dịch vụ \
            của Minh Minh Thúy và mời khách liên hệ trực tiếp cho các vấn đề khác.""";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    Map<String, Object> buildPayload(String pageContext, List<ChatTurn> history) {
        String systemPrompt = "WEDDING".equals(pageContext) ? WEDDING_PROMPT : EVENT_PROMPT;

        List<Map<String, Object>> contents = new ArrayList<>();
        for (ChatTurn turn : history) {
            String role = "model".equals(turn.role()) ? "model" : "user";
            contents.add(Map.of("role", role, "parts", List.of(Map.of("text", turn.text()))));
        }

        return Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", contents
        );
    }

    public String getReply(String pageContext, List<ChatTurn> history) {
        try {
            Map<String, Object> payload = buildPayload(pageContext, history);
            URI uri = URI.create(GEMINI_API_BASE + model + ":generateContent");
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                log.error("Gemini tu choi request (HTTP {}): {}", response.statusCode(), response.body());
                return FALLBACK_REPLY;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                log.error("Gemini tra ve response khong co text: {}", response.body());
                return FALLBACK_REPLY;
            }
            return textNode.asText();
        } catch (Exception e) {
            log.error("Loi khi goi Gemini API", e);
            return FALLBACK_REPLY;
        }
    }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd backend && "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=ChatServiceTest`
Expected: PASS — 8 tests green.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/mmt/eventwedding/dto/ChatTurn.java backend/src/main/java/com/mmt/eventwedding/service/ChatService.java backend/src/test/java/com/mmt/eventwedding/service/ChatServiceTest.java backend/src/main/resources/application.yml backend/src/main/resources/application-test.yml
git commit --author="YaoMing-dev <YaoMing-dev@users.noreply.github.com>" -m "feat: add ChatService (Gemini client) for chatbot Phase 1"
```

---

### Task 2: `ChatController` — public `/api/chat` endpoint

**Files:**
- Create: `backend/src/main/java/com/mmt/eventwedding/dto/ChatRequest.java`
- Create: `backend/src/main/java/com/mmt/eventwedding/dto/ChatResponse.java`
- Create: `backend/src/main/java/com/mmt/eventwedding/controller/ChatController.java`
- Test: `backend/src/test/java/com/mmt/eventwedding/controller/ChatControllerTest.java`

**Interfaces:**
- Consumes: `ChatService.getReply(String pageContext, List<ChatTurn> history)` from Task 1 — exact signature, do not rename.
- Consumes: `ChatTurn(String role, String text)` from Task 1.
- Produces: `POST /api/chat` — request body `{"pageContext": "EVENT"|"WEDDING", "history": [{"role": "...", "text": "..."}]}`, response `{"reply": "..."}`, `200 OK` on success, `400` with field errors on missing `pageContext`/`history` (via existing `GlobalExceptionHandler`).

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/java/com/mmt/eventwedding/controller/ChatControllerTest.java`:

```java
package com.mmt.eventwedding.controller;

import com.mmt.eventwedding.service.ChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
@AutoConfigureMockMvc(addFilters = false)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChatService chatService;

    @Test
    void chatReturnsReplyFromService() throws Exception {
        when(chatService.getReply(eq("EVENT"), any())).thenReturn("Chao ban, MMT co the ho tro gi?");

        String body = """
                {"pageContext":"EVENT","history":[{"role":"user","text":"Xin chao"}]}
                """;

        mockMvc.perform(post("/api/chat").contentType("application/json").content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value("Chao ban, MMT co the ho tro gi?"));
    }

    @Test
    void chatWithBlankPageContextReturns400() throws Exception {
        String body = """
                {"pageContext":"","history":[]}
                """;

        mockMvc.perform(post("/api/chat").contentType("application/json").content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.pageContext").exists());
    }

    @Test
    void chatWithMissingHistoryReturns400() throws Exception {
        String body = """
                {"pageContext":"EVENT"}
                """;

        mockMvc.perform(post("/api/chat").contentType("application/json").content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.history").exists());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=ChatControllerTest`
Expected: FAIL to compile — `ChatController`, `ChatRequest`, `ChatResponse` do not exist yet.

- [ ] **Step 3: Create `ChatRequest.java`**

```java
package com.mmt.eventwedding.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ChatRequest(
        @NotBlank(message = "Thieu pageContext") String pageContext,
        @NotNull(message = "Thieu history") List<ChatTurn> history
) {
}
```

- [ ] **Step 4: Create `ChatResponse.java`**

```java
package com.mmt.eventwedding.dto;

public record ChatResponse(String reply) {
}
```

- [ ] **Step 5: Create `ChatController.java`**

```java
package com.mmt.eventwedding.controller;

import com.mmt.eventwedding.dto.ChatRequest;
import com.mmt.eventwedding.dto.ChatResponse;
import com.mmt.eventwedding.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        String reply = chatService.getReply(request.pageContext(), request.history());
        return new ChatResponse(reply);
    }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backend && "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=ChatControllerTest`
Expected: PASS — 3 tests green.

- [ ] **Step 7: Run the full backend suite to confirm no regressions**

Run: `cd backend && "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test`
Expected: PASS — all tests green (previous count + 11 new: 8 from `ChatServiceTest`, 3 from `ChatControllerTest`).

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/com/mmt/eventwedding/dto/ChatRequest.java backend/src/main/java/com/mmt/eventwedding/dto/ChatResponse.java backend/src/main/java/com/mmt/eventwedding/controller/ChatController.java backend/src/test/java/com/mmt/eventwedding/controller/ChatControllerTest.java
git commit --author="YaoMing-dev <YaoMing-dev@users.noreply.github.com>" -m "feat: add public POST /api/chat endpoint"
```

---

### Task 3: `ChatWidget.jsx` — floating chat UI

**Files:**
- Create: `frontend/src/components/layout/ChatWidget.jsx`
- Test: `frontend/src/components/layout/ChatWidget.test.jsx`
- Modify: `frontend/src/styles/global.css`

**Interfaces:**
- Produces: `export default function ChatWidget({ view })` — `view` is `"event"` or `"wedding"` (same prop shape `RailButtons` already receives from `App.jsx`).
- Consumes: `contactInfo` from `frontend/src/data/contactInfo.js` (existing) — used only to read `info.brand` for the panel header, no new fields needed.
- Produces (network contract consumed by the backend from Task 2): `POST /api/chat` with body `{ pageContext: "EVENT"|"WEDDING", history: [{ role: "user"|"model", text }] }`.

- [ ] **Step 1: Write the failing tests**

Create `frontend/src/components/layout/ChatWidget.test.jsx`:

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ChatWidget from './ChatWidget.jsx'

describe('ChatWidget', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is closed by default and shows the greeting once opened, without calling fetch', () => {
    render(<ChatWidget view="event" />)
    expect(screen.queryByText(/tổ chức sự kiện, khai trương, hội nghị/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    expect(screen.getByText(/tổ chức sự kiện, khai trương, hội nghị/i)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('sends only the real conversation (not the local greeting) and renders the reply', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ reply: 'MMT co the ho tro ban.' }) })
    render(<ChatWidget view="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Gia thue nha bat bao nhieu?' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    const [url, options] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/chat')
    const body = JSON.parse(options.body)
    expect(body.pageContext).toBe('EVENT')
    expect(body.history).toEqual([{ role: 'user', text: 'Gia thue nha bat bao nhieu?' }])

    expect(await screen.findByText('MMT co the ho tro ban.')).toBeInTheDocument()
  })

  it('maps view="wedding" to pageContext WEDDING', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ reply: 'Da ghi nhan.' }) })
    render(<ChatWidget view="wedding" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Con lich thang 12 khong?' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.pageContext).toBe('WEDDING')
  })

  it('shows the fallback message when both fetch attempts fail', async () => {
    global.fetch.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<ChatWidget view="wedding" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Con lich khong?' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    expect(await screen.findByText(/hệ thống tư vấn đang bận/i)).toBeInTheDocument()
  })

  it('shows the fallback message when the server responds with a non-ok status', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })
    render(<ChatWidget view="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Xin chao' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    expect(await screen.findByText(/hệ thống tư vấn đang bận/i)).toBeInTheDocument()
  })

  it('retries once automatically if the first attempt fails to connect (backend waking up)', async () => {
    global.fetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reply: 'Da ket noi lai duoc.' }) })
    render(<ChatWidget view="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Xin chao' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Da ket noi lai duoc.')).toBeInTheDocument()
  })

  it('does not send a blank message', () => {
    render(<ChatWidget view="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    expect(global.fetch).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend && npx vitest run src/components/layout/ChatWidget.test.jsx`
Expected: FAIL — `ChatWidget.jsx` does not exist yet.

- [ ] **Step 3: Implement `ChatWidget.jsx`**

```jsx
import { useState, useRef, useEffect } from 'react'
import { contactInfo } from '../../data/contactInfo.js'

const GREETING = {
  event: 'Chào bạn! Mình là trợ lý tư vấn của MMT Event. Bạn cần hỗ trợ về tổ chức sự kiện, khai trương, hội nghị hay thuê thiết bị?',
  wedding: 'Chào bạn! Mình là trợ lý tư vấn của Minh Minh Thúy. Bạn cần hỗ trợ về lễ cưới hỏi nào ạ?',
}

const FALLBACK_REPLY = 'Xin lỗi, hệ thống tư vấn đang bận. Bạn nhắn Zalo giúp mình để được hỗ trợ ngay nhé!'

// Cung mot kieu retry-1-lan nhu postLead trong ContactForm — Render free co
// the vua thuc day tu ngu, lan goi dau doi khi rot mang.
async function postChat(payload) {
  try {
    return await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    return fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }
}

export default function ChatWidget({ view }) {
  const info = contactInfo[view] ?? contactInfo.event
  const pageContext = view === 'wedding' ? 'WEDDING' : 'EVENT'
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'model', text: GREETING[view] ?? GREETING.event }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userTurn = { role: 'user', text }
    // messages[0] la loi chao sinh cuc bo, khong gui len Gemini lam ngu canh.
    const apiHistory = [...messages.slice(1), userTurn]
    setMessages((current) => [...current, userTurn])
    setInput('')
    setLoading(true)

    try {
      const response = await postChat({ pageContext, history: apiHistory })
      if (response.ok) {
        const data = await response.json()
        setMessages((current) => [...current, { role: 'model', text: data.reply }])
      } else {
        setMessages((current) => [...current, { role: 'model', text: FALLBACK_REPLY }])
      }
    } catch {
      setMessages((current) => [...current, { role: 'model', text: FALLBACK_REPLY }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chatw">
      <button
        type="button"
        className="chatw-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng chat tư vấn' : 'Mở chat tư vấn'}
      >
        {open ? '✕' : 'Chat'}
      </button>

      {open && (
        <div className="chatw-panel">
          <div className="chatw-head">Tư vấn {info.brand}</div>
          <div className="chatw-list" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatw-msg ${m.role}`}>{m.text}</div>
            ))}
            {loading && <div className="chatw-msg model chatw-typing">Đang nhập...</div>}
          </div>
          <form className="chatw-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              aria-label="Nhập câu hỏi cho chatbot"
            />
            <button type="submit" disabled={loading || !input.trim()}>Gửi</button>
          </form>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Add CSS to `global.css`**

Append after the `.rail` block (`frontend/src/styles/global.css`, right after line 405 / the `.rail .fb{...}` rule, before the `/* menu di động */` comment):

```css
.chatw{position:fixed;right:20px;bottom:20px;z-index:80}
.chatw-toggle{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:var(--accent-deep);color:#fff;font-weight:700;font-size:13px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.chatw-panel{position:absolute;right:0;bottom:68px;width:320px;max-height:440px;display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25);overflow:hidden}
.chatw-head{padding:14px 16px;background:var(--accent-deep);color:#fff;font-weight:700;font-size:14px}
.chatw-list{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.chatw-msg{max-width:85%;padding:8px 12px;border-radius:10px;font-size:13.5px;line-height:1.5}
.chatw-msg.model{align-self:flex-start;background:var(--gold-soft);color:var(--ink)}
.chatw-msg.user{align-self:flex-end;background:var(--accent-deep);color:#fff}
.chatw-typing{opacity:.6;font-style:italic}
.chatw-form{display:flex;gap:8px;padding:10px;border-top:1px solid var(--line)}
.chatw-form input{flex:1;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:13.5px;background:var(--panel);color:var(--ink)}
.chatw-form button{padding:8px 14px;border:none;border-radius:8px;background:var(--accent-deep);color:#fff;font-weight:700;cursor:pointer}
.chatw-form button:disabled{opacity:.5;cursor:not-allowed}

@media (max-width:760px){
  .chatw{right:14px;bottom:66px}
  .chatw-panel{width:calc(100vw - 28px);right:-6px}
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd frontend && npx vitest run src/components/layout/ChatWidget.test.jsx`
Expected: PASS — 7 tests green.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/layout/ChatWidget.jsx frontend/src/components/layout/ChatWidget.test.jsx frontend/src/styles/global.css
git commit --author="YaoMing-dev <YaoMing-dev@users.noreply.github.com>" -m "feat: add ChatWidget floating chat UI"
```

---

### Task 4: Wire into the app + deploy config

**Files:**
- Modify: `frontend/src/App.jsx:6,37`
- Modify: `render.yaml`
- Test: existing `frontend/src/App.test.jsx` (no new test file — this task is verified by the existing suite staying green plus a manual deploy check)

**Interfaces:**
- Consumes: `ChatWidget` default export from Task 3, `RailButtons` (existing, unchanged).

- [ ] **Step 1: Wire `ChatWidget` into `App.jsx`**

In `frontend/src/App.jsx`, add the import next to the existing `RailButtons` import:

```jsx
import RailButtons from './components/layout/RailButtons.jsx'
import ChatWidget from './components/layout/ChatWidget.jsx'
```

And render it next to `RailButtons` inside `Shell()`:

```jsx
      {isSub && <Footer view={view} />}
      {isSub && <RailButtons view={view} />}
      {isSub && <ChatWidget view={view} />}
```

- [ ] **Step 2: Run the existing frontend suite to confirm no regressions**

Run: `cd frontend && npx vitest run`
Expected: PASS — all existing tests green, including `App.test.jsx` (the chatbot greeting is inert until the toggle button is clicked, so it doesn't affect any existing assertions).

- [ ] **Step 3: Add `GEMINI_API_KEY` / `GEMINI_MODEL` to `render.yaml`**

In `render.yaml`, add to the `mmt-backend` service's `envVars` list, after the existing `RESEND_API_KEY` entry:

```yaml
      - key: GEMINI_API_KEY
        sync: false
      - key: GEMINI_MODEL
        value: gemini-2.0-flash
```

`GEMINI_API_KEY` uses `sync: false` — same as `RESEND_API_KEY` and `ADMIN_PASSWORD` — meaning the real value is set directly in the Render dashboard, never committed. `GEMINI_MODEL` is a plain `value:` since it's not a secret and gives an easy override point if Google deprecates `gemini-2.0-flash` later without needing a code change.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.jsx render.yaml
git commit --author="YaoMing-dev <YaoMing-dev@users.noreply.github.com>" -m "feat: mount ChatWidget on event/wedding pages, add GEMINI_API_KEY to render.yaml"
```

- [ ] **Step 5: Manual deploy verification (after pushing and setting `GEMINI_API_KEY` in the Render dashboard)**

```bash
# 1. Confirm the chat endpoint responds on production (may take 20-90s on first call — cold start)
curl -s -w "\nHTTP: %{http_code}\n" -X POST https://minhminhthuy.io.vn/api/chat \
  -H "Content-Type: application/json" \
  -d '{"pageContext":"EVENT","history":[{"role":"user","text":"Cho hoi MMT co lam le khai truong khong?"}]}' \
  --max-time 90

# Expect: HTTP 200 and {"reply": "..."} with a real Vietnamese answer about MMT Event's services.

# 2. Confirm the wedding prompt is distinct
curl -s -w "\nHTTP: %{http_code}\n" -X POST https://minhminhthuy.io.vn/api/chat \
  -H "Content-Type: application/json" \
  -d '{"pageContext":"WEDDING","history":[{"role":"user","text":"Ben minh co to chuc Le Vu Quy khong?"}]}' \
  --max-time 40

# Expect: HTTP 200 and a reply referencing Minh Minh Thúy / Lễ Vu Quy, not MMT Event.

# 3. Confirm validation still rejects a malformed request
curl -s -w "\nHTTP: %{http_code}\n" -X POST https://minhminhthuy.io.vn/api/chat \
  -H "Content-Type: application/json" -d '{}' --max-time 20

# Expect: HTTP 400 with {"pageContext": "...", "history": "..."}
```

Then open `https://minhminhthuy.io.vn/su-kien` and `https://minhminhthuy.io.vn/tiec-cuoi` in a browser, click the new "Chat" button, and send a real question on each page to confirm the widget renders correctly (theme colors match the page, panel doesn't overlap the mobile rail bar) and a real reply comes back.

---

## Self-Review Notes

- **Spec coverage:** Task 1–2 implement `chatbotAI.md` §4.1's "Phase 1" scope (static prompt, Gemini call, stateless endpoint, fail-soft fallback). Task 3 implements §4.2 (widget, theming, loading state, fallback UX). Task 4 implements the "mount next to RailButtons" placement and the `GEMINI_API_KEY` env var convention from §4.1. `ChatbotContext` (DB), the admin textarea, and auto lead-capture are explicitly out of scope for this plan — they're Phase 2 and Phase 3 in the spec's own rollout section, to be written as separate plans once Phase 1 is verified live.
- **Type consistency:** `ChatTurn(String role, String text)` (Task 1) is used identically in `ChatRequest.history()` (Task 2) and in the JSON shape the frontend sends (Task 3) — checked field-by-field against the Gemini `contents[].role`/`parts[].text` shape.
- **No placeholders:** every step has full code, no "add validation" or "similar to Task N" shortcuts.
