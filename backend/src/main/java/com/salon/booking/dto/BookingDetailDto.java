package com.salon.booking.dto;

import com.salon.booking.model.Booking;
import com.salon.booking.model.Transaction;

public class BookingDetailDto {

    private Booking booking;
    private Transaction transaction;

    public BookingDetailDto() {
    }

    public BookingDetailDto(Booking booking, Transaction transaction) {
        this.booking = booking;
        this.transaction = transaction;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Transaction getTransaction() {
        return transaction;
    }

    public void setTransaction(Transaction transaction) {
        this.transaction = transaction;
    }
}
