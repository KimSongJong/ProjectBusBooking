package com.busbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(length = 20)
    private String phone;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "station_type", nullable = false)
    private StationType stationType = StationType.both;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum StationType {
        departure,  // Chỉ là điểm đi
        arrival,    // Chỉ là điểm đến
        both        // Cả đi và đến
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (stationType == null) {
            stationType = StationType.both;
        }
    }

    @PostLoad
    protected void onLoad() {
        // Fix any null values loaded from database
        if (stationType == null) {
            stationType = StationType.both;
        }
        if (isActive == null) {
            isActive = true;
        }
    }
}

