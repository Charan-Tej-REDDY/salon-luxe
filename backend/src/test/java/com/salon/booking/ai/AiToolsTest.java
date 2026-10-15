package com.salon.booking.ai;

import com.salon.booking.ai.tool.*;
import com.salon.booking.model.*;
import com.salon.booking.repository.ServiceRepository;
import com.salon.booking.repository.ShopRepository;
import com.salon.booking.repository.SlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AI tools that depend only on interfaces (repositories).
 * Tests for ServiceSearchTool and AvailabilityTool which don't require
 * mocking concrete Spring @Service classes (which fails on Java 26+).
 * 
 * Tools that depend on CustomerService (a concrete class) are tested
 * separately or via integration tests.
 */
@ExtendWith(MockitoExtension.class)
class AiToolsTest {

    @Mock private ServiceRepository serviceRepository;
    @Mock private SlotRepository slotRepository;

    @InjectMocks private ServiceSearchTool serviceSearchTool;
    @InjectMocks private AvailabilityTool availabilityTool;

    private Shop testShop;
    private Service testService;
    private Slot testSlot;

    @BeforeEach
    void setUp() {
        User owner = new User("Owner", "owner@test.com", "pass", Role.OWNER);
        owner.setId(1L);

        testShop = new Shop(owner, "Style Studio", "MG Road, Bangalore", LocalTime.of(9, 0), LocalTime.of(21, 0));
        testShop.setId(1L);
        testShop.setRating(4.7);
        testShop.setRatingCount(120);

        testService = new Service(testShop, "Men's Haircut", new BigDecimal("450"), 30);
        testService.setId(1L);
        testService.setDescription("Classic men's haircut");

        testSlot = new Slot(testShop, LocalDate.now().plusDays(1), LocalTime.of(18, 0), LocalTime.of(18, 30), false);
        testSlot.setId(1L);
    }

    // ==================== ServiceSearchTool Tests ====================

    @Test
    @DisplayName("ServiceSearchTool - should find services by keyword")
    void serviceSearch_findsMatchingServices() {
        when(serviceRepository.findByNameContainingIgnoreCase("haircut"))
                .thenReturn(List.of(testService));

        String result = serviceSearchTool.execute(Map.of("keyword", "haircut"));

        assertTrue(result.contains("Men's Haircut"));
        assertTrue(result.contains("450"));
        assertTrue(result.contains("Style Studio"));
        verify(serviceRepository).findByNameContainingIgnoreCase("haircut");
    }

    @Test
    @DisplayName("ServiceSearchTool - should handle empty keyword")
    void serviceSearch_emptyKeyword_returnsError() {
        String result = serviceSearchTool.execute(Map.of("keyword", ""));
        assertTrue(result.contains("error"));
    }

    @Test
    @DisplayName("ServiceSearchTool - should handle missing keyword")
    void serviceSearch_missingKeyword_returnsError() {
        String result = serviceSearchTool.execute(Map.of());
        assertTrue(result.contains("error"));
    }

    @Test
    @DisplayName("ServiceSearchTool - should handle no results")
    void serviceSearch_noResults() {
        when(serviceRepository.findByNameContainingIgnoreCase("xyz"))
                .thenReturn(Collections.emptyList());

        String result = serviceSearchTool.execute(Map.of("keyword", "xyz"));

        assertTrue(result.contains("No services found"));
    }

    @Test
    @DisplayName("ServiceSearchTool - should escape special characters in names")
    void serviceSearch_escapesSpecialChars() {
        Service specialService = new Service(testShop, "Men's \"Premium\" Cut", new BigDecimal("600"), 45);
        specialService.setId(2L);
        specialService.setDescription("A special\nservice");

        when(serviceRepository.findByNameContainingIgnoreCase("premium"))
                .thenReturn(List.of(specialService));

        String result = serviceSearchTool.execute(Map.of("keyword", "premium"));

        // Should not throw and should contain escaped content
        assertNotNull(result);
        assertFalse(result.contains("\"Premium\""));  // Should be escaped
    }

    // ==================== AvailabilityTool Tests ====================

    @Test
    @DisplayName("AvailabilityTool - should find available slots")
    void availability_findsSlots() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        when(slotRepository.findByShopIdAndDateAndIsBooked(1L, tomorrow, false))
                .thenReturn(List.of(testSlot));

        String result = availabilityTool.execute(Map.of(
                "shopId", 1L,
                "date", tomorrow.toString()
        ));

        assertTrue(result.contains("18:00"));
        assertTrue(result.contains("Style Studio"));
    }

    @Test
    @DisplayName("AvailabilityTool - should reject past dates")
    void availability_rejectsPastDates() {
        String result = availabilityTool.execute(Map.of(
                "shopId", 1L,
                "date", LocalDate.now().minusDays(1).toString()
        ));

        assertTrue(result.contains("past dates"));
    }

    @Test
    @DisplayName("AvailabilityTool - should require shopId")
    void availability_requiresShopId() {
        String result = availabilityTool.execute(Map.of(
                "date", LocalDate.now().plusDays(1).toString()
        ));

        assertTrue(result.contains("shopId is required"));
    }

    @Test
    @DisplayName("AvailabilityTool - should require date")
    void availability_requiresDate() {
        String result = availabilityTool.execute(Map.of("shopId", 1L));

        assertTrue(result.contains("date is required"));
    }

    @Test
    @DisplayName("AvailabilityTool - should handle invalid date format")
    void availability_invalidDateFormat() {
        String result = availabilityTool.execute(Map.of(
                "shopId", 1L,
                "date", "not-a-date"
        ));

        assertTrue(result.contains("Invalid date format"));
    }

    @Test
    @DisplayName("AvailabilityTool - should handle no available slots")
    void availability_noSlots() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        when(slotRepository.findByShopIdAndDateAndIsBooked(1L, tomorrow, false))
                .thenReturn(Collections.emptyList());

        String result = availabilityTool.execute(Map.of(
                "shopId", 1L,
                "date", tomorrow.toString()
        ));

        assertTrue(result.contains("No available slots"));
    }

    @Test
    @DisplayName("AvailabilityTool - should filter by preferred time range")
    void availability_filtersTimeRange() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        Slot morningSlot = new Slot(testShop, tomorrow, LocalTime.of(10, 0), LocalTime.of(10, 30), false);
        morningSlot.setId(2L);
        Slot eveningSlot = new Slot(testShop, tomorrow, LocalTime.of(18, 0), LocalTime.of(18, 30), false);
        eveningSlot.setId(3L);

        when(slotRepository.findByShopIdAndDateAndIsBooked(1L, tomorrow, false))
                .thenReturn(List.of(morningSlot, eveningSlot));

        // Filter for only evening (after 17:00)
        String result = availabilityTool.execute(Map.of(
                "shopId", 1L,
                "date", tomorrow.toString(),
                "preferredAfter", "17:00"
        ));

        assertTrue(result.contains("18:00"));
        assertFalse(result.contains("10:00"));
    }

    @Test
    @DisplayName("AvailabilityTool - should accept shopId as string number")
    void availability_acceptsStringShopId() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        when(slotRepository.findByShopIdAndDateAndIsBooked(1L, tomorrow, false))
                .thenReturn(List.of(testSlot));

        // LLM might pass shopId as "1" (string) instead of 1 (integer)
        String result = availabilityTool.execute(Map.of(
                "shopId", "1",
                "date", tomorrow.toString()
        ));

        assertTrue(result.contains("18:00"));
    }

    // ==================== BookingTool Parameter Validation ====================

    @Test
    @DisplayName("BookingTool - should require all three parameters")
    void booking_requiresAllParams() {
        BookingTool bookingTool = new BookingTool();

        String result1 = bookingTool.execute(Map.of("shopId", 1L));
        assertTrue(result1.contains("required"));

        String result2 = bookingTool.execute(Map.of("shopId", 1L, "serviceId", 1L));
        assertTrue(result2.contains("required"));

        String result3 = bookingTool.execute(Map.of());
        assertTrue(result3.contains("required"));
    }
}
