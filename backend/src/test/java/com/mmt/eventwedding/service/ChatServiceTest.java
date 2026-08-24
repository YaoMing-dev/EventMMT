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
import static org.assertj.core.api.Assertions.assertThatCode;
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
        HttpResponse<String> response = mockResponse(200, geminiBody);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(response);
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
        HttpResponse<String> response = mockResponse(429, "{\"error\":\"quota exceeded\"}");
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(response);
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
        HttpResponse<String> response = mockResponse(200, "{\"candidates\":[]}");
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(response);
        ChatService service = newService(httpClient);

        String reply = service.getReply("EVENT", List.of(new ChatTurn("user", "Xin chao")));

        assertThat(reply).isEqualTo(ChatService.FALLBACK_REPLY);
    }

    @Test
    void warnIfApiKeyMissingDoesNotThrowForBlankOrPresentKey() {
        ChatService blankKeyService = new ChatService();
        ReflectionTestUtils.setField(blankKeyService, "apiKey", "");
        assertThatCode(blankKeyService::warnIfApiKeyMissing).doesNotThrowAnyException();

        ChatService presentKeyService = new ChatService();
        ReflectionTestUtils.setField(presentKeyService, "apiKey", "real-key");
        assertThatCode(presentKeyService::warnIfApiKeyMissing).doesNotThrowAnyException();
    }
}
