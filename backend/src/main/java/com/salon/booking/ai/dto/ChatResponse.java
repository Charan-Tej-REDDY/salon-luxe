package com.salon.booking.ai.dto;

import java.util.List;

public class ChatResponse {

    public enum ResponseType {
        TEXT,
        APPOINTMENT_OPTIONS,
        BOOKING_CONFIRMED,
        ERROR
    }

    private Long conversationId;
    private String message;
    private ResponseType type;
    private List<AppointmentOption> options;
    private Long bookingId;

    public ChatResponse() {
    }

    public ChatResponse(Long conversationId, String message, ResponseType type) {
        this.conversationId = conversationId;
        this.message = message;
        this.type = type;
    }

    public static ChatResponse text(Long conversationId, String message) {
        return new ChatResponse(conversationId, message, ResponseType.TEXT);
    }

    public static ChatResponse options(Long conversationId, String message, List<AppointmentOption> options) {
        ChatResponse response = new ChatResponse(conversationId, message, ResponseType.APPOINTMENT_OPTIONS);
        response.setOptions(options);
        return response;
    }

    public static ChatResponse bookingConfirmed(Long conversationId, String message, Long bookingId) {
        ChatResponse response = new ChatResponse(conversationId, message, ResponseType.BOOKING_CONFIRMED);
        response.setBookingId(bookingId);
        return response;
    }

    public static ChatResponse error(Long conversationId, String message) {
        return new ChatResponse(conversationId, message, ResponseType.ERROR);
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public ResponseType getType() {
        return type;
    }

    public void setType(ResponseType type) {
        this.type = type;
    }

    public List<AppointmentOption> getOptions() {
        return options;
    }

    public void setOptions(List<AppointmentOption> options) {
        this.options = options;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }
}
