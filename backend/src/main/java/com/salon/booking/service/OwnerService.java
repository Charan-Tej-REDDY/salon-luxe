package com.salon.booking.service;

import com.salon.booking.dto.BookingDetailDto;
import com.salon.booking.dto.ServiceRequest;
import com.salon.booking.dto.ShopRequest;
import com.salon.booking.dto.SlotBatchRequest;
import com.salon.booking.dto.SlotRequest;
import com.salon.booking.model.*;
import com.salon.booking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OwnerService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private AuthService authService;

    // Helper: Validates that the logged-in user owns the given shop (or is ADMIN)
    private void validateShopOwnership(Shop shop) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN && !shop.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access Denied: You do not own this salon shop.");
        }
    }

    // --- Shop Operations ---

    @Transactional
    public Shop createShop(ShopRequest request) {
        User currentUser = authService.getCurrentUser();

        Shop shop = new Shop(
                currentUser,
                request.getName(),
                request.getAddress(),
                request.getOpenTime(),
                request.getCloseTime(),
                request.getImageUrl(),
                request.getRating(),
                request.getRatingCount(),
                request.getGoogleMapsUrl(),
                request.getTagline()
        );

        return shopRepository.save(shop);
    }

    @Transactional(readOnly = true)
    public List<Shop> getMyShops() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            return shopRepository.findAll();
        }
        return shopRepository.findByOwnerId(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public Shop getShopById(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));
        validateShopOwnership(shop);
        return shop;
    }

    @Transactional
    public Shop updateShop(Long shopId, ShopRequest request) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));

        validateShopOwnership(shop);

        shop.setName(request.getName());
        shop.setAddress(request.getAddress());
        shop.setOpenTime(request.getOpenTime());
        shop.setCloseTime(request.getCloseTime());
        if (request.getImageUrl() != null) shop.setImageUrl(request.getImageUrl());
        if (request.getGoogleMapsUrl() != null) shop.setGoogleMapsUrl(request.getGoogleMapsUrl());
        if (request.getTagline() != null) shop.setTagline(request.getTagline());

        return shopRepository.save(shop);
    }

    @Transactional
    public void deleteShop(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));

        validateShopOwnership(shop);
        shopRepository.delete(shop);
    }

    // --- Service Operations ---

    @Transactional
    public com.salon.booking.model.Service addServiceToShop(Long shopId, ServiceRequest request) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));

        validateShopOwnership(shop);

        com.salon.booking.model.Service service = new com.salon.booking.model.Service(
                shop,
                request.getName(),
                request.getPrice(),
                request.getDuration(),
                request.getImageUrl(),
                request.getDescription()
        );

        return serviceRepository.save(service);
    }

    @Transactional(readOnly = true)
    public List<com.salon.booking.model.Service> getServicesForShop(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));

        validateShopOwnership(shop);
        return serviceRepository.findByShopId(shopId);
    }

    @Transactional
    public com.salon.booking.model.Service updateService(Long serviceId, ServiceRequest request) {
        com.salon.booking.model.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + serviceId));

        validateShopOwnership(service.getShop());

        service.setName(request.getName());
        service.setPrice(request.getPrice());
        service.setDuration(request.getDuration());
        if (request.getImageUrl() != null) service.setImageUrl(request.getImageUrl());
        if (request.getDescription() != null) service.setDescription(request.getDescription());

        return serviceRepository.save(service);
    }

    @Transactional
    public void deleteService(Long serviceId) {
        com.salon.booking.model.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + serviceId));

        validateShopOwnership(service.getShop());
        serviceRepository.delete(service);
    }

    // --- Slot Operations ---

    @Transactional
    public Slot createSlot(Long shopId, SlotRequest request) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));

        validateShopOwnership(shop);

        LocalDate today = LocalDate.now();
        if (request.getDate().isBefore(today)) {
            throw new IllegalArgumentException("Cannot create slots for past dates.");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Slot start time must be before end time.");
        }

        if (request.getStartTime().isBefore(shop.getOpenTime()) || request.getEndTime().isAfter(shop.getCloseTime())) {
            throw new IllegalArgumentException("Slot time must fall within parlour operating hours (" +
                    shop.getOpenTime() + " - " + shop.getCloseTime() + ").");
        }

        Slot slot = new Slot(
                shop,
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                false
        );

        return slotRepository.save(slot);
    }

    @Transactional
    public List<Slot> createBatchSlots(Long shopId, SlotBatchRequest request) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));

        validateShopOwnership(shop);

        LocalDate today = LocalDate.now();
        if (request.getDate().isBefore(today)) {
            throw new IllegalArgumentException("Cannot generate slots for past dates.");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Batch start time must be before end time.");
        }

        List<Slot> createdSlots = new ArrayList<>();
        LocalTime current = request.getStartTime();
        LocalTime end = request.getEndTime();
        int durationMinutes = request.getSlotDurationMinutes();

        while (current.plusMinutes(durationMinutes).isBefore(end) || current.plusMinutes(durationMinutes).equals(end)) {
            LocalTime slotEnd = current.plusMinutes(durationMinutes);
            Slot slot = new Slot(shop, request.getDate(), current, slotEnd, false);
            createdSlots.add(slot);
            current = slotEnd;
        }

        return slotRepository.saveAll(createdSlots);
    }

    @Transactional(readOnly = true)
    public List<Slot> getSlotsForShop(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));

        validateShopOwnership(shop);
        return slotRepository.findByShopId(shopId);
    }

    @Transactional
    public void deleteSlot(Long slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found with ID: " + slotId));

        validateShopOwnership(slot.getShop());

        if (slot.getIsBooked()) {
            throw new IllegalStateException("Cannot delete an already booked slot.");
        }

        slotRepository.delete(slot);
    }

    // --- Booking & Transaction Management for Owner ---

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<BookingDetailDto> getMyShopsBookings() {
        User currentUser = authService.getCurrentUser();
        List<Booking> bookings;
        if (currentUser.getRole() == Role.ADMIN) {
            bookings = bookingRepository.findAll();
        } else {
            bookings = bookingRepository.findByShopOwnerIdOrderByCreatedAtDesc(currentUser.getId());
        }

        List<BookingDetailDto> result = new ArrayList<>();
        for (Booking b : bookings) {
            Optional<Transaction> tx = transactionRepository.findByBookingId(b.getId());
            result.add(new BookingDetailDto(b, tx.orElse(null)));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<BookingDetailDto> getBookingsForShop(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));
        validateShopOwnership(shop);

        List<Booking> bookings = bookingRepository.findByShopIdOrderByCreatedAtDesc(shopId);
        List<BookingDetailDto> result = new ArrayList<>();
        for (Booking b : bookings) {
            Optional<Transaction> tx = transactionRepository.findByBookingId(b.getId());
            result.add(new BookingDetailDto(b, tx.orElse(null)));
        }
        return result;
    }

    @Transactional
    public BookingDetailDto updateBookingStatus(Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        validateShopOwnership(booking.getShop());

        booking.setStatus(newStatus);
        Booking savedBooking = bookingRepository.save(booking);

        if (newStatus == BookingStatus.CANCELLED) {
            Slot slot = booking.getSlot();
            if (slot != null) {
                slot.setIsBooked(false);
                slotRepository.save(slot);
            }
        }

        Transaction tx = transactionRepository.findByBookingId(booking.getId()).orElse(null);
        return new BookingDetailDto(savedBooking, tx);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getMyTransactions() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            return transactionRepository.findAll();
        }
        return transactionRepository.findByBookingShopOwnerIdOrderByCreatedAtDesc(currentUser.getId());
    }
}
