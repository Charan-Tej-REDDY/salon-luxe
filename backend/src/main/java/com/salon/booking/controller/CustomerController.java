package com.salon.booking.controller;

import com.salon.booking.dto.*;
import com.salon.booking.model.Service;
import com.salon.booking.model.Shop;
import com.salon.booking.model.Slot;
import com.salon.booking.model.Transaction;
import com.salon.booking.service.CustomerService;
import com.salon.booking.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private PaymentService paymentService;

    // --- Public Discovery Endpoints ---

    @GetMapping("/shops")
    public ResponseEntity<List<Shop>> getAllShops(@RequestParam(required = false) String search) {
        List<Shop> shops = customerService.getAllShops(search);
        return ResponseEntity.ok(shops);
    }

    @GetMapping("/shops/{shopId}")
    public ResponseEntity<Shop> getShopDetails(@PathVariable Long shopId) {
        Shop shop = customerService.getShopDetails(shopId);
        return ResponseEntity.ok(shop);
    }

    @GetMapping("/shops/{shopId}/services")
    public ResponseEntity<List<Service>> getServicesForShop(@PathVariable Long shopId) {
        List<Service> services = customerService.getServicesForShop(shopId);
        return ResponseEntity.ok(services);
    }

    @GetMapping("/shops/{shopId}/slots")
    public ResponseEntity<List<Slot>> getAvailableSlots(
            @PathVariable Long shopId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Slot> slots = customerService.getAvailableSlots(shopId, date);
        return ResponseEntity.ok(slots);
    }

    // --- Authenticated Customer Booking & Payment Endpoints ---

    @PostMapping("/bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingDetailDto> bookSlot(@Valid @RequestBody BookingRequest request) {
        BookingDetailDto result = customerService.bookSlot(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingDetailDto>> getMyBookings() {
        List<BookingDetailDto> bookings = customerService.getMyBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/bookings/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingDetailDto> getMyBookingDetails(@PathVariable Long bookingId) {
        BookingDetailDto booking = customerService.getMyBookingDetails(bookingId);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/bookings/{bookingId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingDetailDto> cancelBooking(@PathVariable Long bookingId) {
        BookingDetailDto result = customerService.cancelBooking(bookingId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/payments/order")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(@RequestParam Long bookingId) {
        PaymentOrderResponse response = paymentService.createPaymentOrder(bookingId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/payments/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Transaction> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        Transaction transaction = paymentService.verifyAndCompletePayment(request);
        return ResponseEntity.ok(transaction);
    }
}
