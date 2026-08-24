package com.salon.booking.service;

import com.salon.booking.dto.AdminStatsDto;
import com.salon.booking.dto.BookingDetailDto;
import com.salon.booking.model.*;
import com.salon.booking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

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

    @Transactional(readOnly = true)
    public AdminStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.findByRole(Role.CUSTOMER).size();
        long totalOwners = userRepository.findByRole(Role.OWNER).size();
        long totalShops = shopRepository.count();

        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();
        long totalConfirmedBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .count();

        List<Transaction> allTransactions = transactionRepository.findAll();
        BigDecimal totalRevenue = allTransactions.stream()
                .filter(t -> t.getPaymentStatus() == PaymentStatus.SUCCESS)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AdminStatsDto(
                totalUsers,
                totalCustomers,
                totalOwners,
                totalShops,
                totalBookings,
                totalConfirmedBookings,
                totalRevenue
        );
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateUserRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<BookingDetailDto> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        List<BookingDetailDto> result = new ArrayList<>();
        for (Booking b : bookings) {
            Optional<Transaction> tx = transactionRepository.findByBookingId(b.getId());
            result.add(new BookingDetailDto(b, tx.orElse(null)));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}
