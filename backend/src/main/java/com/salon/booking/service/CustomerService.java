package com.salon.booking.service;

import com.salon.booking.dto.BookingDetailDto;
import com.salon.booking.dto.BookingRequest;
import com.salon.booking.model.*;
import com.salon.booking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AuthService authService;

    // --- Public / Discovery Operations ---

    @Transactional(readOnly = true)
    public List<Shop> getAllShops(String search) {
        List<Shop> allShops = shopRepository.findAll();
        if (search != null && !search.trim().isEmpty()) {
            String lower = search.trim().toLowerCase();
            return allShops.stream()
                    .filter(s -> s.getName().toLowerCase().contains(lower) || s.getAddress().toLowerCase().contains(lower))
                    .collect(Collectors.toList());
        }
        return allShops;
    }

    @Transactional(readOnly = true)
    public Shop getShopDetails(Long shopId) {
        return shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));
    }

    @Transactional(readOnly = true)
    public List<com.salon.booking.model.Service> getServicesForShop(Long shopId) {
        return serviceRepository.findByShopId(shopId);
    }

    @Transactional(readOnly = true)
    public List<Slot> getAvailableSlots(Long shopId, LocalDate date) {
        if (date != null) {
            return slotRepository.findByShopIdAndDate(shopId, date);
        }
        return slotRepository.findByShopId(shopId);
    }

    // --- Customer Booking Operations (strictly authenticated from JWT) ---

    @Transactional
    public synchronized BookingDetailDto bookSlot(BookingRequest request) {
        User currentCustomer = authService.getCurrentUser();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Shop shop = shopRepository.findById(request.getShopId())
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + request.getShopId()));

        com.salon.booking.model.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + request.getServiceId()));

        Slot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new IllegalArgumentException("Slot not found with ID: " + request.getSlotId()));

        // Edge Case 1: Validation of shop ownership
        if (!service.getShop().getId().equals(shop.getId())) {
            throw new IllegalArgumentException("Service does not belong to this salon parlour.");
        }

        if (!slot.getShop().getId().equals(shop.getId())) {
            throw new IllegalArgumentException("Slot does not belong to this salon parlour.");
        }

        // Edge Case 2: Past Time Slot Booking Prevention
        if (slot.getDate().isBefore(today) || (slot.getDate().isEqual(today) && slot.getStartTime().isBefore(now))) {
            throw new IllegalArgumentException("Cannot book a time slot in the past. Current time has already passed " + slot.getStartTime() + ".");
        }

        // Edge Case 3: Double Booking / Race Condition Prevention
        if (slot.getIsBooked()) {
            throw new IllegalArgumentException("This time slot was just booked by another patron. Please select another slot.");
        }

        // Mark slot as booked
        slot.setIsBooked(true);
        slotRepository.save(slot);

        // Create Booking
        Booking booking = new Booking(
                currentCustomer,
                shop,
                service,
                slot,
                BookingStatus.PENDING
        );
        Booking savedBooking = bookingRepository.save(booking);

        // Create Transaction
        Transaction transaction = new Transaction(
                savedBooking,
                service.getPrice(),
                PaymentStatus.PENDING
        );
        Transaction savedTransaction = transactionRepository.save(transaction);

        return new BookingDetailDto(savedBooking, savedTransaction);
    }

    @Transactional(readOnly = true)
    public List<BookingDetailDto> getMyBookings() {
        User currentCustomer = authService.getCurrentUser();
        List<Booking> bookings = bookingRepository.findByCustomerIdOrderByCreatedAtDesc(currentCustomer.getId());

        List<BookingDetailDto> result = new ArrayList<>();
        for (Booking b : bookings) {
            Optional<Transaction> tx = transactionRepository.findByBookingId(b.getId());
            result.add(new BookingDetailDto(b, tx.orElse(null)));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public BookingDetailDto getMyBookingDetails(Long bookingId) {
        User currentCustomer = authService.getCurrentUser();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (currentCustomer.getRole() != Role.ADMIN && !booking.getCustomer().getId().equals(currentCustomer.getId())) {
            throw new AccessDeniedException("Access Denied: You cannot access another customer's booking.");
        }

        Transaction transaction = transactionRepository.findByBookingId(booking.getId()).orElse(null);
        return new BookingDetailDto(booking, transaction);
    }

    @Transactional
    public BookingDetailDto cancelBooking(Long bookingId) {
        User currentCustomer = authService.getCurrentUser();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (currentCustomer.getRole() != Role.ADMIN && !booking.getCustomer().getId().equals(currentCustomer.getId())) {
            throw new AccessDeniedException("Access Denied: You can only cancel your own booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled.");
        }

        // Edge Case 4: Cannot cancel an appointment if time has already started/passed
        Slot slot = booking.getSlot();
        if (slot != null) {
            if (slot.getDate().isBefore(today) || (slot.getDate().isEqual(today) && slot.getStartTime().isBefore(now))) {
                throw new IllegalArgumentException("Cannot cancel an appointment that has already started or elapsed.");
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);

        // Free up the slot
        if (slot != null) {
            slot.setIsBooked(false);
            slotRepository.save(slot);
        }

        // Handle refund status if paid
        Transaction transaction = transactionRepository.findByBookingId(booking.getId()).orElse(null);
        if (transaction != null) {
            if (transaction.getPaymentStatus() == PaymentStatus.SUCCESS) {
                transaction.setPaymentStatus(PaymentStatus.REFUNDED);
            } else if (transaction.getPaymentStatus() == PaymentStatus.PENDING) {
                transaction.setPaymentStatus(PaymentStatus.FAILED);
            }
            transaction = transactionRepository.save(transaction);
        }

        return new BookingDetailDto(savedBooking, transaction);
    }
}
