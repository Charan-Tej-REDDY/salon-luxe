package com.salon.booking.ai.controller;

import com.salon.booking.ai.dto.ChatRequest;
import com.salon.booking.ai.dto.ChatResponse;
import com.salon.booking.ai.service.AiAssistantService;
import com.salon.booking.model.User;
import com.salon.booking.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for the AI Appointment Assistant.
 * 
 * Requires authentication — customer identity is derived from the JWT SecurityContext,
 * NOT from the request body. This prevents any customer impersonation.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private static final Logger logger = LoggerFactory.getLogger(AiAssistantController.class);

    @Autowired
    private AiAssistantService aiAssistantService;

    @Autowired
    private AuthService authService;

    /**
     * POST /api/ai/chat
     * 
     * Accepts a chat message and optional conversationId.
     * Returns the AI assistant's response with optional structured data.
     * 
     * The customer's identity is extracted from the JWT token in the Authorization header.
     */
    @PostMapping("/chat")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        User currentUser = authService.getCurrentUser();
        logger.info("AI chat request from user: {} (id: {})", currentUser.getEmail(), currentUser.getId());

        ChatResponse response = aiAssistantService.chat(
                request.getMessage(),
                request.getConversationId(),
                currentUser
        );

        return ResponseEntity.ok(response);
    }
}
