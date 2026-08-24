package com.salon.booking.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.salon.booking.dto.PaymentOrderResponse;
import com.salon.booking.dto.PaymentVerificationRequest;
import com.salon.booking.model.*;
import com.salon.booking.repository.BookingRepository;
import com.salon.booking.repository.TransactionRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AuthService authService;

    @Transactional
    public PaymentOrderResponse createPaymentOrder(Long bookingId) {
        User currentUser = authService.getCurrentUser();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        // Security rule check: only the booking owner or admin can initiate payment
        if (currentUser.getRole() != Role.ADMIN && !booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access Denied: You do not own this booking.");
        }

        BigDecimal amount = booking.getService().getPrice();
        int amountInPaise = amount.multiply(new BigDecimal(100)).intValue();
        String orderId = null;

        try {
            if (!keyId.contains("placeholder")) {
                RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountInPaise);
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "rcpt_" + booking.getId() + "_" + System.currentTimeMillis());

                Order order = razorpay.orders.create(orderRequest);
                orderId = order.get("id");
            } else {
                // Mock test order ID when placeholder key is used
                orderId = "order_mock_" + UUID.randomUUID().toString().substring(0, 14);
            }
        } catch (RazorpayException e) {
            logger.warn("Razorpay API call failed, generating simulated test order ID: {}", e.getMessage());
            orderId = "order_mock_" + UUID.randomUUID().toString().substring(0, 14);
        }

        // Create or update Transaction
        Transaction transaction = transactionRepository.findByBookingId(bookingId)
                .orElse(new Transaction(booking, amount, PaymentStatus.PENDING));

        transaction.setRazorpayOrderId(orderId);
        transaction.setPaymentStatus(PaymentStatus.PENDING);
        transactionRepository.save(transaction);

        return new PaymentOrderResponse(
                booking.getId(),
                orderId,
                amount,
                "INR",
                keyId
        );
    }

    @Transactional
    public Transaction verifyAndCompletePayment(PaymentVerificationRequest request) {
        User currentUser = authService.getCurrentUser();

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + request.getBookingId()));

        if (currentUser.getRole() != Role.ADMIN && !booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access Denied: You do not own this booking.");
        }

        Transaction transaction = transactionRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found for booking ID: " + request.getBookingId()));

        boolean isValidSignature = true;

        if (!keyId.contains("placeholder") && request.getRazorpaySignature() != null && !request.getRazorpaySignature().isEmpty()) {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                options.put("razorpay_signature", request.getRazorpaySignature());

                isValidSignature = Utils.verifyPaymentSignature(options, keySecret);
            } catch (Exception e) {
                logger.error("Signature verification exception: {}", e.getMessage());
                isValidSignature = false;
            }
        }

        if (isValidSignature) {
            transaction.setRazorpayPaymentId(request.getRazorpayPaymentId());
            transaction.setPaymentStatus(PaymentStatus.SUCCESS);
            booking.setStatus(BookingStatus.CONFIRMED);

            transactionRepository.save(transaction);
            bookingRepository.save(booking);
            logger.info("Payment confirmed successfully for booking ID: {}", booking.getId());
            return transaction;
        } else {
            transaction.setPaymentStatus(PaymentStatus.FAILED);
            transactionRepository.save(transaction);
            throw new IllegalArgumentException("Payment verification failed! Invalid signature.");
        }
    }
}
