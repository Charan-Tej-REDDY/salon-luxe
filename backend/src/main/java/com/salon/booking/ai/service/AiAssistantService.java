package com.salon.booking.ai.service;

import com.salon.booking.ai.config.AiConfig;
import com.salon.booking.ai.dto.ChatResponse;
import com.salon.booking.ai.model.AiConversation;
import com.salon.booking.ai.model.AiMessage;
import com.salon.booking.ai.model.MessageRole;
import com.salon.booking.ai.repository.AiConversationRepository;
import com.salon.booking.ai.repository.AiMessageRepository;
import com.salon.booking.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Spring AI orchestrator for the Salon Luxe AI Appointment Assistant.
 * 
 * Uses Spring AI's ChatClient to manage prompts, history, and function calling.
 * All tool calls are resolved as declarative Spring beans defined in AiToolsConfig.
 */
@Service
public class AiAssistantService {

    private static final Logger logger = LoggerFactory.getLogger(AiAssistantService.class);

    @Autowired
    private AiConfig aiConfig;

    @Autowired
    private ChatClient chatClient;

    @Autowired
    private AiConversationRepository conversationRepository;

    @Autowired
    private AiMessageRepository messageRepository;

    @Transactional
    public ChatResponse chat(String userMessage, Long conversationId, User customer) {
        long startTime = System.currentTimeMillis();
        logger.info("Spring AI chat request from customer {} (conversationId: {})", customer.getId(), conversationId);

        try {
            // 1. Load or create conversation
            AiConversation conversation = getOrCreateConversation(conversationId, customer);

            // 2. Load recent conversation history before adding current message
            List<AiMessage> history = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
            int maxHistory = aiConfig.getMaxHistory();
            if (history.size() > maxHistory) {
                history = history.subList(history.size() - maxHistory, history.size());
            }

            // 3. Persist current user message
            AiMessage userMsg = new AiMessage(conversation, MessageRole.USER, userMessage);
            messageRepository.save(userMsg);

            // 4. Convert history to Spring AI messages
            List<Message> springAiMessages = new ArrayList<>();
            for (AiMessage msg : history) {
                switch (msg.getRole()) {
                    case USER -> springAiMessages.add(new UserMessage(msg.getContent()));
                    case ASSISTANT -> springAiMessages.add(new AssistantMessage(msg.getContent()));
                    default -> {}
                }
            }

            // 5. Call Spring AI ChatClient with registered function callbacks
            logger.info("Calling Spring AI ChatClient with {} history messages", springAiMessages.size());
            String assistantContent = chatClient.prompt()
                    .system(buildSystemPrompt())
                    .messages(springAiMessages)
                    .user(userMessage)
                    .functions("searchServices", "searchSalons", "getSalonDetails", "getAvailableSlots", "createBooking", "getMyBookings")
                    .call()
                    .content();

            if (assistantContent == null || assistantContent.isBlank()) {
                assistantContent = "I'm here to help! How can I assist you with your salon appointment today?";
            }

            // 6. Persist assistant response
            AiMessage assistantMsg = new AiMessage(conversation, MessageRole.ASSISTANT, assistantContent);
            messageRepository.save(assistantMsg);

            // 7. Update conversation timestamp
            conversation.setUpdatedAt(java.time.LocalDateTime.now());
            conversationRepository.save(conversation);

            // 8. Parse response for structured data
            ChatResponse response = parseAssistantResponse(conversation.getId(), assistantContent);

            long elapsed = System.currentTimeMillis() - startTime;
            logger.info("Spring AI chat completed in {}ms for customer {}", elapsed, customer.getId());

            return response;

        } catch (Exception e) {
            logger.error("Spring AI chat failed for customer {}: {}", customer.getId(), e.getMessage(), e);
            Long convId = conversationId != null ? conversationId : 0L;
            return ChatResponse.error(convId,
                    "I'm sorry, I encountered an issue processing your request. Please try again in a moment.");
        }
    }

    private AiConversation getOrCreateConversation(Long conversationId, User customer) {
        if (conversationId != null) {
            return conversationRepository.findByIdAndCustomerId(conversationId, customer.getId())
                    .orElseGet(() -> {
                        logger.info("Conversation {} not found for customer {}, creating new", conversationId, customer.getId());
                        return createNewConversation(customer);
                    });
        }
        return createNewConversation(customer);
    }

    private AiConversation createNewConversation(User customer) {
        AiConversation conversation = new AiConversation(customer);
        return conversationRepository.save(conversation);
    }

    private ChatResponse parseAssistantResponse(Long conversationId, String content) {
        if (content.contains("Booking created successfully") || content.contains("booking has been created") ||
                content.contains("appointment has been booked") || content.contains("successfully booked") ||
                content.contains("Booking #")) {
            Long bookingId = extractBookingId(content);
            if (bookingId != null) {
                return ChatResponse.bookingConfirmed(conversationId, content, bookingId);
            }
        }

        return ChatResponse.text(conversationId, content);
    }

    private Long extractBookingId(String content) {
        try {
            String[] patterns = {"booking ID: ", "booking ID ", "bookingId: ", "Booking #", "booking #"};
            for (String pattern : patterns) {
                int idx = content.toLowerCase().indexOf(pattern.toLowerCase());
                if (idx >= 0) {
                    String afterPattern = content.substring(idx + pattern.length()).trim();
                    StringBuilder numStr = new StringBuilder();
                    for (char c : afterPattern.toCharArray()) {
                        if (Character.isDigit(c)) numStr.append(c);
                        else break;
                    }
                    if (numStr.length() > 0) return Long.parseLong(numStr.toString());
                }
            }
        } catch (Exception e) {
            logger.debug("Could not extract bookingId from content");
        }
        return null;
    }

    private String buildSystemPrompt() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        return """
                You are the Salon Luxe Appointment Assistant.

                You help authenticated customers:
                1. Discover salon services (use searchServices tool)
                2. Find suitable salons (use searchSalons tool)
                3. Get salon details (use getSalonDetails tool)
                4. Check real appointment availability (use getAvailableSlots tool)
                5. Create appointments after explicit confirmation (use createBooking tool)
                6. View their existing bookings (use getMyBookings tool)

                Rules:
                - Never invent salon names, prices, ratings, services, or appointment availability. ALWAYS use tools to get real data.
                - CRITICAL: NEVER output meta-commentary about function calls, tool names, or internal schemas to the customer (e.g. NEVER say "The function call that best answers..."). Always invoke the tool directly when needed. Speak directly and politely to the customer as their luxury salon concierge.
                - Ask for missing information when required (e.g., preferred date, service type, time preference).
                - When the customer asks for a service, first use searchServices to find matching services, then check availability.
                - When showing available slots, present them clearly with salon name, service, date, time, and price.
                - Before creating a booking, ALWAYS clearly summarize: Salon name, Service name, Date, Time slot, Price.
                - ONLY call createBooking after the customer explicitly confirms (e.g., "yes", "confirm", "book it", "go ahead", "sure").
                - If a slot becomes unavailable, explain the conflict and suggest alternatives.
                - Never claim a booking succeeded unless the backend confirms it.
                - If the booking is created with PENDING status, inform the customer they need to complete payment to confirm.
                - Keep responses concise, friendly, and helpful.
                - Format prices in ₹ (Indian Rupees).
                - You CANNOT process payments. After booking is created, direct the customer to the "My Bookings" page to complete payment.

                Important dates:
                - Today's date is: """ + today.toString() + """

                - Tomorrow's date is: """ + tomorrow.toString() + """

                - Interpret relative dates like "tomorrow", "this Saturday", "next week" correctly relative to today.

                When the user mentions "evening", interpret it as roughly 17:00-21:00.
                When the user mentions "morning", interpret it as roughly 08:00-12:00.
                When the user mentions "afternoon", interpret it as roughly 12:00-17:00.
                """;
    }
}
