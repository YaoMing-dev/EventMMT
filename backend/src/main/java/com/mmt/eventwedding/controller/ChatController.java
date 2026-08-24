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
