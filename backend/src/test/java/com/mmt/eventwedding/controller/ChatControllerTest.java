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
