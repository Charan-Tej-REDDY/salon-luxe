package com.salon.booking.ai.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.salon.booking.ai.tool.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Spring AI Function Callback Configuration.
 * 
 * Registers the 6 Salon Luxe tools as Spring AI functions.
 * Spring AI automatically converts the record schemas into JSON Schema for tool calling,
 * invokes the functions upon LLM request, and passes results back seamlessly.
 */
@Configuration
public class AiToolsConfig {

    public record ServiceSearchRequest(
            @JsonProperty(required = true)
            @JsonPropertyDescription("Keyword to search salon services for, such as 'haircut', 'facial', 'beard', 'massage'")
            String keyword
    ) {}

    public record SalonSearchRequest(
            @JsonPropertyDescription("Keyword to filter salons by name or address (optional)")
            String keyword,
            @JsonPropertyDescription("Minimum rating from 0.0 to 5.0 (optional)")
            Double minRating
    ) {}

    public record SalonDetailsRequest(
            @JsonProperty(required = true)
            @JsonPropertyDescription("The ID of the salon/shop to view details and service menu for")
            Long shopId
    ) {}

    public record AvailabilityRequest(
            @JsonProperty(required = true)
            @JsonPropertyDescription("The ID of the salon/shop")
            Long shopId,
            @JsonProperty(required = true)
            @JsonPropertyDescription("The date to check availability for in YYYY-MM-DD format")
            String date
    ) {}

    public record CreateBookingRequest(
            @JsonProperty(required = true)
            @JsonPropertyDescription("The ID of the salon/shop")
            Long shopId,
            @JsonProperty(required = true)
            @JsonPropertyDescription("The ID of the service to book")
            Long serviceId,
            @JsonProperty(required = true)
            @JsonPropertyDescription("The ID of the time slot to book")
            Long slotId
    ) {}

    public record MyBookingsRequest(
            @JsonPropertyDescription("Optional status filter (e.g. 'PENDING', 'CONFIRMED')")
            String status
    ) {}

    @Bean
    @Description("Search available salon services by keyword matching on service name")
    public Function<ServiceSearchRequest, String> searchServices(ServiceSearchTool tool) {
        return req -> {
            Map<String, Object> params = new HashMap<>();
            if (req != null && req.keyword() != null) params.put("keyword", req.keyword());
            return tool.execute(params);
        };
    }

    @Bean
    @Description("Search and discover salons by keyword or minimum rating")
    public Function<SalonSearchRequest, String> searchSalons(SalonSearchTool tool) {
        return req -> {
            Map<String, Object> params = new HashMap<>();
            if (req != null) {
                if (req.keyword() != null) params.put("keyword", req.keyword());
                if (req.minRating() != null) params.put("minRating", req.minRating());
            }
            return tool.execute(params);
        };
    }

    @Bean
    @Description("Get detailed information for a specific salon, including working hours, full address, and complete service menu")
    public Function<SalonDetailsRequest, String> getSalonDetails(SalonDetailsTool tool) {
        return req -> {
            Map<String, Object> params = new HashMap<>();
            if (req != null && req.shopId() != null) params.put("shopId", req.shopId());
            return tool.execute(params);
        };
    }

    @Bean
    @Description("Check real-time slot availability for a salon on a specific date (YYYY-MM-DD)")
    public Function<AvailabilityRequest, String> getAvailableSlots(AvailabilityTool tool) {
        return req -> {
            Map<String, Object> params = new HashMap<>();
            if (req != null) {
                if (req.shopId() != null) params.put("shopId", req.shopId());
                if (req.date() != null) params.put("date", req.date());
            }
            return tool.execute(params);
        };
    }

    @Bean
    @Description("Create an appointment booking. ONLY call this AFTER presenting the full summary (salon, service, date, time, price) and receiving explicit customer confirmation (e.g. 'yes', 'confirm', 'book it').")
    public Function<CreateBookingRequest, String> createBooking(BookingTool tool) {
        return req -> {
            Map<String, Object> params = new HashMap<>();
            if (req != null) {
                if (req.shopId() != null) params.put("shopId", req.shopId());
                if (req.serviceId() != null) params.put("serviceId", req.serviceId());
                if (req.slotId() != null) params.put("slotId", req.slotId());
            }
            return tool.execute(params);
        };
    }

    @Bean
    @Description("Get the authenticated customer's upcoming and past salon bookings")
    public Function<MyBookingsRequest, String> getMyBookings(MyBookingsTool tool) {
        return req -> {
            Map<String, Object> params = new HashMap<>();
            if (req != null && req.status() != null) params.put("status", req.status());
            return tool.execute(params);
        };
    }
}
