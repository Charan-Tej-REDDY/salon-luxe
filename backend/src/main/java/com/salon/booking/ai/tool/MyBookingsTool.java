package com.salon.booking.ai.tool;

import com.salon.booking.dto.BookingDetailDto;
import com.salon.booking.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI Tool: getMyBookings
 * Retrieves the authenticated customer's bookings.
 * Reuses existing CustomerService.getMyBookings() — customer identity comes from SecurityContext.
 */
@Component
public class MyBookingsTool {

    private static final Logger logger = LoggerFactory.getLogger(MyBookingsTool.class);

    @Autowired
    private CustomerService customerService;

    public String execute(Map<String, Object> params) {
        long start = System.currentTimeMillis();

        logger.info("MyBookingsTool executing");

        try {
            List<BookingDetailDto> bookings = customerService.getMyBookings();

            if (bookings.isEmpty()) {
                return "{\"results\": [], \"message\": \"You don't have any bookings yet.\"}";
            }

            String results = bookings.stream()
                    .limit(10) // Limit to recent 10 to avoid token overflow
                    .map(bd -> {
                        var b = bd.getBooking();
                        var tx = bd.getTransaction();
                        return String.format(
                                "{\"bookingId\": %d, \"shopName\": \"%s\", \"serviceName\": \"%s\", \"date\": \"%s\", \"startTime\": \"%s\", \"endTime\": \"%s\", \"status\": \"%s\", \"price\": %s, \"paymentStatus\": \"%s\"}",
                                b.getId(),
                                escapeJson(b.getShop().getName()),
                                escapeJson(b.getService().getName()),
                                b.getSlot().getDate().toString(),
                                b.getSlot().getStartTime().toString(),
                                b.getSlot().getEndTime().toString(),
                                b.getStatus().name(),
                                b.getService().getPrice().toPlainString(),
                                tx != null ? tx.getPaymentStatus().name() : "UNKNOWN"
                        );
                    })
                    .collect(Collectors.joining(", "));

            long elapsed = System.currentTimeMillis() - start;
            logger.info("MyBookingsTool completed in {}ms, found {} bookings", elapsed, bookings.size());

            return "{\"results\": [" + results + "], \"totalCount\": " + bookings.size() + "}";
        } catch (Exception e) {
            logger.error("MyBookingsTool error", e);
            return "{\"error\": \"Could not retrieve your bookings. Please try again.\"}";
        }
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
