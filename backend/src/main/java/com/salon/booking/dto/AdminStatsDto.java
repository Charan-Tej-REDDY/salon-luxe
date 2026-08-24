package com.salon.booking.dto;

import java.math.BigDecimal;

public class AdminStatsDto {

    private long totalUsers;
    private long totalCustomers;
    private long totalOwners;
    private long totalShops;
    private long totalBookings;
    private long totalConfirmedBookings;
    private BigDecimal totalRevenue;

    public AdminStatsDto() {
    }

    public AdminStatsDto(long totalUsers, long totalCustomers, long totalOwners, long totalShops,
                         long totalBookings, long totalConfirmedBookings, BigDecimal totalRevenue) {
        this.totalUsers = totalUsers;
        this.totalCustomers = totalCustomers;
        this.totalOwners = totalOwners;
        this.totalShops = totalShops;
        this.totalBookings = totalBookings;
        this.totalConfirmedBookings = totalConfirmedBookings;
        this.totalRevenue = totalRevenue;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalOwners() {
        return totalOwners;
    }

    public void setTotalOwners(long totalOwners) {
        this.totalOwners = totalOwners;
    }

    public long getTotalShops() {
        return totalShops;
    }

    public void setTotalShops(long totalShops) {
        this.totalShops = totalShops;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getTotalConfirmedBookings() {
        return totalConfirmedBookings;
    }

    public void setTotalConfirmedBookings(long totalConfirmedBookings) {
        this.totalConfirmedBookings = totalConfirmedBookings;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}
