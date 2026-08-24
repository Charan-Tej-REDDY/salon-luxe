package com.salon.booking.repository;

import com.salon.booking.model.Booking;
import com.salon.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findByShopIdOrderByCreatedAtDesc(Long shopId);
    List<Booking> findByShopOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<Booking> findByShopIdAndStatus(Long shopId, BookingStatus status);
}
