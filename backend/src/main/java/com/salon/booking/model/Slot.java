package com.salon.booking.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "slots")
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate date;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_booked", nullable = false)
    private Boolean isBooked = false;

    public Slot() {
    }

    public Slot(Shop shop, LocalDate date, LocalTime startTime, LocalTime endTime, Boolean isBooked) {
        this.shop = shop;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isBooked = isBooked != null ? isBooked : false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Shop getShop() {
        return shop;
    }

    public void setShop(Shop shop) {
        this.shop = shop;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Boolean getIsBooked() {
        return isBooked;
    }

    public void setIsBooked(Boolean booked) {
        isBooked = booked;
    }
}
