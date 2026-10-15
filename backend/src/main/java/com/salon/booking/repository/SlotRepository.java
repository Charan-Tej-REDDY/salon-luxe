package com.salon.booking.repository;

import com.salon.booking.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByShopIdAndDate(Long shopId, LocalDate date);
    List<Slot> findByShopId(Long shopId);
    List<Slot> findByShopIdAndIsBooked(Long shopId, Boolean isBooked);
    List<Slot> findByShopIdAndDateAndIsBooked(Long shopId, LocalDate date, Boolean isBooked);
}
