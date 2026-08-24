package com.salon.booking.controller;

import com.salon.booking.dto.*;
import com.salon.booking.model.Service;
import com.salon.booking.model.Shop;
import com.salon.booking.model.Slot;
import com.salon.booking.service.OwnerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/owner")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
public class OwnerController {

    @Autowired
    private OwnerService ownerService;

    // --- Shop Endpoints ---

    @PostMapping("/shops")
    public ResponseEntity<Shop> createShop(@Valid @RequestBody ShopRequest request) {
        Shop shop = ownerService.createShop(request);
        return ResponseEntity.ok(shop);
    }

    @GetMapping("/shops")
    public ResponseEntity<List<Shop>> getMyShops() {
        List<Shop> shops = ownerService.getMyShops();
        return ResponseEntity.ok(shops);
    }

    @GetMapping("/shops/{shopId}")
    public ResponseEntity<Shop> getShopById(@PathVariable Long shopId) {
        Shop shop = ownerService.getShopById(shopId);
        return ResponseEntity.ok(shop);
    }

    @PutMapping("/shops/{shopId}")
    public ResponseEntity<Shop> updateShop(@PathVariable Long shopId, @Valid @RequestBody ShopRequest request) {
        Shop shop = ownerService.updateShop(shopId, request);
        return ResponseEntity.ok(shop);
    }

    @DeleteMapping("/shops/{shopId}")
    public ResponseEntity<MessageResponse> deleteShop(@PathVariable Long shopId) {
        ownerService.deleteShop(shopId);
        return ResponseEntity.ok(new MessageResponse("Shop deleted successfully"));
    }

    // --- Service Endpoints ---

    @PostMapping("/shops/{shopId}/services")
    public ResponseEntity<Service> addServiceToShop(@PathVariable Long shopId, @Valid @RequestBody ServiceRequest request) {
        Service service = ownerService.addServiceToShop(shopId, request);
        return ResponseEntity.ok(service);
    }

    @GetMapping("/shops/{shopId}/services")
    public ResponseEntity<List<Service>> getServicesForShop(@PathVariable Long shopId) {
        List<Service> services = ownerService.getServicesForShop(shopId);
        return ResponseEntity.ok(services);
    }

    @PutMapping("/services/{serviceId}")
    public ResponseEntity<Service> updateService(@PathVariable Long serviceId, @Valid @RequestBody ServiceRequest request) {
        Service service = ownerService.updateService(serviceId, request);
        return ResponseEntity.ok(service);
    }

    @DeleteMapping("/services/{serviceId}")
    public ResponseEntity<MessageResponse> deleteService(@PathVariable Long serviceId) {
        ownerService.deleteService(serviceId);
        return ResponseEntity.ok(new MessageResponse("Service deleted successfully"));
    }

    // --- Slot Endpoints ---

    @PostMapping("/shops/{shopId}/slots")
    public ResponseEntity<Slot> createSlot(@PathVariable Long shopId, @Valid @RequestBody SlotRequest request) {
        Slot slot = ownerService.createSlot(shopId, request);
        return ResponseEntity.ok(slot);
    }

    @PostMapping("/shops/{shopId}/slots/batch")
    public ResponseEntity<List<Slot>> createBatchSlots(@PathVariable Long shopId, @Valid @RequestBody SlotBatchRequest request) {
        List<Slot> slots = ownerService.createBatchSlots(shopId, request);
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/shops/{shopId}/slots")
    public ResponseEntity<List<Slot>> getSlotsForShop(@PathVariable Long shopId) {
        List<Slot> slots = ownerService.getSlotsForShop(shopId);
        return ResponseEntity.ok(slots);
    }

    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<MessageResponse> deleteSlot(@PathVariable Long slotId) {
        ownerService.deleteSlot(slotId);
        return ResponseEntity.ok(new MessageResponse("Slot deleted successfully"));
    }

    // --- Booking & Transaction Endpoints ---

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDetailDto>> getMyShopsBookings() {
        List<BookingDetailDto> bookings = ownerService.getMyShopsBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/shops/{shopId}/bookings")
    public ResponseEntity<List<BookingDetailDto>> getBookingsForShop(@PathVariable Long shopId) {
        List<BookingDetailDto> bookings = ownerService.getBookingsForShop(shopId);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/bookings/{bookingId}/confirm")
    public ResponseEntity<BookingDetailDto> confirmBooking(@PathVariable Long bookingId) {
        BookingDetailDto updated = ownerService.updateBookingStatus(bookingId, com.salon.booking.model.BookingStatus.CONFIRMED);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<BookingDetailDto> cancelBooking(@PathVariable Long bookingId) {
        BookingDetailDto updated = ownerService.updateBookingStatus(bookingId, com.salon.booking.model.BookingStatus.CANCELLED);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/bookings/{bookingId}/complete")
    public ResponseEntity<BookingDetailDto> completeBooking(@PathVariable Long bookingId) {
        BookingDetailDto updated = ownerService.updateBookingStatus(bookingId, com.salon.booking.model.BookingStatus.COMPLETED);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<com.salon.booking.model.Transaction>> getMyTransactions() {
        List<com.salon.booking.model.Transaction> transactions = ownerService.getMyTransactions();
        return ResponseEntity.ok(transactions);
    }
}
