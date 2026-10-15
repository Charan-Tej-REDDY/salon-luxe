package com.salon.booking.ai.tool;

import com.salon.booking.dto.BookingDetailDto;
import com.salon.booking.dto.BookingRequest;
import com.salon.booking.model.Slot;
import com.salon.booking.repository.SlotRepository;
import com.salon.booking.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI Tool: createBooking
 * Creates a booking by delegating to the EXISTING CustomerService.bookSlot() method.
 * This is the same synchronized, transactional method used by the regular booking page.
 * 
 * CRITICAL: This tool must ONLY be called after the AI has presented a confirmation
 * summary and the customer has explicitly confirmed.
 * 
 * On slot conflict (race condition), catches the exception and suggests alternatives.
 */
@Component
public class BookingTool {

    private static final Logger logger = LoggerFactory.getLogger(BookingTool.class);

    @Autowired
    private CustomerService customerService;

    @Autowired
    private SlotRepository slotRepository;

    public String execute(Map<String, Object> params) {
        long start = System.currentTimeMillis();

        Long shopId = toLong(params.get("shopId"));
        Long serviceId = toLong(params.get("serviceId"));
        Long slotId = toLong(params.get("slotId"));

        if (shopId == null || serviceId == null || slotId == null) {
            return "{\"error\": \"shopId, serviceId, and slotId are all required to create a booking.\"}";
        }

        logger.info("BookingTool executing - shopId: {}, serviceId: {}, slotId: {}", shopId, serviceId, slotId);

        try {
            // Delegate to the EXACT same method used by CustomerController.bookSlot()
            // This method is synchronized and @Transactional — it handles:
            //   - Shop/Service/Slot existence validation
            //   - Service-Shop ownership validation
            //   - Slot-Shop ownership validation
            //   - Past time prevention
            //   - Double-booking / race condition prevention
            //   - Slot marking as booked
            //   - Booking + Transaction creation
            BookingRequest bookingRequest = new BookingRequest(shopId, serviceId, slotId);
            BookingDetailDto result = customerService.bookSlot(bookingRequest);

            long elapsed = System.currentTimeMillis() - start;
            logger.info("BookingTool completed successfully in {}ms, bookingId: {}", elapsed, result.getBooking().getId());

            return String.format(
                    "{\"success\": true, \"bookingId\": %d, \"status\": \"%s\", \"shopName\": \"%s\", \"serviceName\": \"%s\", \"date\": \"%s\", \"startTime\": \"%s\", \"endTime\": \"%s\", \"price\": %s, \"message\": \"Booking created successfully! The booking is currently PENDING. Please complete payment to confirm.\"}",
                    result.getBooking().getId(),
                    result.getBooking().getStatus().name(),
                    escapeJson(result.getBooking().getShop().getName()),
                    escapeJson(result.getBooking().getService().getName()),
                    result.getBooking().getSlot().getDate().toString(),
                    result.getBooking().getSlot().getStartTime().toString(),
                    result.getBooking().getSlot().getEndTime().toString(),
                    result.getBooking().getService().getPrice().toPlainString()
            );

        } catch (IllegalArgumentException e) {
            logger.warn("BookingTool failed: {}", e.getMessage());

            // If slot was taken, try to suggest alternatives
            String alternativesJson = findAlternativeSlots(shopId, slotId);

            return String.format(
                    "{\"success\": false, \"error\": \"%s\", \"alternatives\": %s}",
                    escapeJson(e.getMessage()),
                    alternativesJson
            );
        } catch (Exception e) {
            logger.error("BookingTool unexpected error", e);
            return "{\"success\": false, \"error\": \"An unexpected error occurred while creating the booking. Please try again.\"}";
        }
    }

    /**
     * When a slot is no longer available, find other available slots on the same date at the same salon.
     */
    private String findAlternativeSlots(Long shopId, Long failedSlotId) {
        try {
            // Try to determine the date from the failed slot
            Slot failedSlot = slotRepository.findById(failedSlotId).orElse(null);
            LocalDate date = failedSlot != null ? failedSlot.getDate() : LocalDate.now();

            List<Slot> alternatives = slotRepository.findByShopIdAndDateAndIsBooked(shopId, date, false);

            if (alternatives.isEmpty()) {
                // Try tomorrow
                alternatives = slotRepository.findByShopIdAndDateAndIsBooked(shopId, date.plusDays(1), false);
            }

            if (alternatives.isEmpty()) {
                return "[]";
            }

            return "[" + alternatives.stream()
                    .limit(5)
                    .map(slot -> String.format(
                            "{\"slotId\": %d, \"date\": \"%s\", \"startTime\": \"%s\", \"endTime\": \"%s\"}",
                            slot.getId(),
                            slot.getDate().toString(),
                            slot.getStartTime().toString(),
                            slot.getEndTime().toString()
                    ))
                    .collect(Collectors.joining(", ")) + "]";
        } catch (Exception e) {
            logger.warn("Failed to find alternative slots", e);
            return "[]";
        }
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        try { return Long.parseLong(value.toString()); } catch (NumberFormatException e) { return null; }
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
