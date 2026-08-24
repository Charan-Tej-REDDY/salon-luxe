package com.salon.booking.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

@Entity
@Table(name = "shops")
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String address;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    @Column(name = "open_time", nullable = false)
    private LocalTime openTime;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    @Column(name = "close_time", nullable = false)
    private LocalTime closeTime;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "rating")
    private Double rating = 4.9;

    @Column(name = "rating_count")
    private Integer ratingCount = 120;

    @Column(name = "google_maps_url", length = 1000)
    private String googleMapsUrl;

    @Column(name = "tagline", length = 300)
    private String tagline;

    public Shop() {
    }

    public Shop(User owner, String name, String address, LocalTime openTime, LocalTime closeTime) {
        this.owner = owner;
        this.name = name;
        this.address = address;
        this.openTime = openTime;
        this.closeTime = closeTime;
    }

    public Shop(User owner, String name, String address, LocalTime openTime, LocalTime closeTime,
                String imageUrl, Double rating, Integer ratingCount, String googleMapsUrl, String tagline) {
        this.owner = owner;
        this.name = name;
        this.address = address;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.imageUrl = imageUrl;
        this.rating = rating != null ? rating : 4.9;
        this.ratingCount = ratingCount != null ? ratingCount : 120;
        this.googleMapsUrl = googleMapsUrl;
        this.tagline = tagline;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalTime getOpenTime() {
        return openTime;
    }

    public void setOpenTime(LocalTime openTime) {
        this.openTime = openTime;
    }

    public LocalTime getCloseTime() {
        return closeTime;
    }

    public void setCloseTime(LocalTime closeTime) {
        this.closeTime = closeTime;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(Integer ratingCount) {
        this.ratingCount = ratingCount;
    }

    public String getGoogleMapsUrl() {
        return googleMapsUrl;
    }

    public void setGoogleMapsUrl(String googleMapsUrl) {
        this.googleMapsUrl = googleMapsUrl;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }
}

