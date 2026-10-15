package com.salon.booking.ai.tool;

import com.salon.booking.model.Service;
import com.salon.booking.model.Shop;
import com.salon.booking.repository.ServiceRepository;
import com.salon.booking.repository.ShopRepository;
import com.salon.booking.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * AI Tool: searchSalons
 * Searches for salons by name/address text, rating, and optionally filters
 * by whether they offer a particular service type.
 * Reuses existing CustomerService.getAllShops() and ShopRepository.
 */
@Component
public class SalonSearchTool {

    private static final Logger logger = LoggerFactory.getLogger(SalonSearchTool.class);

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    public String execute(Map<String, Object> params) {
        long start = System.currentTimeMillis();

        String search = (String) params.getOrDefault("search", "");
        Double minRating = params.containsKey("minRating") ? toDouble(params.get("minRating")) : null;
        BigDecimal maxPrice = params.containsKey("maxPrice") ? toBigDecimal(params.get("maxPrice")) : null;
        String serviceKeyword = (String) params.getOrDefault("serviceKeyword", "");

        logger.info("SalonSearchTool executing - search: '{}', minRating: {}, maxPrice: {}, serviceKeyword: '{}'",
                search, minRating, maxPrice, serviceKeyword);

        // Start with all shops, optionally filtered by search text (reuses existing method)
        List<Shop> shops = customerService.getAllShops(search != null && !search.isEmpty() ? search : null);

        // Filter by minimum rating
        if (minRating != null) {
            shops = shops.stream()
                    .filter(s -> s.getRating() != null && s.getRating() >= minRating)
                    .collect(Collectors.toList());
        }

        // If service keyword provided, filter to shops that have matching services
        if (serviceKeyword != null && !serviceKeyword.trim().isEmpty()) {
            List<Service> matchingServices = serviceRepository.findByNameContainingIgnoreCase(serviceKeyword.trim());
            Set<Long> shopIdsWithService = matchingServices.stream()
                    .map(s -> s.getShop().getId())
                    .collect(Collectors.toSet());
            shops = shops.stream()
                    .filter(s -> shopIdsWithService.contains(s.getId()))
                    .collect(Collectors.toList());
        }

        // If maxPrice provided, filter to shops that have at least one service within budget
        if (maxPrice != null) {
            final BigDecimal budget = maxPrice;
            shops = shops.stream()
                    .filter(shop -> {
                        List<Service> shopServices = serviceRepository.findByShopId(shop.getId());
                        return shopServices.stream().anyMatch(s -> s.getPrice().compareTo(budget) <= 0);
                    })
                    .collect(Collectors.toList());
        }

        if (shops.isEmpty()) {
            logger.info("SalonSearchTool found 0 results");
            return "{\"results\": [], \"message\": \"No salons found matching your criteria. Try broadening your search.\"}";
        }

        String results = shops.stream()
                .map(s -> String.format(
                        "{\"shopId\": %d, \"shopName\": \"%s\", \"address\": \"%s\", \"rating\": %s, \"ratingCount\": %d, \"openTime\": \"%s\", \"closeTime\": \"%s\"}",
                        s.getId(),
                        escapeJson(s.getName()),
                        escapeJson(s.getAddress()),
                        s.getRating() != null ? s.getRating().toString() : "null",
                        s.getRatingCount() != null ? s.getRatingCount() : 0,
                        s.getOpenTime() != null ? s.getOpenTime().toString() : "",
                        s.getCloseTime() != null ? s.getCloseTime().toString() : ""
                ))
                .collect(Collectors.joining(", "));

        long elapsed = System.currentTimeMillis() - start;
        logger.info("SalonSearchTool completed in {}ms, found {} salons", elapsed, shops.size());

        return "{\"results\": [" + results + "]}";
    }

    private Double toDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try { return Double.parseDouble(value.toString()); } catch (NumberFormatException e) { return null; }
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
        try { return new BigDecimal(value.toString()); } catch (NumberFormatException e) { return null; }
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
