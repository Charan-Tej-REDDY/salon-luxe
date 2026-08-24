package com.salon.booking.dto;

import java.math.BigDecimal;

public class PaymentOrderResponse {

    private Long bookingId;
    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String razorpayKeyId;

    public PaymentOrderResponse() {
    }

    public PaymentOrderResponse(Long bookingId, String orderId, BigDecimal amount, String currency, String razorpayKeyId) {
        this.bookingId = bookingId;
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.razorpayKeyId = razorpayKeyId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getRazorpayKeyId() {
        return razorpayKeyId;
    }

    public void setRazorpayKeyId(String razorpayKeyId) {
        this.razorpayKeyId = razorpayKeyId;
    }
}
