package com.salon.booking.ai.tool;

import com.salon.booking.model.Service;
import com.salon.booking.repository.ServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI Tool: searchServices
 * Searches for salon services by keyword matching on service name.
 * Reuses the existing ServiceRepository.
 */
@Component
public class ServiceSearchTool {

    private static final Logger logger = LoggerFactory.getLogger(ServiceSearchTool.class);

    @Autowired
    private ServiceRepository serviceRepository;

    public String execute(Map<String, Object> params) {
        long start = System.currentTimeMillis();
        String keyword = (String) params.getOrDefault("keyword", "");

        if (keyword == null || keyword.trim().isEmpty()) {
            logger.warn("ServiceSearchTool called with empty keyword");
            return "{\"error\": \"Please provide a service keyword to search for (e.g., 'haircut', 'facial', 'beard').\"}";
        }

        logger.info("ServiceSearchTool executing with keyword: {}", keyword);

        List<Service> services = serviceRepository.findByNameContainingIgnoreCase(keyword.trim());

        if (services.isEmpty()) {
            logger.info("ServiceSearchTool found 0 results for '{}'", keyword);
            return "{\"results\": [], \"message\": \"No services found matching '" + keyword + "'. Try a different keyword like 'haircut', 'facial', 'spa', or 'beard'.\"}";
        }

        String results = services.stream()
                .map(s -> String.format(
                        "{\"serviceId\": %d, \"serviceName\": \"%s\", \"description\": \"%s\", \"price\": %s, \"duration\": %d, \"shopId\": %d, \"shopName\": \"%s\"}",
                        s.getId(),
                        escapeJson(s.getName()),
                        escapeJson(s.getDescription() != null ? s.getDescription() : ""),
                        s.getPrice().toPlainString(),
                        s.getDuration(),
                        s.getShop().getId(),
                        escapeJson(s.getShop().getName())
                ))
                .collect(Collectors.joining(", "));

        long elapsed = System.currentTimeMillis() - start;
        logger.info("ServiceSearchTool completed in {}ms, found {} services", elapsed, services.size());

        return "{\"results\": [" + results + "]}";
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
