package com.salon.booking.ai.tool;

import com.salon.booking.model.Slot;
import com.salon.booking.repository.SlotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI Tool: getAvailableSlots
 * Finds available (unbooked) appointment slots for a salon on a specific date,
 * optionally filtered by a preferred time range.
 * Reuses existing SlotRepository queries — the same data source as the booking page.
 */
@Component
public class AvailabilityTool {

    private static final Logger logger = LoggerFactory.getLogger(AvailabilityTool.class);

    @Autowired
    private SlotRepository slotRepository;

    public String execute(Map<String, Object> params) {
        long start = System.currentTimeMillis();

        Long shopId = toLong(params.get("shopId"));
        String dateStr = (String) params.getOrDefault("date", "");
        String preferredAfter = (String) params.getOrDefault("preferredAfter", "");
        String preferredBefore = (String) params.getOrDefault("preferredBefore", "");

        if (shopId == null) {
            return "{\"error\": \"shopId is required to check availability.\"}";
        }

        if (dateStr == null || dateStr.trim().isEmpty()) {
            return "{\"error\": \"date is required (format: YYYY-MM-DD).\"}";
        }

        LocalDate date;
        try {
            date = LocalDate.parse(dateStr.trim());
        } catch (DateTimeParseException e) {
            return "{\"error\": \"Invalid date format. Use YYYY-MM-DD.\"}";
        }

        // Don't allow querying past dates
        if (date.isBefore(LocalDate.now())) {
            return "{\"error\": \"Cannot check availability for past dates.\"}";
        }

        logger.info("AvailabilityTool executing - shopId: {}, date: {}", shopId, date);

        // Get only unbooked slots — reuses the existing repository method
        List<Slot> availableSlots = slotRepository.findByShopIdAndDateAndIsBooked(shopId, date, false);

        // Filter out past time slots for today
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        if (date.equals(today)) {
            availableSlots = availableSlots.stream()
                    .filter(slot -> slot.getStartTime().isAfter(now))
                    .collect(Collectors.toList());
        }

        // Apply preferred time range filter
        if (preferredAfter != null && !preferredAfter.trim().isEmpty()) {
            try {
                LocalTime after = LocalTime.parse(preferredAfter.trim());
                availableSlots = availableSlots.stream()
                        .filter(slot -> !slot.getStartTime().isBefore(after))
                        .collect(Collectors.toList());
            } catch (DateTimeParseException e) {
                logger.warn("Invalid preferredAfter time format: {}", preferredAfter);
            }
        }

        if (preferredBefore != null && !preferredBefore.trim().isEmpty()) {
            try {
                LocalTime before = LocalTime.parse(preferredBefore.trim());
                availableSlots = availableSlots.stream()
                        .filter(slot -> !slot.getStartTime().isAfter(before))
                        .collect(Collectors.toList());
            } catch (DateTimeParseException e) {
                logger.warn("Invalid preferredBefore time format: {}", preferredBefore);
            }
        }

        if (availableSlots.isEmpty()) {
            long elapsed = System.currentTimeMillis() - start;
            logger.info("AvailabilityTool completed in {}ms, found 0 available slots", elapsed);
            return "{\"results\": [], \"message\": \"No available slots found for this salon on " + dateStr + ". Try a different date or time.\"}";
        }

        String results = availableSlots.stream()
                .map(slot -> String.format(
                        "{\"slotId\": %d, \"date\": \"%s\", \"startTime\": \"%s\", \"endTime\": \"%s\", \"shopId\": %d, \"shopName\": \"%s\"}",
                        slot.getId(),
                        slot.getDate().toString(),
                        slot.getStartTime().toString(),
                        slot.getEndTime().toString(),
                        slot.getShop().getId(),
                        escapeJson(slot.getShop().getName())
                ))
                .collect(Collectors.joining(", "));

        long elapsed = System.currentTimeMillis() - start;
        logger.info("AvailabilityTool completed in {}ms, found {} available slots", elapsed, availableSlots.size());

        return "{\"results\": [" + results + "]}";
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
