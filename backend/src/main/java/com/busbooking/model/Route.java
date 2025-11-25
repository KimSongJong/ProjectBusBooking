package com.busbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Route {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "from_location", nullable = false)
    private String fromLocation;
    
    @Column(name = "to_location", nullable = false)
    private String toLocation;
    
    @Column(name = "distance_km")
    private BigDecimal distanceKm;
    
    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice;
    
    @Column(name = "estimated_duration")
    private Integer estimatedDuration;
    
    @Column(name = "pickup_points", columnDefinition = "JSON")
    private String pickupPoints;

    @Column(name = "dropoff_points", columnDefinition = "JSON")
    private String dropoffPoints;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
