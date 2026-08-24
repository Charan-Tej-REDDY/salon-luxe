package com.salon.booking.dto;

import jakarta.validation.constraints.NotNull;

public class BookingRequest {

    @NotNull(message = "Shop ID is required")
    private Long shopId;

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Slot ID is required")
    private Long slotId;

    public BookingRequest() {
    }

    public BookingRequest(Long shopId, Long serviceId, Long slotId) {
        this.shopId = shopId;
        this.serviceId = serviceId;
        this.slotId = slotId;
    }

    public Long getShopId() {
        return shopId;
    }

    public void setShopId(Long shopId) {
        this.shopId = shopId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }
}
