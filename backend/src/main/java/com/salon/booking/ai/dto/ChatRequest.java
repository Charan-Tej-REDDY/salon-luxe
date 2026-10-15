package com.salon.booking.ai.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatRequest {

    @NotBlank(message = "Message is required")
    private String message;

    private Long conversationId;

    public ChatRequest() {
    }

    public ChatRequest(String message, Long conversationId) {
        this.message = message;
        this.conversationId = conversationId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }
}
