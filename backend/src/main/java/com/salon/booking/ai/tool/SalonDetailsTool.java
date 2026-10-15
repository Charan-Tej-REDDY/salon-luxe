package com.salon.booking.ai.tool;

import com.salon.booking.model.Service;
import com.salon.booking.model.Shop;
import com.salon.booking.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI Tool: getSalonDetails
 * Returns detailed information about a specific salon including its services.
 * Reuses existing CustomerService methods.
 */
@Component
public class SalonDetailsTool {

    private static final Logger logger = LoggerFactory.getLogger(SalonDetailsTool.class);

    @Autowired
    private CustomerService customerService;

    public String execute(Map<String, Object> params) {
        long start = System.currentTimeMillis();

        Long shopId = toLong(params.get("shopId"));

        if (shopId == null) {
            return "{\"error\": \"shopId is required.\"}";
        }

        logger.info("SalonDetailsTool executing - shopId: {}", shopId);

        try {
            Shop shop = customerService.getShopDetails(shopId);
            List<Service> services = customerService.getServicesForShop(shopId);

            String servicesJson = services.stream()
                    .map(s -> String.format(
                            "{\"serviceId\": %d, \"name\": \"%s\", \"description\": \"%s\", \"price\": %s, \"duration\": %d}",
                            s.getId(),
                            escapeJson(s.getName()),
                            escapeJson(s.getDescription() != null ? s.getDescription() : ""),
                            s.getPrice().toPlainString(),
                            s.getDuration()
                    ))
                    .collect(Collectors.joining(", "));

            String result = String.format(
                    "{\"shopId\": %d, \"name\": \"%s\", \"address\": \"%s\", \"rating\": %s, \"ratingCount\": %d, \"openTime\": \"%s\", \"closeTime\": \"%s\", \"tagline\": \"%s\", \"services\": [%s]}",
                    shop.getId(),
                    escapeJson(shop.getName()),
                    escapeJson(shop.getAddress()),
                    shop.getRating() != null ? shop.getRating().toString() : "null",
                    shop.getRatingCount() != null ? shop.getRatingCount() : 0,
                    shop.getOpenTime() != null ? shop.getOpenTime().toString() : "",
                    shop.getCloseTime() != null ? shop.getCloseTime().toString() : "",
                    escapeJson(shop.getTagline() != null ? shop.getTagline() : ""),
                    servicesJson
            );

            long elapsed = System.currentTimeMillis() - start;
            logger.info("SalonDetailsTool completed in {}ms", elapsed);

            return result;
        } catch (IllegalArgumentException e) {
            return "{\"error\": \"Salon not found with ID: " + shopId + "\"}";
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
